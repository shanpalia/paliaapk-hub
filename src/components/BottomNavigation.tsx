
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, LayoutGrid, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);

  // Admin trigger state
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  const handleAdminTrigger = (e: React.MouseEvent) => {
    // Reset timer on every click
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
      console.log("Admin click counter reset (mobile)");
    }, 5000);

    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    console.log(`Admin Trigger Mobile: Click ${nextCount}/5`);

    if (nextCount < 5) {
      toast({ title: `Click ${nextCount}/5` });
    } else {
      e.preventDefault();
      setClickCount(0);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      
      toast({ title: "Admin Mode Activated" });
      const pin = window.prompt("Admin Access\n\nEnter Security PIN");
      
      if (pin === "7227") {
        router.push("/admin/dashboard");
      } else if (pin !== null) {
        toast({ 
          variant: "destructive", 
          title: "Invalid PIN",
          description: "Access denied."
        });
      }
    }
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Categories", href: "/categories", icon: LayoutGrid },
    { name: "Profile", href: "/profile", icon: User },
  ];

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden bg-white border-t rounded-t-[2rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] px-6 pb-2 pt-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isProfile = item.name === "Profile";
          const finalHref = (isProfile && !session) ? "/auth/login" : item.href;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={finalHref}
              onClick={isProfile ? handleAdminTrigger : undefined}
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
