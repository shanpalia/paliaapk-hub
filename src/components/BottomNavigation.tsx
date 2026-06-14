
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
  const [mounted, setMounted] = useState(false);

  // Admin trigger state
  const [adminClickCount, setAdminClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted || pathname.startsWith('/admin')) return null;

  const handleAdminTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setAdminClickCount(0);
    }, 5000);

    const nextCount = adminClickCount + 1;
    setAdminClickCount(nextCount);
    console.log(`Profile click count: ${nextCount}`);

    if (nextCount < 5) {
      toast({ title: `Click ${nextCount}/5` });
    } else {
      setAdminClickCount(0);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      
      console.log("Opening PIN modal");
      toast({ title: "Admin Mode Activated" });
      
      const pin = window.prompt("Admin Access\n\nEnter Security PIN");
      
      if (pin === "7227") {
        console.log("PIN correct");
        router.push("/auth/login?admin=true");
      } else if (pin !== null) {
        console.log("PIN incorrect");
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden bg-white border-t rounded-t-[2rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] px-6 pb-2 pt-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isProfile = item.name === "Profile";
          const isActive = pathname === item.href;
          
          if (isProfile) {
            return (
              <button
                key={item.href}
                onClick={(e) => {
                  // If counting clicks, don't navigate
                  if (adminClickCount > 0) {
                    handleAdminTrigger(e);
                  } else {
                    // This creates a small delay to see if user clicks again
                    const timer = setTimeout(() => {
                      const target = session ? "/profile" : "/auth/login";
                      router.push(target);
                    }, 300);

                    // Actually let's just use the click handler directly to start counting
                    handleAdminTrigger(e);
                  }
                }}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
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
