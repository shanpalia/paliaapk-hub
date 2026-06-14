"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Mail, Download, LogOut, ChevronRight, ShieldCheck, History, Settings, Star, Cloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="h-32 w-32 bg-muted rounded-[2.5rem] flex items-center justify-center mb-8 rotate-3 shadow-xl">
            <User className="h-16 w-16 text-muted-foreground -rotate-3" />
          </div>
          <h1 className="text-4xl font-black mb-4">Join PLKAPK Hub</h1>
          <p className="text-muted-foreground max-w-xs mb-10 text-lg">Create an account to track downloads, secure your favorite APKs, and get instant updates.</p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full h-16 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/20">Sign In</Button>
            </Link>
            <Link href="/auth/signup" className="w-full">
              <Button variant="outline" className="w-full h-16 rounded-[2rem] text-xl font-black">Create Account</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const displayName = user.email?.split('@')[0];
  const userInitial = user.email?.[0].toUpperCase();

  return (
    <div className="min-h-screen bg-muted/10 pb-20 lg:pb-0">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <header className="text-center mb-12">
          <div className="relative h-32 w-32 mx-auto mb-6 group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all" />
            <Avatar className="h-32 w-32 border-8 border-white shadow-2xl relative z-10">
              <AvatarFallback className="bg-primary text-primary-foreground font-black text-5xl">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-3xl font-black tracking-tight">{displayName}</h1>
          <p className="text-muted-foreground font-bold flex items-center justify-center gap-2 mt-2 bg-white/50 w-fit mx-auto px-4 py-1 rounded-full border border-border/50">
            <Mail className="h-4 w-4 text-primary" /> {user.email}
          </p>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-6 text-center">
            <div className="h-10 w-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Download className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black">12</p>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Downloads</p>
          </Card>
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-6 text-center">
            <div className="h-10 w-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Star className="h-5 w-5 fill-amber-500" />
            </div>
            <p className="text-2xl font-black">4</p>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Reviews Sent</p>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
            <CardContent className="p-0">
              {[
                { label: "Download History", icon: History, href: "#", count: "12 Items" },
                { label: "Cloud Backup", icon: Cloud, href: "#", badge: "New" },
                { label: "Security Settings", icon: ShieldCheck, href: "#" },
                { label: "App Preferences", icon: Settings, href: "#" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors border-b last:border-none cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-bold block">{item.label}</span>
                      {item.count && <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.count}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{item.badge}</span>}
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full h-16 rounded-[2rem] text-destructive font-black hover:bg-destructive/5 gap-3"
          >
            <LogOut className="h-5 w-5" /> Sign Out from Marketplace
          </Button>
        </div>
      </main>
    </div>
  );
}