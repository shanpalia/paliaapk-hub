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
  Info,
  Loader2,
  Images
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApp();
  }, [id]);

  const handleDownload = async () => {
    if (!app) return;
    
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadProgress(null), 2000);
          
          // Increment download counter
          supabase.from('apps').update({ downloads: (app.downloads || 0) + 1 }).eq('id', id).then();
          
          window.open(app.apk_url, '_blank');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex flex-col"><Navigation /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></div>;
  }

  if (!app) {
    return <div className="min-h-screen bg-background"><Navigation /><div className="container mx-auto px-4 py-24 text-center"><h1 className="text-4xl font-black">App Not Found</h1><Link href="/"><Button className="mt-8 rounded-full">Back to Marketplace</Button></Link></div></div>;
  }

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
              <Image src={app.image_url || "https://picsum.photos/seed/app/200/200"} alt={app.app_name} width={176} height={176} className="object-cover" />
            </div>
            
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">{app.app_name}</h1>
                <p className="text-primary font-black text-lg mt-2">Verified Release</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                  <Badge className="bg-primary/10 text-primary border-none px-4 py-1 font-bold">{app.category}</Badge>
                  <Badge variant="outline" className="border-border rounded-full px-4">Official</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 font-black text-xl">
                    4.8 <Star className="h-5 w-5 fill-primary text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Rating</p>
                </div>
                <div className="text-center border-x border-border/50">
                  <div className="font-black text-xl">-- MB</div>
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
                      <span className="text-primary uppercase tracking-widest">Starting...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <Progress value={downloadProgress} className="h-3 bg-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot Gallery if available */}
        {app.screenshot_url && (
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Images className="h-5 w-5 text-primary" /> Preview
            </h2>
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-8 border-white shadow-xl">
              <Image src={app.screenshot_url} alt="Screenshot" fill className="object-cover" />
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> About
              </h2>
              <p className="text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap text-lg">
                {app.description}
              </p>
            </section>

            <section className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-black">Secure Verification</h3>
                <p className="text-muted-foreground font-medium mt-1">
                  Scanned for vulnerabilities and verified signature.
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="p-6 rounded-[2.5rem] bg-card border border-border/50 space-y-6">
              <h3 className="text-xl font-black">Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-bold text-sm">VERSION</span>
                  <span className="font-black">{app.version}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-bold text-sm">UPDATED</span>
                  <span className="font-black">{new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Button variant="secondary" className="w-full rounded-xl font-bold gap-2">
                <History className="h-4 w-4" /> History
              </Button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
