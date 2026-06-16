
"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Download, Share2, Star, ShieldCheck, Loader2, Lock, Box, Activity, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useDoc, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { AppEntry } from "@/lib/types";
import { doc, updateDoc, increment } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function AppDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const appId = params.id as string;

  const appRef = useMemoFirebase(() => {
    if (!db || !appId) return null;
    return doc(db, "apps", appId);
  }, [db, appId]);

  const { data: app, loading } = useDoc<AppEntry>(appRef);

  const handleDownload = async () => {
    if (!user) {
      toast({
        title: "Security Gate",
        description: "Please authenticate to access hub binaries.",
        variant: "destructive",
      });
      router.push("/profile");
      return;
    }

    if (app?.apkUrl) {
      window.open(app.apkUrl, "_blank");
      toast({
        title: "Initializing Transfer",
        description: `Downloading latest binary: ${app.appName} v${app.version}...`,
      });

      // Increment Traffic Counter
      if (db && appId) {
        const docRef = doc(db, "apps", appId);
        updateDoc(docRef, { downloads: increment(1) });
      }
    } else {
      toast({
        title: "Processing Binary",
        description: "This version is currently being scanned and finalized.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Verifying PaliaAPK Integrity...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-32 space-y-6">
        <h2 className="text-4xl font-black font-headline">Entry Void</h2>
        <p className="text-muted-foreground font-medium">The requested binary signature does not exist.</p>
        <Button onClick={() => router.push("/")} className="rounded-full h-14 px-10 font-bold">Return to Hub</Button>
      </div>
    );
  }

  const defaultIcon = `https://picsum.photos/seed/${app.id}/400/400`;

  return (
    <div className="pb-20 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <section className="flex gap-8 items-center px-2">
        <div className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white flex-shrink-0 animate-float">
          <Image 
            src={app.iconUrl || defaultIcon} 
            alt={app.appName} 
            fill 
            className="object-cover" 
          />
        </div>
        <div className="flex-1 space-y-2">
          <h1 className="text-4xl font-black font-headline tracking-tighter leading-tight">{app.appName}</h1>
          <p className="text-primary font-black text-sm uppercase tracking-widest">{app.developer || "PaliaAPK Hub"}</p>
          <div className="flex items-center gap-6 pt-4">
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Rating</p>
              <div className="flex items-center justify-center gap-1 font-black text-lg text-yellow-500">
                4.9 <Star className="h-4 w-4 fill-yellow-500" />
              </div>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Storage</p>
              <span className="font-black text-lg">{app.apkSize || "N/A"}</span>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Traffic</p>
              <span className="font-black text-lg">{app.downloads?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 px-2">
        <Button 
          className="flex-1 rounded-[2rem] h-20 text-xl font-black shadow-2xl premium-gradient text-white hover:scale-[1.01] active:scale-95 transition-all" 
          onClick={handleDownload}
        >
          {user ? (
            <>
              <Download className="mr-3 h-7 w-7" /> {app.updatedAt ? 'INSTALL UPDATE' : 'INITIALIZE TRANSFER'}
            </>
          ) : (
            <>
              <Lock className="mr-3 h-7 w-7" /> LOGIN TO ACCESS
            </>
          )}
        </Button>
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest">
            Latest Version: v{app.version}
          </Button>
          <Button variant="secondary" size="icon" className="h-14 w-14 rounded-2xl glass shadow-lg">
            <Share2 className="h-6 w-6 text-primary" />
          </Button>
        </div>
      </section>

      {app.screenshots && app.screenshots.length > 0 && (
        <section className="px-2">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 pb-4">
              {app.screenshots.map((src, i) => (
                <div key={i} className="relative w-64 aspect-[9/16] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl group transition-transform hover:scale-[1.02]">
                  <Image src={src} alt="screenshot" fill className="object-cover" />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      )}

      <section className="space-y-12 px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black font-headline tracking-tight">Intelligence Report</h2>
            <Badge className="rounded-full premium-gradient px-4 py-1 text-[10px] font-black uppercase">Verified</Badge>
          </div>
          <div className="glass rounded-[3rem] p-8">
            <p className="text-muted-foreground text-base leading-relaxed font-medium whitespace-pre-wrap">
              {app.description || "Verified binary distribution provided by the PaliaAPK Hub Network."}
            </p>
          </div>
        </div>

        {app.whatsNew && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <History className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-black font-headline tracking-tight">What's New</h2>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-[3rem] p-8">
              <p className="text-primary/80 text-sm font-bold uppercase tracking-widest mb-4">Version {app.version} Highlights</p>
              <p className="text-muted-foreground text-base leading-relaxed font-medium whitespace-pre-wrap">
                {app.whatsNew}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="mx-4 p-8 glass rounded-[3rem] border border-primary/20 flex items-start gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white flex-shrink-0 shadow-xl shadow-primary/30">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black tracking-tight">PaliaAPK Hub Core Scanning</h3>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            Release v{app.version} has cleared the triple-pass security protocol. Guaranteed free from invasive trackers and malware.
          </p>
        </div>
      </section>

      <section className="space-y-6 px-4">
        <h2 className="text-2xl font-black font-headline tracking-tight">Technical Matrix</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Signature", val: app.version, icon: Activity },
            { label: "Traffic", val: `${app.downloads?.toLocaleString() || 0}`, icon: Box },
            { label: "Entity", val: app.developer || "PaliaAPK Hub", icon: ShieldCheck },
            { label: "Protocol", val: app.packageName || "unknown", icon: Box }
          ].map((item, i) => (
            <div key={i} className="glass p-6 rounded-[2rem] flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{item.label}</p>
                <item.icon className="h-4 w-4 text-primary opacity-40" />
              </div>
              <p className="font-black text-lg truncate pr-2">{item.val}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
