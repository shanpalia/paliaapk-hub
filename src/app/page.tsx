
'use client';

import { useState, useEffect } from "react";
import { supabase, AppData } from "@/lib/supabase";
import { AppCard } from "@/components/app-card";
import { Sparkles, LayoutGrid, Loader2, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HexagonLogo } from "@/components/logo";

export default function Home() {
  const [isSplash, setIsSplash] = useState(true);
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setApps(data);
        }
      } catch (err) {
        console.error("Hub Discovery: Repository scan failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

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
          <div className="w-full aspect-[21/10] rounded-[3rem] bg-gray-50 flex items-center justify-center border border-gray-100">
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hub Repository Empty</p>
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
            <span className="text-[9px] font-black text-emerald-700 uppercase">Secure</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 px-2">
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-[2.5rem]" />)
          ) : apps.length > 0 ? (
            apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
              <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No binaries published.</p>
            </div>
          )}
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
               <p className="text-[11px] font-black text-white/40 uppercase tracking-widest mt-2">Native Infrastructure Hosting v1.0</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
