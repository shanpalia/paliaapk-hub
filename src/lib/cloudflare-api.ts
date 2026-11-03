import { getAuth } from "firebase/auth";

export const CLOUDFLARE_API_URL =
  (process.env.NEXT_PUBLIC_CLOUDFLARE_API_URL || "https://paliaapk-api.shanpalia786.workers.dev").replace(/\/$/, "");

export type CloudflareApp = {
  id: string;
  app_name: string;
  name?: string;
  package_name?: string;
  version: string;
  developer?: string;
  category?: string;
  description?: string;
  whats_new?: string;
  icon_url?: string;
  apk_url?: string;
  apk_file_name?: string;
  screenshot_url?: string;
  screenshots?: string[] | string;
  banner_url?: string;
  apk_size?: string;
  downloads?: number;
  featured?: number | boolean;
  is_featured?: number | boolean;
  is_hidden?: number | boolean;
  created_at?: string;
  updated_at?: string;
};

async function authHeaders(): Promise<Record<string, string>> {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Please sign in with the admin account.");
  return { Authorization: `Bearer ${await user.getIdToken()}` };
}

async function request<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (authenticated) {
    const auth = await authHeaders();
    Object.entries(auth).forEach(([key, value]) => headers.set(key, value));
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${CLOUDFLARE_API_URL}${path}`, { ...init, headers, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Cloudflare API request failed (${response.status})`);
  return data as T;
}

export const cloudflareApi = {
  listApps: () => request<{ success: boolean; apps: CloudflareApp[] }>("/apps"),
  getApp: (id: string) => request<{ success: boolean; app: CloudflareApp }>(`/apps/${encodeURIComponent(id)}`),
  createApp: (app: Partial<CloudflareApp>) =>
    request<{ success: boolean; id: string }>("/admin/apps", { method: "POST", body: JSON.stringify(app) }, true),
  updateApp: (id: string, patch: Partial<CloudflareApp>) =>
    request<{ success: boolean }>(`/admin/apps/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) }, true),
  deleteApp: (id: string) =>
    request<{ success: boolean }>(`/admin/apps/${encodeURIComponent(id)}`, { method: "DELETE" }, true),
  upload: async (file: File, folder: "apk" | "icons" | "screenshots") => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    return request<{ success: boolean; key: string; url: string; size: number; fileName: string }>(
      "/admin/upload", { method: "POST", body: form }, true
    );
  },
  incrementDownload: (id: string) =>
    request<{ success: boolean; downloads: number }>(`/apps/${encodeURIComponent(id)}/download`, { method: "POST" }),
  listCategories: () => request<{ success: boolean; categories: { id: string; name: string; icon_name: string }[] }>("/admin/categories", {}, true),
};
