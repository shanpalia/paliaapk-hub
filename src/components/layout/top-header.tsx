"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { HexagonLogo } from "@/components/logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function TopHeader() {
  const [tapCount, setTapCount] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const router = useRouter();

  const handleTitleTap = () => {
    const now = Date.now();
    if (now - lastTap < 600) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      
      if (newCount > 1 && newCount < 5) {
        toast({
          title: "Clearance Check",
          description: `Accessing gateway in ${5 - newCount} steps...`,
          duration: 800,
        });
      }

      if (newCount >= 5) {
        setTapCount(0);
        setShowPinDialog(true);
      }
    } else {
      setTapCount(1);
    }
    setLastTap(now);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "7227") {
      setShowPinDialog(false);
      setPin("");
      toast({
        title: "Protocol Authorized",
        description: "Entering secure infrastructure terminal...",
        className: "bg-primary text-white font-black"
      });
      router.push("/admin/login");
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid Hub Security Key.",
        variant: "destructive",
      });
      setPin("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass px-4 py-4 flex items-center justify-between border-b border-white/30">
        <div className="flex items-center gap-3">
          <div 
            onClick={handleTitleTap}
            className="cursor-pointer select-none flex items-center gap-2.5 group active:scale-95 transition-transform"
          >
            <HexagonLogo className="w-10 h-10" />
            <h1 className="text-xl font-black tracking-tighter font-headline">
              <span className="bg-gradient-to-r from-blue-500 via-emerald-500 to-mint-500 bg-clip-text text-transparent">
                PaliaAPK
              </span>{" "}
              Hub
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full w-11 h-11 hover:bg-primary/10 transition-colors"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/search')} 
            className="rounded-full w-11 h-11 bg-gray-50/80 hover:bg-gray-100 shadow-sm border border-white"
          >
            <Search className="h-5 w-5 text-foreground" />
          </Button>
        </div>
      </header>

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="max-w-[340px] rounded-[3.5rem] p-12 border-none shadow-3xl glass backdrop-blur-3xl">
          <DialogHeader className="pb-6">
            <div className="w-20 h-20 mx-auto mb-8 animate-float">
              <HexagonLogo />
            </div>
            <DialogTitle className="text-center text-3xl font-black font-headline tracking-tighter">
              Admin Gateway
            </DialogTitle>
            <DialogDescription className="text-center font-bold opacity-60 text-xs">
              Provide hub private security key to verify clearance level.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePinSubmit} className="space-y-8">
            <Input
              type="password"
              placeholder="••••"
              className="text-center text-4xl tracking-[0.6em] h-20 rounded-[2rem] bg-gray-50/80 border-none font-black placeholder:text-gray-200 shadow-inner"
              value={pin}
              maxLength={4}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full h-18 rounded-[2.5rem] font-black text-xl premium-gradient text-white shadow-2xl hover:scale-[1.03] transition-transform">
              Unlock Hub Terminal
            </Button>
          </form>
          <div className="flex items-center justify-center gap-2 mt-6">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <p className="text-[9px] text-center text-muted-foreground uppercase tracking-[0.3em] font-black">
              Triple-Pass Encryption
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
