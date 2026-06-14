
"use client";

import { Navigation } from "@/components/Navigation";
import { AppCard } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Sparkles, PackageOpen, Loader2, AlertCircle, TrendingUp, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useEffect, useState, useMemo } from "react";
import { supabase, AppData, isSupabaseConfigured } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInvalidKey, setIsInvalidKey] = useState(false);
  const heroImage = PlaceHolderImages.find(i => i.id === "hero-bg");

  useEffect(() => {
    const fetchApps = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          if (error.message === "Invalid API key" || error.code === "PGRST301") {
            setIsInvalidKey(true);
          }
          setApps([]);
        } else {
          setApps(data || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const featuredApps = useMemo(() => apps.slice(0, 3), [apps]);
  const trendingApps = useMemo(() => [...apps].sort((a, b) => b.downloads - a.downloads).slice(0, 4), [apps]);
  const recentApps = useMemo(() => apps.slice(0, 8), [apps]);

  const showConfigAlert = !isSupabaseConfigured || isInvalidKey;

  return (
    <div className="min-h-screen bg-background pb-12 lg:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-12">
        {showConfigAlert && (
          <Alert variant="destructive" className="rounded-2xl border-primary/20 bg-primary/5 text-primary">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-black uppercase tracking-widest text-xs">
              {isInvalidKey ? "Invalid Credentials" : "Configuration Required"}
            </AlertTitle>
            <AlertDescription className="text-sm font-medium">
              {isInvalidKey 
                ? "The Supabase API key provided is invalid." 
                : "Supabase is not configured properly."}
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-white to-transparent p-8 md:p-12 border border-primary/5">
          <div className="relative z-10 grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10">
                <Sparkles className="h-3 w-3" />
                Verified Android Apps
              </div>
              <h1 className="font-headline text-4xl font-black leading-tight text-foreground md:text-5xl lg:text-7xl">
                The Secure <span className="text-primary italic">APK Hub</span>
              </h1>
              <p className="max-w-md text-lg text-muted-foreground font-medium leading-relaxed">
                Experience high-speed, verified downloads for your Android device.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/search">
                  <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                    Discover Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative h-[350px]">
               <Image
                src={heroImage?.imageUrl || "https://picsum.photos/seed/tech/800/400"}
                alt="Modern Tech"
                fill
                className="object-cover rounded-[2rem] shadow-2xl rotate-1 border-8 border-white"
                data-ai-hint="technology abstract"
              />
            </div>
          </div>
        </section>

        {/* Featured Section */}
        {apps.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Star className="h-5 w-5 fill-primary" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Editor's Choice</h2>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredApps.map((app) => (
                <AppCard 
                  key={app.id} 
                  id={app.id}
                  name={app.app_name}
                  category={app.category || "General"}
                  version={app.version}
                  rating={4.9}
                  iconUrl={app.icon_url}
                />
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        {trendingApps.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Top Charts</h2>
              </div>
              <Link href="/search?sort=downloads">
                <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 group">
                  Top Downloads <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trendingApps.map((app) => (
                <AppCard 
                  key={app.id} 
                  id={app.id}
                  name={app.app_name}
                  category={app.category || "General"}
                  version={app.version}
                  rating={4.7}
                  iconUrl={app.icon_url}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Added */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-5 w-5 fill-primary" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Fresh Releases</h2>
            </div>
            <Link href="/search">
              <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 group">
                Browse All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : apps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-muted/30 rounded-[3rem] border-2 border-dashed border-border">
              <PackageOpen className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="text-2xl font-black">No Apps Found</h3>
              <p className="text-muted-foreground max-w-xs">Our team is currently verifying new content. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentApps.map((app) => (
                <AppCard 
                  key={app.id} 
                  id={app.id}
                  name={app.app_name}
                  category={app.category || "General"}
                  version={app.version}
                  rating={4.5}
                  iconUrl={app.icon_url}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-20 border-t bg-muted/30 py-16 hidden lg:block">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-lg">P</div>
            <span className="font-headline text-2xl font-black tracking-tight">PLKAPK Hub</span>
          </div>
          <p className="text-muted-foreground max-w-sm mx-auto font-medium">
            Verified Android applications. Secure, fast, and simple.
          </p>
          <div className="pt-8 border-t border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            &copy; {new Date().getFullYear()} PLKAPK Hub.
          </div>
        </div>
      </footer>
    </div>
  );
}
