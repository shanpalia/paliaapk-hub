
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Menu, Home, LayoutGrid, LogOut, Settings, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Categories", href: "/categories", icon: LayoutGrid },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    router.push("/");
    router.refresh();
  };

  const isAdmin = user?.email === 'shanpalia786@gmail.com';
  const userInitial = user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 select-none group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-lg shadow-primary/20 transition-transform group-active:scale-95">
              P
            </div>
            <span className="hidden font-headline text-xl font-bold tracking-tight text-red-500 sm:inline-block">
              PLKAPK Hub TEST
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
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
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
                      <Link href="/admin/dashboard">
                        <DropdownMenuItem className="rounded-xl cursor-pointer font-bold text-primary">
                          <Settings className="mr-2 h-4 w-4" /> Admin Panel
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="rounded-xl cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
