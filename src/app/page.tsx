import { Navigation } from "@/components/Navigation";
import { AppCard } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Sparkles, PackageOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

// Set to [] to test empty state
const MOCK_APPS = [
  { id: "1", name: "WhatsApp Messenger", category: "Social", version: "2.24.1", rating: 4.8, iconUrl: PlaceHolderImages.find(i => i.id === "app-icon-1")?.imageUrl! },
  { id: "2", name: "Genshin Impact", category: "Games", version: "4.5.0", rating: 4.5, iconUrl: PlaceHolderImages.find(i => i.id === "app-icon-2")?.imageUrl! },
  { id: "3", name: "Notion", category: "Productivity", version: "0.24.1", rating: 4.7, iconUrl: PlaceHolderImages.find(i => i.id === "app-icon-3")?.imageUrl! },
  { id: "4", name: "Adobe Lightroom", category: "Photography", version: "9.2.0", rating: 4.6, iconUrl: PlaceHolderImages.find(i => i.id === "app-icon-4")?.imageUrl! },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(i => i.id === "hero-bg");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
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
                src={heroImage?.imageUrl!}
                alt="Modern Tech"
                fill
                className="object-cover rounded-[2rem] shadow-2xl rotate-1 border-8 border-white"
                data-ai-hint="technology nature"
              />
            </div>
          </div>
        </section>

        {/* Apps Grid Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-5 w-5 fill-primary" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">Latest Discoveries</h2>
            </div>
            {MOCK_APPS.length > 0 && (
              <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 group">
                See More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>

          {MOCK_APPS.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-muted/30 rounded-[3rem] border-2 border-dashed border-border">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
                <PackageOpen className="h-12 w-12" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground">No Apps Available Yet</h3>
                <p className="text-muted-foreground font-medium mt-2">Check back soon! Our team is verifying new content for the hub.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {MOCK_APPS.map((app) => (
                <AppCard key={app.id} {...app} />
              ))}
            </div>
          )}
        </section>

        {/* Feature Highlights */}
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