"use client";

import { useState } from "react";
import { getAuth } from "firebase/auth";
import { ArrowLeft, CloudUpload, Loader2, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const API = (process.env.NEXT_PUBLIC_CLOUDFLARE_API_URL || "https://paliaapk-api.shanpalia786.workers.dev").replace(/\/$/, "");
const EXPECTED = 273;

type Cursor = { bucketIndex: number; offset: number } | null;
type Result = { success: boolean; bucket?: string; listed?: number; copied?: number; skipped?: number; failed?: { name: string; status: number }[]; next?: Cursor; done?: boolean; error?: string; detail?: string };

export default function ImageMigrationPage() {
  const [cursor, setCursor] = useState<Cursor>({ bucketIndex: 0, offset: 0 });
  const [copied, setCopied] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  async function runBatch() {
    if (busy || done || !cursor) return;
    setBusy(true);
    setError("");
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error("Pehle admin account se sign in karein.");
      const token = await user.getIdToken();
      const response = await fetch(API + "/admin/migrate-supabase-images", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ ...cursor, limit: 10 }),
        cache: "no-store",
      });
      const data = await response.json() as Result;
      if (!response.ok || !data.success) throw new Error(data.error ? data.error + (data.detail ? ": " + data.detail : "") : "Migration batch failed");
      const amount = data.copied || 0;
      setCopied(v => v + amount);
      setLogs(v => [...v, (data.bucket || "bucket") + ": " + amount + " files copied"]);
      setCursor(data.next ?? null);
      setDone(Boolean(data.done || !data.next));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  const percent = Math.min(100, Math.round((copied / EXPECTED) * 100));

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="rounded-xl border p-2 text-gray-600 hover:bg-gray-50" aria-label="Back to admin"><ArrowLeft size={18} /></Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">PaliaAPK HUB</p>
          <h1 className="text-2xl font-bold text-gray-900">Image Migration</h1>
        </div>
      </div>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
        <div className="flex items-center gap-2 text-emerald-800"><ShieldCheck size={20} /><span className="font-semibold">Secure storage transfer</span></div>
        <p className="mt-2 text-sm leading-6 text-gray-700">Supabase ke public image buckets se Cloudflare R2 ke <b>paliaapk-hub</b> bucket mein images copy hongi. Supabase originals delete nahi honge. APK files is migration mein shamil nahi hain.</p>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Copied images</p><p className="text-3xl font-bold tabular-nums text-gray-900">{copied}<span className="text-base font-medium text-gray-400"> / approx. {EXPECTED}</span></p></div>
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><CloudUpload size={26} /></div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: percent + "%" }} /></div>
        <p className="mt-2 text-xs text-gray-500">{percent}% of the previously counted images. Final count may differ if the source changed.</p>

        {error && <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertTriangle size={18} className="shrink-0" />{error}</div>}
        {done && <div className="mt-4 flex gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={18} />Migration listing complete. Check the R2 bucket before changing website image URLs.</div>}

        <Button className="mt-5 w-full" onClick={runBatch} disabled={busy || done || !cursor}>
          {busy ? <><Loader2 size={17} className="mr-2 animate-spin" />Copying up to 10 images…</> : done ? "Migration complete" : copied > 0 ? "Continue migration (next 10)" : "Start image migration"}
        </Button>
        <p className="mt-3 text-center text-xs text-gray-500">One click processes at most 10 images. Click Continue until complete.</p>
      </section>

      {logs.length > 0 && <section className="rounded-2xl border bg-white p-5"><h2 className="mb-3 font-semibold text-gray-900">Activity</h2><ul className="space-y-2 text-sm text-gray-600">{logs.map((line, i) => <li key={i}>• {line}</li>)}</ul></section>}

      <p className="text-xs leading-5 text-gray-500">Note: This first migration pass copies files in their original format; it does not convert them to WebP. Existing site image URLs are not changed automatically. Verify the copied objects and public R2 access before switching the storefront.</p>
    </div>
  );
}
