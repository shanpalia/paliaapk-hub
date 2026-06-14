
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Star, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  History,
  Share2,
  Bookmark
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { summarizeAppDescription } from "@/ai/flows/app-description-summarization";

export default function AppDetailsPage({ params }: { params: { id: string } }) {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string>("");

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
    description: "Notion is a single space where you can think, write, and plan. Capture thoughts, manage projects, or even run an entire company — and do it exactly the way you want. Notion is the all-in-one workspace for your notes, tasks, wikis, and databases. Create custom workflows that fit your team's needs. Seamlessly sync between your computer and phone. Used by millions every day to organize their lives and work.",
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
        return prev + 5;
      });
    }, 150);
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const result = await summarizeAppDescription({ appDescription: app.description });
      setSummary(result.summary);
    } catch (error) {
      console.error("AI summarization failed", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 max-w-4xl pt-8">
        {/* Header Info */}
        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          <div className="h-28 w-28 md:h-36 md:w-36 rounded-[1.75rem] shadow-xl overflow-hidden bg-white border border-border/50 flex-shrink-0 mx-auto md:mx-0">
            <Image src={app.iconUrl} alt={app.name} width={144} height={144} className="object-cover" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{app.name}</h1>
              <p className="text-primary font-bold mt-1">{app.developer}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">#1 Productivity</Badge>
                <Badge variant="outline">Contains Ads</Badge>
              </div>
            </div>
            
            <div className="flex justify-center md:justify-start gap-8 py-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 font-bold text-lg">
                  {app.rating} <Star className="h-4 w-4 fill-foreground" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{app.reviews} reviews</p>
              </div>
              <div className="border-l border-border h-10 my-auto" />
              <div className="text-center">
                <div className="font-bold text-lg">{app.size}</div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">File Size</p>
              </div>
              <div className="border-l border-border h-10 my-auto" />
              <div className="text-center">
                <div className="font-bold text-lg">{app.downloads}</div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Downloads</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {downloadProgress === null ? (
                <Button onClick={handleDownload} size="lg" className="flex-1 md:flex-none rounded-full px-12 h-14 text-lg font-bold shadow-lg shadow-primary/20">
                  <Download className="mr-2 h-5 w-5" /> Download APK
                </Button>
              ) : (
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Downloading...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <Progress value={downloadProgress} className="h-4" />
                </div>
              )}
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-border bg-white hover:bg-muted">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-border bg-white hover:bg-muted">
                <Bookmark className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-12 overflow-x-auto no-scrollbar flex gap-4 -mx-4 px-4">
          {app.screenshots.map((ss, idx) => (
            <div key={idx} className="relative h-[400px] w-[225px] rounded-2xl overflow-hidden shadow-md flex-shrink-0 border border-border/50">
              <Image src={ss} alt={`Screenshot ${idx + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>

        {/* About this app */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">About this app</h2>
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="relative">
             <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {app.description}
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/30 p-6 border border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Info className="h-4 w-4" />
                 </div>
                 <h3 className="font-bold text-lg">AI Smart Summary</h3>
              </div>
              <Button 
                onClick={handleSummarize} 
                disabled={isSummarizing}
                size="sm" 
                variant="outline" 
                className="rounded-full bg-background/50 border-primary/20 text-primary"
              >
                {isSummarizing ? "Analyzing..." : "Regenerate"}
              </Button>
            </div>
            
            {!summary && !isSummarizing ? (
              <p className="text-sm text-muted-foreground italic">Click the button to get a concise, AI-powered summary of this app's features.</p>
            ) : isSummarizing ? (
              <div className="space-y-2">
                <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
            ) : (
              <div className="text-sm text-foreground prose-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }} />
            )}
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="flex gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
              <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-bold">Verified Safe</h4>
                <p className="text-sm text-muted-foreground mt-1">This APK has been scanned by our security engine and is 100% safe.</p>
              </div>
           </div>
           <div className="flex gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
              <History className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-bold">Version History</h4>
                <p className="text-sm text-muted-foreground mt-1">View previous versions and changelogs for this application.</p>
              </div>
           </div>
        </div>

        {/* Technical Info */}
        <div className="mt-12 space-y-6 pt-12 border-t">
          <h2 className="text-xl font-bold tracking-tight">Technical Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <div>
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Version</p>
               <p className="font-medium">{app.version}</p>
             </div>
             <div>
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Updated on</p>
               <p className="font-medium">{app.lastUpdated}</p>
             </div>
             <div>
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Requires Android</p>
               <p className="font-medium">8.0 and up</p>
             </div>
             <div>
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Package Name</p>
               <p className="font-medium truncate text-xs">com.notion.app</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
