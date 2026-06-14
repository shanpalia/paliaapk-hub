
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Home, LayoutGrid, LogOut, History, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { StoreIcon } from "@/components/StoreIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  
  // Hidden Admin Trigger State
  const [logoClickCount, setLogoClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pinValue, setPinValue] = useState("");

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

  const handleLogoClick = () => {
    if (isPinDialogOpen) return;

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setLogoClickCount(0);
    }, 5000);

    const nextCount = logoClickCount + 1;
    setLogoClickCount(nextCount);

    if (nextCount < 5) {
      toast({ title: `Accessing Admin: ${nextCount}/5` });
    } else {
      setLogoClickCount(0);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      setPinValue("");
      setIsPinDialogOpen(true);
    }
  };

  const handlePinSubmit = async () => {
    if (pinValue === "7227") {
      toast({ title: "Verification Required" });
      setIsPinDialogOpen(false);
      router.push("/auth/login?admin=true");
    } else {
      toast({ 
        variant: "destructive", 
        title: "Invalid Security PIN",
        description: "Access denied."
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    router.push("/");
    router.refresh();
  };

  if (!mounted) return null;

  const isAdmin = user?.email === "shanpalia786@gmail.com";
  const userInitial = user?.email?.[0]?.toUpperCase() || 'U';

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Categories", href: "/categories", icon: LayoutGrid },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-2 select-none group cursor-pointer"
            >
              <StoreIcon size="md" />
              <span className="hidden font-headline text-xl font-black tracking-tight sm:inline-block">
                PLKAPK Hub
              </span>
            </div>

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
              {user && !isAdmin ? (
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
      </nav>

      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-md p-8">
          <DialogHeader className="items-center text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-black">Admin Access</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-2">
            <p className="text-sm font-bold text-muted-foreground text-center mb-4">
              Enter the security PIN to access the administrative console.
            </p>
            <Input
              type="password"
              placeholder="••••"
              className="h-16 text-center text-3xl font-black tracking-[1rem] rounded-2xl bg-muted/30 border-none focus-visible:ring-primary"
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              autoFocus
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="h-14 rounded-2xl font-black flex-1"
              onClick={() => setIsPinDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="h-14 rounded-2xl font-black flex-1 shadow-xl shadow-primary/20"
              onClick={handlePinSubmit}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
