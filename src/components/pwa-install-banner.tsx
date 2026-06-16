
'use client';

import { usePWA } from '@/app/pwa-provider';
import { Button } from '@/components/ui/button';
import { Download, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HexagonLogo } from './logo';

export function PWAInstallBanner() {
  const { isInstallable, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner after a slight delay if installable
    if (isInstallable) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  if (!isVisible || !isInstallable) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[60] animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-black text-white p-5 rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <HexagonLogo className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-tight flex items-center gap-1.5">
              PaliaAPK Hub <Sparkles className="w-3 h-3 text-primary" />
            </h4>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-0.5">Install the Hub Terminal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={installApp}
            className="rounded-full px-5 h-10 premium-gradient text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20"
          >
            <Download className="w-3.5 h-3.5 mr-2" /> Install
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-10 w-10 text-white/30 hover:text-white"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
