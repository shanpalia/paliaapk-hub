"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Star, 
  ShieldCheck, 
  History,
  Share2,
  Bookmark,
  ChevronLeft,
  Info
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AppDetailsPage({ params }: { params: { id: string } }) {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  // Fallback if ID doesn't match a specific mock (for UI demo)
  const app = {
    id: params.id,
    name: "Notion - Notes, Docs, Tasks",
    developer: "Notion Labs, Inc.",
    category: "Productivity",
    rating: 4.7,
    reviews: "124K",
    downloads: "10M+",
    size: "42 MB",
    version: "0.24.11",
    lastUpdated: "Dec 12, 2023",
    description: "Notion is the all-in-one workspace for your notes, tasks, wikis, and databases. Create custom workflows that fit your team's needs. Seamlessly sync between your computer and phone. Used by millions every day to organize their lives and work.\n\nCapture thoughts, manage projects, or even run an entire company — and do it exactly the way you want.",
    iconUrl: PlaceHolderImages.find(i => i.id === "app-icon-3")?.imageUrl!,
    screenshots: [
      PlaceHolderImages.find(i => i.id === "screenshot-1")?.imageUrl!,
      PlaceHolderImages.find(i => i.id === "screenshot-2")?.imageUrl!,
      PlaceHolderImages.find(i => i.id === "screenshot-3")?.imageUrl!,
    ]
  };

  const handleDownload = () => {
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadProgress(null), 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 max-w-5xl py-8">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-colors group">
          <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Marketplace
        </Link>

        {/* Hero Area */}
        <div className="bg-card rounded-[2.5rem] p-6 md:p-10 border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="flex flex-col md:flex-row gap-8 relative z-10">
            <div className="h-32 w-32 md:h-44 md:w-44 rounded-[2.5rem] shadow-2xl shadow-primary/10 overflow-hidden bg-white border-4 border-white flex-shrink-0 mx-auto md:mx-0">
              <Image src={app.iconUrl} alt={app.name} width={176} height={176} className="object-cover" />
            </div>
            
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">{app.name}</h1>
                <p className="text-primary font-black text-lg mt-2">{app.developer}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-4 py-1 font-bold">#1 {app.category}</Badge>
                  <Badge variant="outline" className="border-border rounded-full px-4">Official Release</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 font-black text-xl">
                    {app.rating} <Star className="h-5 w-5 fill-primary text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{app.reviews} Reviews</p>
                </div>
                <div className="text-center border-x border-border/50">
                  <div className="font-black text-xl">{app.size}</div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Size</p>
                </div>
                <div className="text-center">
                  <div className="font-black text-xl">{app.downloads}</div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Downloads</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {downloadProgress === null ? (
                  <Button onClick={handleDownload} size="lg" className="flex-1 rounded-2xl h-16 text-xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                    <Download className="mr-3 h-6 w-6" /> Download APK
                  </Button>
                ) : (
                  <div className="flex-1 bg-muted p-4 rounded-2xl border border-border/50">
                    <div className="flex justify-between text-sm font-black mb-2 px-1">
                      <span className="text-primary uppercase tracking-widest">Downloading...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <Progress value={downloadProgress} className="h-3 bg-white" />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-16 w-16 rounded-2xl border-border bg-white hover:bg-muted hover:text-primary transition-all">
                    <Share2 className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-16 w-16 rounded-2xl border-border bg-white hover:bg-muted hover:text-primary transition-all">
                    <Bookmark className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-12">
          <h2 className="text-2xl font-black mb-6">Experience {app.name}</h2>
          <div className="overflow-x-auto no-scrollbar flex gap-6 pb-4">
            {app.screenshots.map((ss, idx) => (
              <div key={idx} className="relative h-[480px] w-[270px] rounded-[2rem] overflow-hidden shadow-lg flex-shrink-0 border-4 border-card">
                <Image src={ss} alt={`Screenshot ${idx + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Info Tabs / Grid */}
        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> About this App
              </h2>
              <p className="text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap text-lg">
                {app.description}
              </p>
            </section>

            <section className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Verified Security Scan</h3>
                  <p className="text-muted-foreground font-medium mt-1">
                    This file was scanned by our automated security system on {app.lastUpdated}. No threats detected. Signature verified.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="p-6 rounded-[2.5rem] bg-card border border-border/50 space-y-6">
              <h3 className="text-xl font-black">Technical Specs</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-bold text-sm uppercase">Version</span>
                  <span className="font-black">{app.version}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-bold text-sm uppercase">Updated</span>
                  <span className="font-black">{app.lastUpdated}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-bold text-sm uppercase">Required</span>
                  <span className="font-black">Android 8.0+</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground font-bold text-sm uppercase">Size</span>
                  <span className="font-black">{app.size}</span>
                </div>
              </div>
              <Button variant="secondary" className="w-full rounded-xl font-bold gap-2">
                <History className="h-4 w-4" /> View History
              </Button>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground space-y-4">
              <h3 className="text-xl font-black">Join PLKAPK</h3>
              <p className="font-medium opacity-90 text-sm">
                Get notified whenever {app.name} receives an update.
              </p>
              <Button variant="secondary" className="w-full rounded-xl font-bold bg-white text-primary hover:bg-white/90">
                Subscribe Updates
              </Button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}