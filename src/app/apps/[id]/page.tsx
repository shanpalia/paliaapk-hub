
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
  ChevronLeft,
  Info,
  Loader2,
  Images,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase, AppData } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function AppDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setApp(data);
      } catch (err) {
        console.error("Error fetching app details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApp();
  }, [id]);

  const handleDownload = async () => {
    if (!app) return;
    
    const newCount = (app.downloads || 0) + 1;
    
    // Increment in Supabase
    supabase
      .from('apps')
      .update({ downloads: newCount })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error("Failed to increment download count:", error);
      });
    
    // Visual feedback
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadProgress(null);
            setApp(prevApp => prevApp ? { ...prevApp, downloads: newCount } : null);
          }, 1500);
          
          window.location.href = app.apk_url;
          return 100;
        }
        return prev + 10;
      });
    }, 80);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-black">App Not Found</h1>
          <Link href="/">
            <Button className="mt-8 rounded-full">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 max-w-5xl py-8">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-colors group">
          <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Marketplace
        </Link>

        {/* Hero Section */}
        <div className="bg-card rounded-[3rem] p-6 md:p-12 border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-10 relative z-10 items-center md:items-start">
            {/* App Icon */}
            <div className="h-40 w-40 md:h-56 md:w-56 rounded-[3rem] shadow-2xl shadow-primary/20 overflow-hidden bg-white border-8 border-white flex-shrink-0">
              <Image 
                src={app.icon_url || "https://picsum.photos/seed/app/256/256"} 
                alt={app.app_name} 
                width={224} 
                height={224} 
                className="object-cover h-full w-full" 
              />
            </div>
            
            {/* App Header Info */}
            <div className="flex-1 space-y-8 text-center md:text-left">
              <div className="space-y-4">
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                    {app.category || "General"}
                  </Badge>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">{app.app_name}</h1>
                <p className="text-muted-foreground font-medium text-lg">Official APK Release • Version {app.version}</p>
              </div>
              
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-8 py-6 border-y border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 font-black text-2xl">
                    4.8 <Star className="h-5 w-5 fill-primary text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Rating</p>
                </div>
                <div className="text-center border-x border-border/50">
                  <div className="font-black text-2xl">{app.downloads.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Downloads</p>
                </div>
                <div className="text-center">
                  <div className="font-black text-2xl">APK</div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">File Type</p>
                </div>
              </div>

              {/* Download Action */}
              <div className="flex flex-col sm:flex-row gap-4">
                {downloadProgress === null ? (
                  <Button 
                    onClick={handleDownload} 
                    size="lg" 
                    className="flex-1 rounded-2xl h-20 text-2xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Download className="mr-3 h-8 w-8" /> Download Now
                  </Button>
                ) : (
                  <div className="flex-1 bg-muted/50 p-6 rounded-[2rem] border border-primary/10 backdrop-blur-sm">
                    <div className="flex justify-between text-sm font-black mb-3 px-1">
                      <span className="text-primary uppercase tracking-widest animate-pulse">Initializing Server Connection...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <Progress value={downloadProgress} className="h-4 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* App Content */}
        <div className="mt-16 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            {/* Screenshot Gallery */}
            {app.screenshot_url && (
              <section className="space-y-6">
                <h2 className="text-3xl font-black flex items-center gap-3">
                  <Images className="h-6 w-6 text-primary" /> Media Preview
                </h2>
                <div className="relative aspect-video rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-muted group">
                  <Image 
                    src={app.screenshot_url} 
                    alt="App Screenshot" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </section>
            )}

            {/* Description Section */}
            <section className="space-y-6">
              <h2 className="text-3xl font-black flex items-center gap-3">
                <Info className="h-6 w-6 text-primary" /> About this App
              </h2>
              <div className="p-8 rounded-[3rem] bg-white border border-border/50 shadow-sm">
                <p className="text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap text-xl">
                  {app.description}
                </p>
              </div>
            </section>

            {/* Security Notice */}
            <section className="p-10 rounded-[3rem] bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 shrink-0">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Professional Security Scan</h3>
                <p className="text-muted-foreground font-medium mt-2 text-lg">
                  Every file hosted on PLKAPK Hub undergoes a rigorous multi-stage security audit. We verify developer signatures and scan for vulnerabilities to ensure 100% safe installation.
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar Details */}
          <aside className="space-y-8">
            <div className="p-8 rounded-[3rem] bg-card border border-border/50 shadow-sm space-y-8 sticky top-24">
              <h3 className="text-2xl font-black border-b border-border/50 pb-4">Application Info</h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Version</span>
                  <span className="font-black text-lg">{app.version}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Package Identity</span>
                  <span className="font-mono text-sm break-all font-bold opacity-70">com.{app.app_name.toLowerCase().replace(/\s+/g, '.')}.official</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Last Updated</span>
                  <span className="font-black text-lg">{new Date(app.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Requirement</span>
                  <span className="font-black text-lg">Android 8.0+</span>
                </div>
              </div>
              <div className="pt-4">
                <Button variant="secondary" className="w-full rounded-2xl h-14 font-black gap-2 hover:bg-primary/10 transition-colors">
                  <History className="h-5 w-5" /> Full Version Log
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
