"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Edit, 
  TrendingUp, 
  Package, 
  BarChart3,
  Search,
  LayoutGrid,
  Loader2
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, AppData } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== "shanpalia786@gmail.com") {
        router.push("/auth/login");
        return;
      }
      fetchApps();
    };

    const fetchApps = async () => {
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setApps(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const { error } = await supabase.from('apps').delete().eq('id', id);
      if (error) throw error;
      
      setApps(apps.filter(app => app.id !== id));
      toast({ title: "App deleted successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete app", description: err.message });
    }
  };

  const totalDownloads = apps.reduce((sum, app) => sum + (app.downloads || 0), 0);

  const stats = [
    { label: "Total Apps", value: apps.length.toString(), icon: Package, color: "text-blue-500" },
    { label: "Total Downloads", value: totalDownloads.toLocaleString(), icon: TrendingUp, color: "text-primary" },
    { label: "Active Categories", value: Array.from(new Set(apps.map(a => a.category))).length.toString(), icon: LayoutGrid, color: "text-green-500" },
    { label: "System Status", value: "Online", icon: BarChart3, color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Admin Console</h1>
            <p className="text-muted-foreground">Manage your marketplace repository and monitor performance.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/add">
              <Button className="rounded-xl font-bold px-6 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Upload New App
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-none shadow-sm rounded-2xl overflow-hidden bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Manage Inventory</h2>
            <div className="relative w-full max-w-sm hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search catalog..." className="pl-10 rounded-xl bg-white" />
            </div>
          </div>
          
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-card">
            {loading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border">
                    <TableHead className="font-bold">Application</TableHead>
                    <TableHead className="font-bold">Version</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Downloads</TableHead>
                    <TableHead className="font-bold">Uploaded On</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No apps found</TableCell></TableRow>
                  ) : apps.map((app) => (
                    <TableRow key={app.id} className="border-border hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                              <Image 
                                src={app.image_url || "https://picsum.photos/seed/app/40/40"} 
                                alt={app.app_name} 
                                fill 
                                className="object-cover" 
                              />
                           </div>
                           <span>{app.app_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{app.version}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal border-primary/20 text-primary">{app.category}</Badge>
                      </TableCell>
                      <TableCell className="font-bold">{app.downloads}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           <Link href={`/admin/edit/${app.id}`}>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Edit className="h-4 w-4" />
                             </Button>
                           </Link>
                           <Button onClick={() => handleDelete(app.id, app.app_name)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80">
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
