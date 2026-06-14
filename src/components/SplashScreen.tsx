
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade-out animation
    }, 3000);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1.5 : 100));
    }, 40);

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
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Center Content */}
      <div className="relative flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-1000">
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-[60px] animate-pulse" />
        
        {/* Logo Icon */}
        <div className="relative h-32 w-32 bg-primary rounded-[2.5rem] flex items-center justify-center text-primary-foreground font-black text-6xl shadow-2xl shadow-primary/40 transform transition-transform duration-[2000ms] hover:scale-105">
          P
        </div>

        {/* Brand Name */}
        <div className="text-center space-y-2 relative z-10">
          <h1 className="text-4xl font-black tracking-tighter text-foreground">
            PLKAPK <span className="text-primary italic">Hub</span>
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            Verified Android Apps
          </p>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-12 flex flex-col items-center space-y-8 w-full max-w-[200px]">
        {/* Loading Indicator */}
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-100 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
            Developed by Shan Palia
          </p>
          <p className="text-[9px] font-bold text-muted-foreground/20">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
