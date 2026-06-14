
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
  const [adminClickCount, setAdminClickCount] = useState(0);
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
    // Prevent navigation while counting
    e.preventDefault();

    // Reset timer on every click
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setAdminClickCount(0);
      console.log("Admin click counter reset (Bottom Nav)");
    }, 5000);

    const nextCount = adminClickCount + 1;
    console.log(`Profile click count: ${nextCount}`);
    setAdminClickCount(nextCount);

    if (nextCount < 5) {
      toast({ title: `Click ${nextCount}/5` });
    } else {
      // 5th click reached
      setAdminClickCount(0);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      
      console.log("Opening PIN modal");
      toast({ title: "Admin Mode Activated" });
      
      const pin = window.prompt("Admin Access\n\nEnter Security PIN");
      
      if (pin === "7227") {
        console.log("PIN correct");
        router.push("/admin/dashboard");
      } else if (pin !== null) {
        console.log("PIN incorrect");
        toast({ 
          variant: "destructive", 
          title: "Invalid PIN",
          description: "Access denied."
        });
      }
    }

    // If it's just a single click and timer hasn't reached threshold, 
    // we could navigate, but as per requirements: "Do not navigate while counting".
    // We'll allow navigation if they stop clicking after one.
    if (nextCount === 1) {
       // Logic to wait briefly before normal navigation could go here, 
       // but for a strict hidden feature, we usually block standard click 
       // or require specific interaction.
       // For now, let's strictly follow: "Do not navigate while counting".
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
          const isActive = pathname === item.href;
          
          if (isProfile) {
            return (
              <button
                key={item.href}
                onClick={(e) => {
                  handleAdminTrigger(e);
                  // Standard navigation if no sequence detected after a short while
                  // is complex here, so we implement the count strictly.
                  // To actually reach the profile, they'd have to wait for timeout or we add a "go" button.
                  // But as per instructions: "Do not navigate while counting".
                  if (adminClickCount === 0) {
                    const target = session ? "/profile" : "/auth/login";
                    // Only navigate if they haven't started a sequence
                    router.push(target);
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
