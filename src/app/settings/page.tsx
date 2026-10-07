'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Smartphone, Sparkles, ShieldCheck, ExternalLink, LogIn, LogOut, Loader2 } from 'lucide-react';
import { AppData, supabase } from '@/lib/supabase';
import { AppCard } from '@/components/app-card';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const VERSION = '1.0.0';

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [apps, setApps] = useState<AppData[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    supabase.from('apps').select('*').order('downloads', { ascending: false }).limit(3)
      .then(({ data }) => setApps((data || []).filter(a => a.is_hidden !== true)));
  }, []);

  const checkForUpdates = async () => {
    setChecking(true);
    try {
      const registration = await navigator.serviceWorker?.getRegistration('/');
      if (!registration) {
        toast({ title: 'Update service unavailable', description: 'Install the latest PaliaAPK Hub build to enable background update checks.' });
        return;
      }
      await registration.update();
      toast({ title: 'Update check complete', description: 'The latest web app files have been checked.' });
    } catch {
      toast({ variant: 'destructive', title: 'Update check failed', description: 'Please try again when connected to the internet.' });
    } finally { setChecking(false); }
  };

  const handleLogout = async () => { await signOut(auth); toast({ title: 'Signed out' }); router.push('/'); };

  return <div className="space-y-8 pb-24">
    <section className="flex items-center gap-4 p-6 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm">
      <img src="/paliaapk-hub-icon.svg" alt="PaliaAPK Hub" className="h-20 w-20 rounded-[22.5%] shadow-lg" />
      <div className="flex-1"><h1 className="text-2xl font-black">PaliaAPK Hub</h1><p className="text-sm text-muted-foreground font-medium">Developer by ShanPalia</p><p className="text-xs text-muted-foreground mt-1">Version {VERSION}</p></div>
    </section>
    <section className="p-6 rounded-[2.5rem] bg-gray-50 border border-gray-100 space-y-4">
      <div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-primary"/><h2 className="text-lg font-black">App Update & Features</h2></div>
      <ul className="space-y-3 text-sm font-medium text-muted-foreground">
        <li>• Firebase Google account login with account chooser</li>
        <li>• Real APK download progress and network speed</li>
        <li>• Working app search across name, developer, category and description</li>
        <li>• Improved Android system back navigation</li>
        <li>• PaliaAPK Hub branding and launcher/PWA icon refresh</li>
      </ul>
      <Button onClick={checkForUpdates} disabled={checking} variant="outline" className="rounded-2xl h-12 font-bold">
        {checking ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <RefreshCw className="h-4 w-4 mr-2"/>} Check for updates
      </Button>
    </section>
    <section className="p-6 rounded-[2.5rem] bg-white border border-gray-100 space-y-4">
      <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-600"/><h2 className="text-lg font-black">Account</h2></div>
      {user ? <div className="flex items-center gap-4"><div className="h-12 w-12 rounded-2xl overflow-hidden bg-primary text-white flex items-center justify-center font-black">{user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover"/> : (user.email?.[0] || 'U').toUpperCase()}</div><div className="flex-1"><p className="font-black">{user.displayName || user.email?.split('@')[0] || 'Hub User'}</p><p className="text-xs text-muted-foreground">{user.email}</p></div><Button variant="outline" onClick={handleLogout} className="rounded-xl"><LogOut className="h-4 w-4"/></Button></div> : <Button onClick={() => router.push('/auth/login')} className="rounded-2xl h-12 font-black w-full"><LogIn className="h-4 w-4 mr-2"/> Sign in with Google</Button>}
    </section>
    {apps.length > 0 && <section className="space-y-4"><div className="flex items-center gap-3 px-1"><Smartphone className="h-5 w-5 text-primary"/><h2 className="text-lg font-black">Recommended Apps</h2></div><p className="text-xs text-muted-foreground px-1">Real published apps from PaliaAPK Hub that you can install on your phone.</p><div className="space-y-4">{apps.map(app => <AppCard key={app.id} app={app}/>)}</div></section>}
    <section className="p-6 rounded-[2.5rem] bg-black text-white space-y-4"><h2 className="text-lg font-black">More from PaliaAPK Hub</h2><p className="text-sm text-white/60">Browse the store for new apps, games and tools.</p><Button onClick={() => router.push('/search')} variant="outline" className="rounded-2xl bg-white text-black hover:bg-white/90 font-black"><ExternalLink className="h-4 w-4 mr-2"/> Find a new app</Button></section>
  </div>;
}
