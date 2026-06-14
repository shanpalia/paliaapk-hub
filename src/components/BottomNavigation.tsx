
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, LayoutGrid, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [clickCount, setClickCount] = useState(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleProfileClick = (e: React.MouseEvent) => {
    // Increment count
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    console.log(`[BottomNav] Profile Click: ${newCount}/5`);

    // Reset timer for 5 seconds
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      console.log("[BottomNav] Click counter reset after 5s");
      setClickCount(0);
    }, 5000);

    // Provide toast feedback for every click
    toast({ 
      title: `Click ${newCount}/5`, 
      description: newCount === 5 ? "Secret Mode Activated" : undefined,
      duration: 1000 
    });

    if (newCount >= 5) {
      console.log("[BottomNav] 5th click reached - Intercepting navigation");
      e.preventDefault();
      e.stopPropagation();

      const currentCount = newCount;
      setClickCount(0);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

      // Brief delay to allow toast to appear and event loop to cycle
      setTimeout(() => {
        console.log("[BottomNav] Opening Security PIN Prompt");
        const pin = window.prompt("Enter Security PIN");
        console.log(`[BottomNav] PIN entered: ${pin}`);

        if (pin === "7227") {
          console.log("[BottomNav] PIN Correct - Redirecting to Admin Login");
          router.push("/auth/login?admin=true");
        } else if (pin !== null) {
          console.log("[BottomNav] PIN Incorrect");
          toast({ 
            variant: "destructive", 
            title: "Invalid Security PIN",
            description: "Access denied."
          });
        }
      }, 100);
    }
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Categories", href: "/categories", icon: LayoutGrid },
    { name: "Profile", href: "/profile", icon: User },
  ];

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden bg-white border-t rounded-t-[2rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] px-6 pb-2 pt-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isProfile = item.name === "Profile";
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isProfile ? (e) => handleProfileClick(e) : undefined}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
