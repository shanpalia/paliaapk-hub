import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) return cb(new Error("Only image files are allowed."));
    cb(null, true);
  },
});

const PORT = Number(process.env.PORT || 10000);
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHANNEL_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const PUBLIC_ORIGIN = (process.env.PUBLIC_ORIGIN || "").replace(/\/$/, "");

app.disable("x-powered-by");
app.use((req, res, next) => {
  const allowed = (process.env.ALLOWED_ORIGINS || "https://paliaapkhub.com,https://www.paliaapkhub.com").split(",").map(v => v.trim()).filter(Boolean);
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function requireTelegramConfig() {
  if (!BOT_TOKEN || !CHAT_ID) {
    const err = new Error("Telegram media storage is not configured on the backend.");
    err.status = 503;
    throw err;
  }
}

async function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token || !SUPABASE_URL || !SUPABASE_ANON_KEY) return res.status(401).json({ error: "Admin sign-in required." });
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user || data.user.email !== "shanpalia786@gmail.com") return res.status(403).json({ error: "Admin access denied." });
    next();
  } catch {
    res.status(401).json({ error: "Could not verify admin session." });
  }
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "paliaapk-telegram-media-api" }));

app.post("/media", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    requireTelegramConfig();
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Image file is required." });
    const form = new FormData();
    form.append("chat_id", CHAT_ID);
    form.append("document", new Blob([file.buffer], { type: file.mimetype }), file.originalname || "image");
    form.append("caption", "PaliaAPK HUB media storage");
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, { method: "POST", body: form });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      console.error("Telegram upload failed:", result?.description || response.status);
      return res.status(502).json({ error: "Telegram could not store this image." });
    }
    const message = result.result;
    const document = message?.document;
    if (!document?.file_id) return res.status(502).json({ error: "Telegram did not return an image file ID." });
    const mediaUrl = `${PUBLIC_ORIGIN}/media/${encodeURIComponent(document.file_id)}`;
    res.json({ ok: true, file_id: document.file_id, url: mediaUrl, file_name: document.file_name || file.originalname, size: document.file_size || file.size });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: status === 503 ? error.message : "Image upload failed." });
  }
});

app.get("/media/:fileId", async (req, res) => {
  try {
    requireTelegramConfig();
    const fileId = req.params.fileId;
    if (!fileId || fileId.length > 2048) return res.status(400).end("Invalid file ID");
    const infoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`);
    const info = await infoResponse.json();
    if (!infoResponse.ok || !info.ok || !info.result?.file_path) return res.status(404).end("Media not found");
    const fileResponse = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${info.result.file_path}`);
    if (!fileResponse.ok) return res.status(502).end("Could not retrieve media");
    res.setHeader("Content-Type", fileResponse.headers.get("content-type") || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(200);
    if (!fileResponse.body) return res.end();
    const reader = fileResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch {
    if (!res.headersSent) res.status(503).end("Telegram media storage is unavailable");
    else res.end();
  }
});

app.use((error, _req, res, _next) => {
  if (error?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "Image must be 10 MB or smaller." });
  if (error?.message === "Only image files are allowed.") return res.status(415).json({ error: error.message });
  res.status(400).json({ error: "Invalid upload request." });
});

app.listen(PORT, () => console.log(`Telegram media API listening on ${PORT}`));
