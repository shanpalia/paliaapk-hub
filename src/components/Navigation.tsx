
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Home, LayoutGrid, LogOut, Settings, History } from "lucide-react";
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
  
  // Admin trigger state
  const [adminClickCount, setAdminClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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

  const handleAdminTrigger = (e: React.MouseEvent) => {
    // Intercept navigation/dropdown if we are counting
    // However, we want to count EVERY click on the profile icon.
    
    // Reset timer on every click
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setAdminClickCount(0);
      console.log("Admin click counter reset (Top Nav)");
    }, 5000);

    const nextCount = adminClickCount + 1;
    console.log(`Profile click count: ${nextCount}`);
    setAdminClickCount(nextCount);

    if (nextCount < 5) {
      toast({ title: `Click ${nextCount}/5` });
    } else {
      // 5th click reached
      e.preventDefault();
      e.stopPropagation();
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
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    router.push("/");
    router.refresh();
  };

  const isAdmin = user?.email === 'shanpalia786@gmail.com';
  const userInitial = user?.email?.[0]?.toUpperCase() || 'U';

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Categories", href: "/categories", icon: LayoutGrid },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 select-none group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">
              P
            </div>
            <span className="hidden font-headline text-xl font-bold tracking-tight sm:inline-block">
              PLKAPK Hub
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted ${
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
          <div className="hidden w-full max-w-xs md:flex relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              className="pl-10 h-10 bg-muted/50 border-none rounded-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <div>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full p-0"
                      onClick={handleAdminTrigger}
                    >
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary text-primary-foreground font-black">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-2xl p-2" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-black leading-none">{user.email?.split('@')[0]}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="rounded-xl cursor-pointer">
                        <User className="mr-2 h-4 w-4" /> My Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile">
                      <DropdownMenuItem className="rounded-xl cursor-pointer">
                        <History className="mr-2 h-4 w-4" /> Downloads
                      </DropdownMenuItem>
                    </Link>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <Link href="/admin/dashboard">
                          <DropdownMenuItem className="rounded-xl cursor-pointer font-bold text-primary">
                            <Settings className="mr-2 h-4 w-4" /> Admin Panel
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="rounded-xl cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full p-0"
                  onClick={(e) => {
                    handleAdminTrigger(e);
                    if (adminClickCount === 0) router.push("/auth/login");
                  }}
                >
                  <Avatar className="h-10 w-10 border-2 border-muted bg-muted hover:border-primary/20 transition-colors">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
