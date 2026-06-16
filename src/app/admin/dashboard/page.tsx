
"use client";

import { 
  PlusCircle, 
  Users, 
  Package, 
  Activity,
  Sparkles,
  Settings as SettingsIcon,
  ArrowRight,
  Database,
  ShieldCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase, AppData, UserProfile } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [apps, setApps] = useState<AppData[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);

      const [appsRes, usersRes] = await Promise.all([
        supabase.from('apps').select('*'),
        supabase.from('users').select('*')
      ]);

      if (appsRes.error) throw appsRes.error;
      if (usersRes.error) {
        console.warn("User Registry scan returned a non-critical error", usersRes.error);
      }

      if (appsRes.data) {
        console.log(`Hub Diagnostic: Found ${appsRes.data.length} binaries in registry.`);
        setApps(appsRes.data);
      }
      if (usersRes.data) setUsers(usersRes.data);
    } catch (err: any) {
      console.error("Hub Diagnostic: Registry handshake failure", err);
      setError(err.message || "Failed to sync with Supabase Registry Node");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    const testApp = {
      app_name: "Hub Diagnostics Tool",
      version: "1.0.0",
      description: "Automated test entry to verify storefront distribution protocols.",
      category: "Tools",
      developer: "PaliaAPK Hub Node",
      icon_url: "https://picsum.photos/seed/testicon/256/256",
      apk_url: "https://example.com/test.apk",
      downloads: 0,
      is_hidden: false,
      is_featured: false,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('apps').insert([testApp]);
      if (error) throw error;
      
      console.log("Hub Diagnostic: Seed successful.");
      toast({ 
        title: "Seed Protocol Complete", 
        description: "Test entry injected. Verify your Home feed now.",
        className: "bg-emerald-500 text-white font-black"
      });
      fetchData();
    } catch (err: any) {
      console.error("Hub Diagnostic: Seed failure", err);
      toast({ 
        variant: "destructive", 
        title: "Seed Failure", 
        description: err.message 
      });
    } finally {
      setSeeding(false);
    }
  };

  const stats = [
    { label: "Total Binaries", val: apps.length, icon: Package, color: "bg-blue-50/50 text-blue-600" },
    { label: "Published Nodes", val: apps.filter(a => !a.is_hidden).length, icon: CheckCircle2, color: "bg-emerald-50/50 text-emerald-600" },
    { label: "Hub Traffic", val: apps.reduce((acc, a) => acc + (a.downloads || 0), 0).toLocaleString(), icon: Activity, color: "bg-orange-50/50 text-orange-600" },
    { label: "Featured Assets", val: apps.filter(a => a.is_featured).length, icon: Sparkles, color: "bg-indigo-50/50 text-indigo-600" }
  ];

  const quickActions = [
    { label: "Publish New", desc: "Instantly deploy to Hub Storage", icon: PlusCircle, href: "/admin/apps/new", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Manage Hub", desc: "Edit or decommission entries", icon: Package, href: "/admin/apps", color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Clearance", desc: "Security role management", icon: Users, href: "/admin/users", color: "text-orange-500", bg: "bg-orange-50" },
    { label: "System Config", desc: "Infrastructure node settings", icon: SettingsIcon, href: "/admin/settings", color: "text-indigo-500", bg: "bg-indigo-50" }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black font-headline tracking-tighter uppercase">Command Center</h1>
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mt-3 bg-primary/10 w-fit px-4 py-1.5 rounded-full">
            Authenticated Hub Admin: {currentUser?.email || "System"}
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSeedData} 
            disabled={seeding}
            className="rounded-full h-10 px-6 font-black text-[10px] uppercase border-gray-200"
          >
            {seeding ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
            Force Seed Test entry
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-8 bg-red-50 border border-red-100 rounded-[3rem] flex items-center gap-6 animate-in slide-in-from-top-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-red-700">Registry Synchronization Fault</h3>
            <p className="text-xs font-medium text-red-600/70">{error}</p>
          </div>
          <Button onClick={fetchData} variant="ghost" className="rounded-full h-12 w-12 hover:bg-red-100">
            <RefreshCw className="h-5 w-5 text-red-600" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 transition-transform hover:scale-[1.02]">
            <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mb-6`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <h3 className="text-4xl font-black font-headline tracking-tighter">{loading ? "..." : stat.val}</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">{stat.label}</p>
          </Card>
        ))}
      </div>

      <section className="space-y-8">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary ml-4">Hub Protocols</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.href)}
              className="group flex flex-col p-10 bg-white rounded-[3.5rem] border border-gray-100 hover:border-primary/40 transition-all hover:shadow-3xl hover:shadow-primary/5 text-left relative overflow-hidden active:scale-95"
            >
              <div className={`w-16 h-16 rounded-[1.5rem] ${action.bg} ${action.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                <action.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter mb-2">{action.label}</h3>
              <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-[0.15em] opacity-60">
                {action.desc}
              </p>
              <ArrowRight className="absolute bottom-10 right-10 h-6 w-6 text-gray-200 group-hover:text-primary group-hover:translate-x-2 transition-all" />
            </button>
          ))}
        </div>
      </section>

      <Card className="rounded-[4rem] p-16 bg-black text-white relative overflow-hidden border-none shadow-3xl group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full -mr-64 -mt-64 blur-[120px] transition-transform duration-1000 group-hover:scale-125" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center shadow-inner">
              <Database className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-black tracking-tighter uppercase leading-tight">Supabase Protected<br />Distribution Framework</h3>
              <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">Native Cloud Hosting Node Active</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push('/admin/apps/new')}
            className="rounded-full px-16 h-20 premium-gradient font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-primary/20"
          >
            Deploy New Binary
          </Button>
        </div>
      </Card>
    </div>
  );
}
