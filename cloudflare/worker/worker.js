const ADMIN_EMAIL = "shanpalia786@gmail.com";
const FIREBASE_PROJECT_ID = "shanpalia-apk-hub";
const JWT_KEYS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*" } });
}
function cors() {
  return { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS", "access-control-allow-headers": "Authorization,Content-Type" };
}
function b64url(input) {
  const s = input.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(s.padEnd(Math.ceil(s.length / 4) * 4, "=")), c => c.charCodeAt(0));
}
async function verifyAdmin(request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const header = JSON.parse(new TextDecoder().decode(b64url(parts[0])));
    const claims = JSON.parse(new TextDecoder().decode(b64url(parts[1])));
    if (header.alg !== "RS256" || !header.kid || claims.aud !== FIREBASE_PROJECT_ID ||
        claims.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}` ||
        claims.email?.toLowerCase() !== ADMIN_EMAIL || claims.email_verified !== true ||
        claims.exp <= Math.floor(Date.now() / 1000)) return false;
    const keyResponse = await fetch(JWT_KEYS_URL, { cf: { cacheTtl: 3600 } });
    if (!keyResponse.ok) return false;
    const keys = await keyResponse.json();
    const jwk = keys.keys?.find(k => k.kid === header.kid);
    if (!jwk) return false;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    return crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
  } catch { return false; }
}
function assetUrl(request, key) { return new URL(`/assets/${key.split("/").map(encodeURIComponent).join("/")}`, request.url).toString(); }

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors() });
    const url = new URL(request.url);
    try {
      if (url.pathname === "/health") return json({ ok: true, service: "paliaapk-api" });
      if (url.pathname === "/apps" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM apps WHERE COALESCE(is_hidden, 0) = 0 ORDER BY created_at DESC").all();
        return json({ success: true, apps: results || [] });
      }
      if (url.pathname.startsWith("/apps/") && request.method === "GET") {
        const id = decodeURIComponent(url.pathname.slice(6));
        const app = await env.DB.prepare("SELECT * FROM apps WHERE id = ? AND COALESCE(is_hidden, 0) = 0").bind(id).first();
        return app ? json({ success: true, app }) : json({ success: false, error: "App not found" }, 404);
      }
      if (url.pathname.startsWith("/assets/") && request.method === "GET") {
        const key = url.pathname.slice(8).split("/").map(decodeURIComponent).join("/");
        const object = await env.ASSETS.get(key);
        if (!object) return new Response("Not found", { status: 404 });
        const headers = new Headers(cors());
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("cache-control", "public, max-age=31536000, immutable");
        return new Response(object.body, { headers });
      }
      if (url.pathname.startsWith("/apps/") && url.pathname.endsWith("/download") && request.method === "POST") {
        const id = decodeURIComponent(url.pathname.split("/")[2]);
        await env.DB.prepare("UPDATE apps SET downloads = COALESCE(downloads, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();
        const row = await env.DB.prepare("SELECT downloads FROM apps WHERE id = ?").bind(id).first();
        return json({ success: true, downloads: row?.downloads ?? 0 });
      }
      if (!await verifyAdmin(request)) return json({ success: false, error: "Admin authentication required" }, 401);
      if (url.pathname === "/admin/apps" && request.method === "POST") {
        const body = await request.json();
        if (!body.app_name || !body.version) return json({ success: false, error: "app_name and version are required" }, 400);
        const id = crypto.randomUUID();
        await env.DB.prepare(`INSERT INTO apps (id, app_name, name, package_name, version, developer, category, description, whats_new, icon_url, apk_url, apk_file_name, screenshot_url, screenshots, banner_url, apk_size, downloads, featured, is_featured, is_hidden, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
          .bind(id, body.app_name, body.app_name, body.package_name || "", body.version, body.developer || "", body.category || "General", body.description || "", body.whats_new || "", body.icon_url || "", body.apk_url || "", body.apk_file_name || "", body.screenshot_url || "", JSON.stringify(body.screenshots || []), body.banner_url || "", body.apk_size || "", body.featured ? 1 : 0, body.is_featured ? 1 : 0, body.is_hidden ? 1 : 0).run();
        return json({ success: true, id }, 201);
      }
      if (url.pathname.startsWith("/admin/apps/") && request.method === "PATCH") {
        const id = decodeURIComponent(url.pathname.slice("/admin/apps/".length));
        const body = await request.json();
        const allowed = ["app_name","name","package_name","version","developer","category","description","whats_new","icon_url","apk_url","apk_file_name","screenshot_url","screenshots","banner_url","apk_size","featured","is_featured","is_hidden"];
        const fields = Object.keys(body).filter(k => allowed.includes(k));
        if (!fields.length) return json({ success: false, error: "No editable fields supplied" }, 400);
        const values = fields.map(k => k === "screenshots" ? JSON.stringify(body[k]) : (["featured","is_featured","is_hidden"].includes(k) ? (body[k] ? 1 : 0) : body[k]));
        const sql = fields.map(k => `${k} = ?`).join(", ");
        await env.DB.prepare(`UPDATE apps SET ${sql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...values, id).run();
        return json({ success: true });
      }
      if (url.pathname.startsWith("/admin/apps/") && request.method === "DELETE") {
        const id = decodeURIComponent(url.pathname.slice("/admin/apps/".length));
        await env.DB.prepare("DELETE FROM apps WHERE id = ?").bind(id).run();
        return json({ success: true });
      }
      if (url.pathname === "/admin/upload" && request.method === "POST") {
        const form = await request.formData();
        const file = form.get("file");
        const folder = String(form.get("folder") || "misc");
        if (!(file instanceof File)) return json({ success: false, error: "file is required" }, 400);
        if (!["apk","icons","screenshots"].includes(folder)) return json({ success: false, error: "Invalid folder" }, 400);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `${folder}/${crypto.randomUUID()}-${safeName}`;
        await env.ASSETS.put(key, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
        return json({ success: true, key, url: assetUrl(request, key), size: file.size, fileName: safeName }, 201);
      }
      if (url.pathname === "/admin/categories" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM categories ORDER BY name").all();
        return json({ success: true, categories: results || [] });
      }
      return json({ success: false, error: "Not found" }, 404);
    } catch (error) {
      return json({ success: false, error: error?.message || "Internal error" }, 500);
    }
  }
};
