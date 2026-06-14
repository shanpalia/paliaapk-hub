
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleLongPressStart = () => {
    timerRef.current = setTimeout(() => {
      const pin = window.prompt("Enter Security PIN");
      if (pin === "7227") {
        router.push("/auth/login?admin=true");
      } else if (pin !== null) {
        toast({ 
          variant: "destructive", 
          title: "Invalid Security PIN",
          description: "Access denied."
        });
      }
    }, 3000);
  };

  const handleLongPressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
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
              onMouseDown={isProfile ? handleLongPressStart : undefined}
              onMouseUp={isProfile ? handleLongPressEnd : undefined}
              onMouseLeave={isProfile ? handleLongPressEnd : undefined}
              onTouchStart={isProfile ? handleLongPressStart : undefined}
              onTouchEnd={isProfile ? handleLongPressEnd : undefined}
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
