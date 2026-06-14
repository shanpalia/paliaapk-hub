import { Navigation } from "@/components/Navigation";
import { AppCard } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, TrendingUp, Sparkles, Grid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const MOCK_APPS = [
  { id: "1", name: "WhatsApp Messenger", category: "Social", rating: 4.8, downloads: "5B+", iconUrl: PlaceHolderImages.find(i => i.id === "app-icon-1")?.imageUrl! },
  { id: "2", name: "Genshin Impact", category: "Action", rating: 4.5, downloads: "50M+", iconUrl: PlaceHolderImages.find(i => i.id === "app-icon-2")?.imageUrl! },
  { id: "3", name: "Notion", category: "Productivity", rating: 4.7, downloads: "10M+", iconUrl: PlaceHolderImages.find(i => i.id === "app-icon-3")?.imageUrl! },
  { id: "4", name: "Adobe Lightroom", category: "Photography", rating: 4.6, downloads: "100M+", iconUrl: PlaceHolderImages.find(i => i.id === "app-icon-4")?.imageUrl! },
  { id: "5", name: "Instagram", category: "Social", rating: 4.3, downloads: "1B+", iconUrl: PlaceHolderImages.find(i => i.id === "app-icon-1")?.imageUrl! },
  { id: "6", name: "Among Us", category: "Action", rating: 4.2, downloads: "100M+", iconUrl: PlaceHolderImages.find(i => i.id === "app-icon-2")?.imageUrl! },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(i => i.id === "hero-bg");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12 lg:p-16 border border-primary/10">
          <div className="relative z-10 grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm border border-primary/10">
                <Sparkles className="h-3 w-3" />
                Trusted APK Marketplace
              </div>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                The Safest Hub for <span className="text-primary italic">Android</span> Apps
              </h1>
              <p className="max-w-md text-lg text-muted-foreground leading-relaxed">
                Discover, download, and manage your favorite Android applications with our high-speed, secure APK repository.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="rounded-full px-8 h-12 shadow-lg hover:shadow-primary/20 transition-all">
                  Browse Trending
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8 h-12 bg-background/50">
                  Upload APK
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative h-[300px] lg:h-[400px]">
               <Image
                src={heroImage?.imageUrl!}
                alt="Tech visualization"
                fill
                className="object-cover rounded-3xl shadow-2xl rotate-2"
                data-ai-hint="abstract tech"
              />
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary fill-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Featured Apps</h2>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/80 group">
              View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_APPS.slice(0, 6).map((app) => (
              <AppCard key={app.id} {...app} />
            ))}
          </div>
        </section>

        {/* Top Charts */}
        <section className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Top Downloaded</h2>
            </div>
            <div className="grid gap-4">
              {MOCK_APPS.map((app, idx) => (
                <Link key={app.id} href={`/apps/${app.id}`} className="flex items-center gap-4 rounded-2xl p-3 hover:bg-muted/50 transition-colors group">
                  <span className="text-2xl font-black text-muted-foreground/30 italic w-8 text-center">{idx + 1}</span>
                  <div className="h-14 w-14 rounded-xl overflow-hidden shadow-sm bg-muted flex-shrink-0">
                    <Image src={app.iconUrl} alt={app.name} width={56} height={56} className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{app.name}</h4>
                    <p className="text-xs text-muted-foreground">{app.category} • {app.downloads} downloads</p>
                  </div>
                  <Button size="sm" variant="secondary" className="rounded-full h-8 px-4 text-xs font-bold">Get</Button>
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Quick Links</h2>
            <div className="grid grid-cols-2 gap-4">
              {["Games", "Social", "Tools", "Health", "Music", "News"].map((cat) => (
                <Link key={cat} href={`/categories/${cat.toLowerCase()}`} className="flex flex-col items-center justify-center h-28 rounded-2xl bg-card border border-border/50 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group">
                  <div className="h-10 w-10 rounded-full bg-primary/5 mb-3 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <Grid className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{cat}</span>
                </Link>
              ))}
            </div>
            <div className="rounded-2xl bg-primary p-6 text-primary-foreground space-y-4 shadow-xl shadow-primary/20">
              <h3 className="font-bold text-xl">Join the Hub!</h3>
              <p className="text-sm opacity-90 leading-relaxed">Create an account to track your downloads and get update notifications.</p>
              <Button variant="secondary" className="w-full rounded-xl font-bold bg-white text-primary border-none hover:bg-white/90">Sign Up Free</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
             <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">P</div>
              <span className="font-headline text-lg font-bold tracking-tight">PLKAPK Hub</span>
            </Link>
            <p className="text-sm text-muted-foreground">The most secure repository for verified Android application packages.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/apps">All Apps</Link></li>
              <li><Link href="/trending">Trending</Link></li>
              <li><Link href="/top-charts">Top Charts</Link></li>
              <li><Link href="/categories">Categories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Admin</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/admin/login">Admin Access</Link></li>
              <li><Link href="/upload">Submit APK</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} PLKAPK Hub. All rights reserved. Built with Next.js and Supabase.
        </div>
      </footer>
    </div>
  );
}
