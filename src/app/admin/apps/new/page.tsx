"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Keep the legacy URL working, but route publishing through the Cloudflare D1/R2 form.
export default function NewAppRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/add");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <span className="sr-only">Opening Cloudflare publishing form…</span>
    </div>
  );
}
