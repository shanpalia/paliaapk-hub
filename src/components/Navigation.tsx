
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Home, LayoutGrid, LogOut, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  
  // Admin trigger state for Logo
  const [adminClickCount, setAdminClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    // Reset timer on every click
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setAdminClickCount(0);
    }, 5000);

    const nextCount = adminClickCount + 1;
    setAdminClickCount(nextCount);
    console.log(`Logo click count: ${nextCount}`);

    if (nextCount < 5) {
      toast({ title: `Click ${nextCount}/5` });
    } else {
      // Prevent normal navigation on the 5th click to show PIN prompt
      e.preventDefault();
      e.stopPropagation();
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    router.push("/");
    router.refresh();
  };

  if (!mounted) return null;

  const userInitial = user?.email?.[0]?.toUpperCase() || 'U';

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Categories", href: "/categories", icon: LayoutGrid },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            onClick={handleLogoClick}
            className="flex items-center gap-2 select-none group cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">
              P
            </div>
            <span className="hidden font-headline text-xl font-black tracking-tight sm:inline-block">
              PLKAPK Hub
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition-colors hover:bg-muted ${
                  pathname === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden w-full max-w-xs md:flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search apps..."
                className="pl-10 h-10 bg-muted/30 border-none rounded-full font-medium"
                onFocus={() => router.push("/search")}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative h-10 w-10 rounded-full outline-none focus:ring-2 focus:ring-primary/20 ring-offset-2 transition-all">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary text-primary-foreground font-black">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 rounded-[2rem] p-3 shadow-2xl border-border/50" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal px-4 py-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-base font-black leading-none">{user.email?.split('@')[0]}</p>
                        <p className="text-xs font-medium leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2" />
                    <Link href="/profile">
                      <DropdownMenuItem className="rounded-xl cursor-pointer font-bold px-4 py-2.5">
                        <User className="mr-3 h-5 w-5 text-muted-foreground" /> My Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile">
                      <DropdownMenuItem className="rounded-xl cursor-pointer font-bold px-4 py-2.5">
                        <History className="mr-3 h-5 w-5 text-muted-foreground" /> Downloads
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem onClick={handleSignOut} className="rounded-xl cursor-pointer text-destructive font-black px-4 py-2.5 focus:bg-destructive/5 focus:text-destructive">
                      <LogOut className="mr-3 h-5 w-5" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/login">
                  <Avatar className="h-10 w-10 border-2 border-muted bg-muted hover:border-primary/20 transition-all cursor-pointer">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
