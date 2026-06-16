
'use client';

import { useState, useEffect } from "react";
import { supabase, AppData } from "@/lib/supabase";
import { AppCard } from "@/components/app-card";
import { Sparkles, LayoutGrid, ShieldCheck, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HexagonLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isSplash, setIsSplash] = useState(true);
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    setErrorInfo(null);
    try {
      console.log("Hub Discovery: Scanning registry...");
      
      // Attempt to fetch apps. We query the table broadly and handle filtering in-memory
      // to avoid hard SQL errors if the 'is_hidden' column is missing from the schema.
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        const technicalMsg = error.message || error.details || "Unknown Supabase Protocol Error";
        console.error("Hub Discovery: Supabase query fault", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setErrorInfo(technicalMsg);
        return;
      }

      if (data) {
        // Filter hidden apps in-memory to ensure UI resilience
        const publishedApps = data.filter(app => app.is_hidden !== true);
        console.log(`Hub Discovery: Found ${publishedApps.length} published binaries.`);
        setApps(publishedApps);
      }
    } catch (err: any) {
      console.error("Hub Discovery: Critical repository scan failed", err);
      setErrorInfo(err.message || "Critical Discovery Failure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSplash) {
      fetchApps();
    }
  }, [isSplash]);

  if (isSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
        <div className="w-32 h-32 mb-8 animate-float">
          <HexagonLogo />
        </div>
        <h1 className="text-4xl font-black font-headline tracking-tighter mb-2">
          PaliaAPK <span className="text-primary italic">Hub</span>
        </h1>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Verified Binary Terminal</p>
      </div>
    );
  }

  const featuredApp = apps.find(a => a.is_featured) || apps[0];

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      <section className="px-1">
        {loading ? (
          <Skeleton className="w-full aspect-[21/10] rounded-[3rem]" />
        ) : featuredApp ? (
          <AppCard app={featuredApp} variant="large" />
        ) : (
          <div className="w-full aspect-[21/10] rounded-[3rem] bg-gray-50 flex flex-col items-center justify-center border border-gray-100 gap-4">
             <LayoutGrid className="h-10 w-10 text-muted-foreground/20" />
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Featured Section Empty</p>
          </div>
        )}
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight">
            <LayoutGrid className="h-6 w-6 text-primary" /> Discovery Hub
          </h2>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[9px] font-black text-emerald-700 uppercase">Secure Hub</span>
          </div>
        </div>

        {errorInfo && (
          <div className="mx-4 p-8 bg-red-50 border border-red-100 rounded-[2.5rem] space-y-4 animate-in shake-1">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-xs font-black uppercase tracking-widest">Discovery Protocol Fault</p>
            </div>
            <p className="text-[10px] font-mono text-red-500 break-all bg-white/60 p-4 rounded-2xl border border-red-100/50 leading-relaxed">
              {errorInfo}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchApps} 
              className="rounded-full h-10 px-6 font-black text-[10px] uppercase border-red-200 text-red-600 hover:bg-red-100 transition-colors"
            >
               <RefreshCw className="h-3 w-3 mr-2" /> Restart Discovery Scan
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 px-2">
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-[2.5rem]" />)
          ) : apps.length > 0 ? (
            apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))
          ) : !errorInfo ? (
            <div className="text-center py-24 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
              <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Hub Repository Empty</p>
              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase mt-2">Publish binaries in the admin console to populate this feed.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-2">
        <div className="bg-black rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-inner">
               <ShieldCheck className="h-12 w-12 text-primary" />
            </div>
            <div>
               <h3 className="text-2xl font-black tracking-tight leading-tight">Supabase Protected Distribution</h3>
               <p className="text-[11px] font-black text-white/40 uppercase tracking-widest mt-2">Native Infrastructure Hosting Active</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
