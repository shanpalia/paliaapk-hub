
'use client';

import {Navigation} from '@/components/Navigation';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {
  Download,
  Star,
  ShieldCheck,
  History,
  ChevronLeft,
  Info,
  Loader2,
  Images,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {useState, useEffect, Suspense} from 'react';
import {supabase, AppData} from '@/lib/supabase';
import {useRouter, useSearchParams} from 'next/navigation';
import {useToast} from '@/hooks/use-toast';
import {useUser} from '@/firebase';

function AppDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {toast} = useToast();
  const id = searchParams.get('id') || '';
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const {user} = useUser();
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (currentApp: AppData) => {
    if (!user) {
      toast({title: 'Authentication Required', description: 'Please sign in before downloading this APK.'});
      router.push(`/auth/login?returnTo=/apps/${id}&action=download`);
      return;
    }
    if (!currentApp.apk_url || downloading) return;
    setDownloading(true); setDownloadProgress(0); setDownloadedBytes(0); setTotalBytes(0); setDownloadSpeed(0);
    const newCount = (currentApp.downloads || 0) + 1;
    setApp(prev => prev ? {...prev, downloads: newCount} : null);
    void supabase.from('apps').update({downloads: newCount}).eq('id', id);
    try {
      const response = await fetch(currentApp.apk_url, {cache: 'no-store'});
      if (!response.ok || !response.body) throw new Error('APK host does not allow readable streaming.');
      const total = Number(response.headers.get('content-length') || 0);
      setTotalBytes(total);
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0, lastBytes = 0, lastTime = performance.now();
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        if (!value) continue;
        chunks.push(value); received += value.byteLength;
        const now = performance.now(); const elapsed = Math.max((now - lastTime) / 1000, 0.001);
        if (elapsed >= 0.2) {
          setDownloadedBytes(received);
          setDownloadSpeed((received - lastBytes) / elapsed);
          if (total > 0) setDownloadProgress(Math.min(100, received / total * 100));
          lastBytes = received; lastTime = now;
        }
      }
      setDownloadedBytes(received);
      if (total > 0) setDownloadProgress(100);
      const blob = new Blob(chunks, {type: 'application/vnd.android.package-archive'});
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl; link.download = `${currentApp.app_name}.apk`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
      toast({title: 'Download complete', description: `${received} bytes downloaded successfully.`});
    } catch (error) {
      console.error('Real download failed', error);
      setDownloadProgress(null);
      toast({variant: 'destructive', title: 'Download blocked', description: 'The APK storage host must allow CORS/streaming for real progress and speed measurement.'});
    } finally { setDownloading(false); setDownloadSpeed(0); }
  };


  useEffect(() => {
    const fetchApp = async () => {
      try {
        const {data, error} = await supabase
          .from('apps')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setApp(data);
      } catch (err) {
        console.error('Error fetching app details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApp();
  }, [id]);

  useEffect(() => {
    if (app && user && searchParams.get('action') === 'download' && !loading) {
       handleDownload(app);
    }
  }, [app, user, searchParams, loading]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-black">App Not Found</h1>
        <Link href="/">
          <Button className="mt-8 rounded-full">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 max-w-5xl py-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-colors group"
      >
        <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />{' '}
        Back to Hub
      </Link>

      <div className="bg-card rounded-[3rem] p-6 md:p-12 border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-10 relative z-10 items-center md:items-start">
          <div className="h-40 w-40 md:h-56 md:w-56 rounded-[3rem] shadow-2xl shadow-primary/20 overflow-hidden bg-white border-8 border-white flex-shrink-0 relative">
            <Image
              src={app.icon_url}
              alt={app.app_name}
              fill
              className="object-cover h-full w-full"
              unoptimized
            />
          </div>

          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                  {app.category}
                </Badge>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                {app.app_name}
              </h1>
              <p className="text-muted-foreground font-medium text-lg">
                Official Release • v{app.version} • {app.developer}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8 py-6 border-y border-border/50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 font-black text-2xl">
                  4.9 <Star className="h-5 w-5 fill-primary text-primary" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                  Rating
                </p>
              </div>
              <div className="text-center border-x border-border/50">
                <div className="font-black text-2xl">
                  {app.downloads?.toLocaleString() || 0}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                  Transfers
                </p>
              </div>
              <div className="text-center">
                <div className="font-black text-2xl">APK</div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                  Format
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!downloading ? (
                <Button
                  onClick={() => handleDownload(app)}
                  size="lg"
                  className="flex-1 rounded-2xl h-20 text-2xl font-black shadow-2xl shadow-primary/30"
                >
                  {user ? <><Download className="mr-3 h-8 w-8" /> Download APK</> : <><Lock className="mr-3 h-8 w-8" /> Login to Download</>}
                </Button>
              ) : (
                <div className="flex-1 bg-muted/50 p-6 rounded-[2rem] border border-primary/10">
                  <div className="flex justify-between text-sm font-black mb-3 px-1">
                    <span className="text-primary uppercase tracking-widest">Real Download</span>
                    <span>{totalBytes > 0 && downloadProgress !== null ? `${downloadProgress.toFixed(0)}%` : 'Streaming'}</span>
                  </div>
                  <Progress value={totalBytes > 0 ? downloadProgress || 0 : undefined} className="h-4 bg-white rounded-full" />
                  <div className="mt-3 flex justify-between text-xs font-bold text-muted-foreground">
                    <span>{downloadedBytes} bytes{totalBytes ? ` / ${totalBytes} bytes` : ''}</span>
                    <span>{downloadSpeed > 0 ? `${Math.round(downloadSpeed / 1024)} KB/s` : 'Measuring…'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          {app.screenshot_url && (
            <section className="space-y-6">
              <h2 className="text-3xl font-black flex items-center gap-3">
                <Images className="h-6 w-6 text-primary" /> Preview
              </h2>
              <div className="relative aspect-video rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-muted">
                <Image
                  src={app.screenshot_url}
                  alt="App Screenshot"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </section>
          )}

          <section className="space-y-6">
            <h2 className="text-3xl font-black flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" /> Hub Description
            </h2>
            <div className="p-8 rounded-[3rem] bg-white border border-border/50 shadow-sm">
              <p className="text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap text-xl">
                {app.description}
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="p-8 rounded-[3rem] bg-card border border-border/50 shadow-sm space-y-8 sticky top-24">
            <h3 className="text-2xl font-black border-b border-border/50 pb-4">
              Metadata
            </h3>
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Version</span>
                <span className="font-black text-lg">{app.version}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Developer</span>
                <span className="font-black text-lg">{app.developer}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Requirement</span>
                <span className="font-black text-lg">Android 8.0+</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default AppDetailsContent;
