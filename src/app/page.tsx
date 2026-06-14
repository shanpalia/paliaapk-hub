
"use client";

import { Navigation } from "@/components/Navigation";
import { AppCard } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Sparkles, PackageOpen, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useEffect, useState } from "react";
import { supabase, AppData, isSupabaseConfigured } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInvalidKey, setIsInvalidKey] = useState(false);
  const heroImage = PlaceHolderImages.find(i => i.id === "hero-bg");

  useEffect(() => {
    const fetchApps = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('apps')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fetchError) {
          if (fetchError.message === "Invalid API key" || fetchError.code === "PGRST301") {
            setIsInvalidKey(true);
          } else {
            console.error("Supabase fetch error:", fetchError.message);
            setError(fetchError.message);
          }
          setApps([]);
        } else {
          setApps(data || []);
        }
      } catch (err: any) {
        if (err.message !== "Failed to fetch") {
          console.error("Unexpected error:", err);
        }
        setError("Could not connect to the database. Check your network or configuration.");
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  const showConfigAlert = !isSupabaseConfigured || isInvalidKey;

  return (
    <div className="min-h-screen bg-background">
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
                ? "The Supabase API key provided is invalid. Please verify your environment variables." 
                : "Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables."}
            </AlertDescription>
          </Alert>
        )}

        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-white to-transparent p-8 md:p-16 border border-primary/5">
          <div className="relative z-10 grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary border border-primary/10">
                <Sparkles className="h-3 w-3" />
                Verified Android Apps
              </div>
              <h1 className="font-headline text-4xl font-black leading-tight text-foreground md:text-5xl lg:text-7xl">
                The Secure <span className="text-primary italic">APK Hub</span> for You
              </h1>
              <p className="max-w-md text-lg text-muted-foreground font-medium leading-relaxed">
                Discover the best Android applications, fully verified and ready for high-speed download.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  Browse Apps
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg font-bold bg-white/50 backdrop-blur">
                  Top Charts
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative h-[400px]">
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

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-5 w-5 fill-primary" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">Latest Discoveries</h2>
            </div>
            {apps.length > 0 && (
              <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 group">
                See More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : apps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-muted/30 rounded-[3rem] border-2 border-dashed border-border">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
                <PackageOpen className="h-12 w-12" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground">No Apps Available Yet</h3>
                <p className="text-muted-foreground font-medium mt-2">
                  {showConfigAlert 
                    ? "Configure Supabase to start adding applications to your store." 
                    : "Check back soon! Our team is verifying new content for the hub."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {apps.map((app) => (
                <AppCard 
                  key={app.id} 
                  id={app.id}
                  name={app.app_name}
                  category={app.category || "General"}
                  version={app.version}
                  rating={4.5}
                  iconUrl={app.icon_url || "https://picsum.photos/seed/app/128/128"}
                />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Safe & Secure", desc: "Every APK is scanned and verified before publishing." },
            { title: "High Speed", desc: "Global CDN ensures lightning fast downloads every time." },
            { title: "No Junk", desc: "Curated selection of only high-quality applications." }
          ].map((feat, idx) => (
            <div key={idx} className="p-8 rounded-[2rem] bg-secondary/50 border border-primary/5 space-y-3">
              <h4 className="text-xl font-black text-primary">{feat.title}</h4>
              <p className="text-muted-foreground font-medium">{feat.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mt-20 border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-lg">P</div>
            <span className="font-headline text-2xl font-black tracking-tight">PLKAPK Hub</span>
          </div>
          <p className="text-muted-foreground max-w-sm mx-auto font-medium">
            The professional choice for verified Android application packages. Secure, fast, and simple.
          </p>
          <div className="pt-8 border-t border-border/50 text-sm font-bold text-muted-foreground">
            &copy; {new Date().getFullYear()} PLKAPK Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
