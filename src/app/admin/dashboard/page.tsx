
"use client";

import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Package, 
  Activity,
  Sparkles,
  Settings as SettingsIcon,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { AppEntry, UserProfile } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();

  const appsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "apps"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: apps } = useCollection<AppEntry>(appsQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const { data: users } = useCollection<UserProfile>(usersQuery);

  const stats = [
    { label: "Total Binaries", val: apps?.length || 0, icon: Package, color: "bg-blue-50/50 text-blue-600" },
    { label: "Client Nodes", val: users?.length || 0, icon: Users, color: "bg-emerald-50/50 text-emerald-600" },
    { label: "Hub Traffic", val: apps?.reduce((acc, a) => acc + (a.downloads || 0), 0).toLocaleString(), icon: Activity, color: "bg-orange-50/50 text-orange-600" },
    { label: "Featured Assets", val: apps?.filter(a => a.isFeatured).length || 0, icon: Sparkles, color: "bg-indigo-50/50 text-indigo-600" }
  ];

  const quickActions = [
    { label: "Publish New", desc: "Deploy binary to Global CDN", icon: PlusCircle, href: "/admin/apps/new", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Manage Hub", desc: "Edit or decommission entries", icon: Package, href: "/admin/apps", color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Clearance", desc: "Security role management", icon: Users, href: "/admin/users", color: "text-orange-500", bg: "bg-orange-50" },
    { label: "System Config", desc: "Infrastructure node settings", icon: SettingsIcon, href: "/admin/settings", color: "text-indigo-500", bg: "bg-indigo-50" }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div>
        <h1 className="text-5xl font-black font-headline tracking-tighter uppercase">Command Center</h1>
        <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mt-3 bg-primary/10 w-fit px-4 py-1.5 rounded-full">
          Authenticated Node: {currentUser?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 transition-transform hover:scale-[1.02]">
            <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mb-6`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <h3 className="text-4xl font-black font-headline tracking-tighter">{stat.val}</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">{stat.label}</p>
          </Card>
        ))}
      </div>

      <section className="space-y-8">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary ml-4">Terminal Protocols</h2>
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
              <Activity className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-black tracking-tighter uppercase leading-tight">Infrastructure Node<br />Status: Nominal</h3>
              <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">GitHub Global Distribution Framework v3 Active</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push('/admin/apps/new')}
            className="rounded-full px-16 h-20 premium-gradient font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-primary/20"
          >
            Deploy Binary
          </Button>
        </div>
      </Card>
    </div>
  );
}
