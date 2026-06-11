
"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Download } from "lucide-react";
import { AppEntry } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

interface AppCardProps {
  app: AppEntry;
  variant?: 'compact' | 'large';
}

export function AppCard({ app, variant = 'compact' }: AppCardProps) {
  const db = useFirestore();
  const displayIcon = app.iconUrl || `https://picsum.photos/seed/${app.id}/200/200`;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (app.apkUrl) {
      window.open(app.apkUrl, "_blank");
      // Background increment of traffic
      if (db) {
        const appRef = doc(db, "apps", app.id);
        updateDoc(appRef, { downloads: increment(1) });
      }
    }
  };

  if (variant === 'large') {
    return (
      <Link href={`/app/${app.id}`} className="block group">
        <div className="relative aspect-[21/10] rounded-[3rem] overflow-hidden mb-3 shadow-2xl transition-all active:scale-[0.98]">
          <Image
            src={displayIcon}
            alt={app.appName}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-1000"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white flex items-end justify-between">
            <div className="space-y-3 max-w-[70%]">
              <div className="bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 w-fit">
                Featured Release
              </div>
              <h3 className="font-black text-3xl font-headline tracking-tighter leading-none">{app.appName}</h3>
              <p className="text-xs text-white/70 line-clamp-1 font-bold italic">Verified by {app.developer || "ShanPalia"}</p>
            </div>
            <div className="bg-white text-primary px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-primary hover:text-white transition-colors">
              Details
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/app/${app.id}`} className="flex items-center gap-5 p-5 glass rounded-[2.5rem] transition-all group hover:shadow-xl hover:bg-white border border-gray-100/50">
      <div className="relative w-20 h-20 rounded-[1.75rem] overflow-hidden shadow-lg border border-white flex-shrink-0 bg-gray-50">
        <img
          src={displayIcon}
          alt={app.appName}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-black text-lg truncate text-foreground font-headline tracking-tighter leading-tight group-hover:text-primary transition-colors">
            {app.appName}
          </h3>
          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md shrink-0">
            v{app.version}
          </span>
        </div>
        
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
          {app.developer || "ShanPalia"} • {app.category}
        </p>

        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-2 font-medium">
          {app.downloads?.toLocaleString() || 0} downloads
        </p>

        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span className="text-[9px] font-black text-emerald-700 uppercase">Hub Verified</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleDownload}
        className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all group/btn"
      >
        <Download className="h-6 w-6" />
      </button>
    </Link>
  );
}
