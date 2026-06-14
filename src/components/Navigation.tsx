
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Menu, Home, LayoutGrid, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogoClick = () => {
    setClickCount((prev) => prev + 1);
    if (clickCount + 1 >= 5) {
      const code = prompt("Security Check: Enter Admin Code to proceed.");
      if (code === "7227") {
        router.push("/auth/login?admin=true");
      } else {
        alert("Incorrect Code.");
      }
      setClickCount(0);
    }
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Categories", href: "/categories", icon: LayoutGrid },
    { name: "Downloads", href: "/downloads", icon: Download },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-lg shadow-primary/20 group-active:scale-95 transition-transform">
              P
            </div>
            <span className="hidden font-headline text-xl font-bold tracking-tight text-foreground sm:inline-block">
              PLKAPK Hub
            </span>
          </div>

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
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Button onClick={handleSignOut} variant="outline" size="sm" className="rounded-full px-4 h-10 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold">
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="rounded-full px-4 h-10 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold">
                  <User className="mr-2 h-4 w-4" /> Login
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
