
"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Download, Star, ShieldCheck, Loader2, Lock, Box, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, AppData } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function AppDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const appId = params.id as string;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const fetchApp = async () => {
      const { data, error } = await supabase.from('apps').select('*').eq('id', appId).single();
      if (!error) setApp(data);
      setLoading(false);
    };

    if (appId) fetchApp();
  }, [appId]);

  const handleDownload = async () => {
    if (!user) {
      toast({ title: "Hub Handshake Failed", description: "Identity verification required for binary transfer.", variant: "destructive" });
      router.push("/profile");
      return;
    }

    if (app?.apk_url) {
      window.open(app.apk_url, "_blank");
      toast({ title: "Transfer Initialized", description: `Downloading ${app.app_name} package...` });
      
      // Increment counter
      supabase.from('apps').update({ downloads: (app.downloads || 0) + 1 }).eq('id', appId);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Scanning Hub Binary...</p>
      </div>
    );
  }

  if (!app) return <div className="text-center py-20 font-black">Entry Not Found</div>;

  return (
    <div className="pb-24 space-y-12 animate-in fade-in duration-700">
      <section className="flex gap-10 items-center px-4">
        <div className="relative w-36 h-36 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white shrink-0">
          <Image src={app.icon_url} alt={app.app_name} fill className="object-cover" />
        </div>
        <div className="flex-1 space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-none">{app.app_name}</h1>
          <p className="text-primary font-black text-sm uppercase tracking-widest">{app.developer}</p>
          <div className="flex items-center gap-6 pt-6">
            <div className="text-center">
               <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Rating</p>
               <span className="font-black text-lg">4.9 <Star className="inline h-4 w-4 fill-primary text-primary" /></span>
            </div>
            <div className="text-center">
               <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Storage</p>
               <span className="font-black text-lg">{app.apk_size || "N/A"}</span>
            </div>
            <div className="text-center">
               <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Traffic</p>
               <span className="font-black text-lg">{app.downloads.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 space-y-4">
        <Button className="w-full h-20 rounded-[2rem] text-2xl font-black premium-gradient text-white shadow-xl hover:scale-[1.01] transition-all" onClick={handleDownload}>
          {user ? <><Download className="mr-3 h-8 w-8" /> Download APK</> : <><Lock className="mr-3 h-8 w-8" /> Authenticate to Access</>}
        </Button>
        <div className="flex gap-4">
           <Badge variant="secondary" className="flex-1 h-14 rounded-2xl font-black justify-center">Version: {app.version}</Badge>
           <Badge variant="secondary" className="flex-1 h-14 rounded-2xl font-black justify-center">{app.category}</Badge>
        </div>
      </section>

      <section className="px-4 space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-3xl font-black tracking-tight">Hub Distribution Matrix</h2>
           <Badge className="premium-gradient font-black text-[9px] uppercase">Verified</Badge>
        </div>
        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-50">
           <p className="text-muted-foreground text-lg leading-relaxed font-medium whitespace-pre-wrap">{app.description}</p>
        </div>
        
        {app.screenshot_url && (
          <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
             <Image src={app.screenshot_url} alt="App Preview" fill className="object-cover" />
          </div>
        )}
      </section>

      <section className="mx-4 p-10 bg-black text-white rounded-[3rem] shadow-2xl flex items-center gap-8">
         <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
            <ShieldCheck className="h-10 w-10 text-white" />
         </div>
         <div>
            <h3 className="text-xl font-black">Native Hub Verification</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Sandbox Scanned & Protocol Approved</p>
         </div>
      </section>
    </div>
  );
}
