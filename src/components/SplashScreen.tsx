
"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, LayoutGrid, Zap, Package, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreIcon } from "@/components/StoreIcon";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade-out animation
    }, 3200);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1.2 : 100));
    }, 30);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-in-out",
        !isVisible ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-white to-primary/5 pointer-events-none" />

      {/* Center Artwork Container */}
      <div className="relative w-full max-w-sm flex flex-col items-center px-6 animate-in fade-in zoom-in duration-1000">
        
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-[80px] animate-pulse" />
        
        {/* Illustration Section */}
        <div className="relative w-full aspect-square mb-8 flex items-center justify-center">
          {/* Base Smartphone Frame */}
          <div className="relative w-48 h-80 bg-white rounded-[2.5rem] border-[6px] border-slate-900 shadow-2xl flex flex-col items-center p-4 z-10 overflow-hidden">
             <div className="w-16 h-1 bg-slate-800 rounded-full mb-6" />
             {/* Content inside phone */}
             <div className="w-full h-full bg-muted/30 rounded-2xl flex flex-col gap-3 p-3 items-center justify-center">
                <StoreIcon size="lg" className="mb-4" />
                <div className="w-2/3 h-3 bg-muted rounded-full" />
                <div className="w-full h-3 bg-muted rounded-full opacity-50" />
                <div className="mt-auto w-full h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                   <div className="h-1.5 w-1/2 bg-primary rounded-full" />
                </div>
             </div>
          </div>

          {/* Floating Elements Around Phone */}
          <div className="absolute top-0 -left-4 p-4 bg-white rounded-2xl shadow-xl z-20 animate-bounce transition-all duration-[3000ms] delay-75">
             <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <div className="absolute bottom-10 -right-6 p-4 bg-white rounded-2xl shadow-xl z-20 animate-bounce transition-all duration-[2500ms] delay-500">
             <LayoutGrid className="h-8 w-8 text-blue-500" />
          </div>
          <div className="absolute top-20 -right-10 p-4 bg-white rounded-2xl shadow-xl z-20 animate-bounce transition-all duration-[4000ms] delay-1000">
             <Zap className="h-8 w-8 text-amber-500" />
          </div>
          <div className="absolute bottom-20 -left-12 p-4 bg-white rounded-2xl shadow-xl z-20 animate-bounce transition-all duration-[3500ms] delay-300">
             <ShieldCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>

        {/* Branding Section */}
        <div className="text-center space-y-3 relative z-30">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse">
            <Package className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Premium APK Store</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground">
            PLKAPK <span className="text-primary italic">Hub</span>
          </h1>
          <p className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground/50">
            Verified Android Apps
          </p>
        </div>
      </div>

      {/* Bottom Loading Area */}
      <div className="absolute bottom-12 flex flex-col items-center space-y-8 w-full max-w-[240px]">
        {/* Loading Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative shadow-inner">
          <div 
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-75 ease-out rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/30">
            Developed by Shan Palia
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="h-1 w-1 bg-muted-foreground/20 rounded-full" />
            <p className="text-[9px] font-bold text-muted-foreground/20 tracking-tighter">
              VERSION 1.0.0
            </p>
            <span className="h-1 w-1 bg-muted-foreground/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
