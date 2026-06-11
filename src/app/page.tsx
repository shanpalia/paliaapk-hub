
"use client";

import { useState, useEffect } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/use-memo-firebase";
import { AppCard } from "@/components/app-card";
import { AppEntry } from "@/lib/types";
import { Sparkles, Zap, ShieldCheck, LayoutGrid, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HexagonLogo } from "@/components/logo";

export default function Home() {
  const [isSplash, setIsSplash] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    const timer = setTimeout(() => setIsSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Load all apps where status == "published"
  const publishedAppsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "apps"), 
      where("status", "==", "published"),
      where("isHidden", "==", false)
    );
  }, [db]);

  const { data: apps, loading } = useCollection<AppEntry>(publishedAppsQuery);

  const featuredApp = apps?.find(a => a.isFeatured) || apps?.[0];

  if (isSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="w-32 h-32 mb-8 animate-float">
          <HexagonLogo />
        </div>
        <h1 className="text-4xl font-black font-headline tracking-tighter mb-2">
          <span className="bg-gradient-to-r from-blue-500 via-emerald-500 to-mint-500 bg-clip-text text-transparent">
            PaliaAPK
          </span>{" "}
          Hub
        </h1>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-12">
          Verified Binary Hub
        </p>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="px-1">
        {loading ? (
          <Skeleton className="w-full aspect-[21/10] rounded-[3rem]" />
        ) : featuredApp ? (
          <AppCard app={featuredApp} variant="large" />
        ) : (
          <div className="w-full aspect-[21/10] rounded-[3rem] bg-gray-50 flex flex-col items-center justify-center border border-gray-100 shadow-inner">
            <Zap className="h-10 w-10 mb-4 text-primary opacity-20" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hub Terminal Connected</p>
          </div>
        )}
      </section>

      {/* Main Hub Listing */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black font-headline tracking-tighter flex items-center gap-2 uppercase">
            <LayoutGrid className="h-6 w-6 text-primary" /> Hub Repository
          </h2>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 px-2">
          {loading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-[2.5rem]" />)
          ) : apps && apps.length > 0 ? (
            apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
              <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">No published binaries available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Security Banner */}
      <section className="px-2">
        <div className="bg-black rounded-[3rem] p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black font-headline tracking-tight">Triple-Pass Encryption</h3>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mt-1">Verified GitHub Sources Only</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
