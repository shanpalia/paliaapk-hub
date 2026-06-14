
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Mail, Download, LogOut, ChevronRight, ShieldCheck, History, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-black mb-2">Join the Community</h1>
          <p className="text-muted-foreground max-w-xs mb-8">Sign in to track your downloads, review apps, and receive security updates.</p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">Sign In</Button>
            </Link>
            <Link href="/auth/signup" className="w-full">
              <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-bold">Create Account</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 pb-20 lg:pb-0">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="text-center mb-10">
          <div className="relative h-28 w-28 mx-auto mb-4">
            <div className="h-full w-full rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-4xl shadow-2xl shadow-primary/30">
              {user.email?.[0].toUpperCase()}
            </div>
          </div>
          <h1 className="text-2xl font-black">{user.email?.split('@')[0]}</h1>
          <p className="text-muted-foreground font-medium flex items-center justify-center gap-2 mt-1">
            <Mail className="h-4 w-4" /> {user.email}
          </p>
        </header>

        <div className="space-y-4">
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {[
                { label: "Download History", icon: History, href: "/downloads" },
                { label: "Security & Safety", icon: ShieldCheck, href: "/security" },
                { label: "Account Settings", icon: Settings, href: "/settings" },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors border-b last:border-none">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full h-16 rounded-[2rem] text-destructive font-black hover:bg-destructive/5 gap-3"
          >
            <LogOut className="h-5 w-5" /> Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
}
