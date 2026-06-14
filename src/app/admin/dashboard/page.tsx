
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
  Loader2,
  AlertCircle,
  Eye,
  Home,
  ArrowUpDown,
  RefreshCcw,
  Filter
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "link";
import { useEffect, useState, useMemo } from "react";
import { supabase, AppData, isSupabaseConfigured } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CATEGORIES = ["Social", "Games", "Productivity", "Photography", "Tools", "Education", "Entertainment", "General"];

export default function AdminDashboard() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isInvalidKey, setIsInvalidKey] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const router = useRouter();
  const { toast } = useToast();

  const fetchApps = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.message === "Invalid API key") setIsInvalidKey(true);
        throw error;
      }
      setApps(data || []);
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        // Strict admin check
        if (authError || !session || session.user.email !== "shanpalia786@gmail.com") {
          toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to access the console." });
          router.push("/");
          return;
        }
        
        fetchApps();
      } catch (err: any) {
        setLoading(false);
        router.push("/");
      }
    };

    checkAuth();
  }, [router, toast]);

  const extractPathFromUrl = (url: string, bucket: string) => {
    if (!url || !url.includes(`${bucket}/`)) return null;
    const parts = url.split(`${bucket}/`);
    return parts.length > 1 ? parts[1] : null;
  };

  const handleDelete = async (app: AppData) => {
    if (!isSupabaseConfigured || isInvalidKey) return;
    if (!confirm(`Delete ${app.app_name}? This will remove all files from storage permanently.`)) return;

    try {
      const iconPath = extractPathFromUrl(app.icon_url, 'app-icons');
      const apkPath = extractPathFromUrl(app.apk_url, 'apk-files');
      const ssPath = extractPathFromUrl(app.screenshot_url || '', 'screenshots');

      // 1. Storage Cleanup
      const cleanupPromises = [];
      if (iconPath) cleanupPromises.push(supabase.storage.from('app-icons').remove([iconPath]));
      if (apkPath) cleanupPromises.push(supabase.storage.from('apk-files').remove([apkPath]));
      if (ssPath) cleanupPromises.push(supabase.storage.from('screenshots').remove([ssPath]));
      
      await Promise.all(cleanupPromises);

      // 2. Database Cleanup
      const { error } = await supabase.from('apps').delete().eq('id', app.id);
      if (error) throw error;
      
      setApps(apps.filter(a => a.id !== app.id));
      toast({ title: "App Deleted Successfully", description: `${app.app_name} has been removed from the repository.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: err.message });
    }
  };

  // Filtered and Sorted Inventory
  const filteredApps = useMemo(() => {
    let result = apps.filter(app => {
      const matchesSearch = app.app_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || app.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "downloads":
        return result.sort((a, b) => b.downloads - a.downloads);
      case "name":
        return result.sort((a, b) => a.app_name.localeCompare(b.app_name));
      case "latest":
      default:
        return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [apps, searchQuery, categoryFilter, sortBy]);

  const showConfigAlert = !isSupabaseConfigured || isInvalidKey;
  const totalDownloads = apps.reduce((sum, app) => sum + (app.downloads || 0), 0);
  const categoriesCount = Array.from(new Set(apps.map(a => a.category))).length;

  const stats = [
    { label: "Total Apps", value: apps.length.toString(), icon: Package, color: "text-blue-500" },
    { label: "Total Downloads", value: totalDownloads.toLocaleString(), icon: TrendingUp, color: "text-primary" },
    { label: "Active Categories", value: categoriesCount.toString(), icon: LayoutGrid, color: "text-green-500" },
    { label: "System Status", value: !showConfigAlert ? "Online" : "Offline", icon: BarChart3, color: !showConfigAlert ? "text-purple-500" : "text-destructive" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20 lg:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {showConfigAlert && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-black uppercase tracking-widest text-xs">Service Offline</AlertTitle>
            <AlertDescription className="text-sm">Database connection not established.</AlertDescription>
          </Alert>
        )}

        {/* Console Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="rounded-full font-bold h-10 gap-2 border-primary/20 hover:bg-primary/5">
                  <Home className="h-4 w-4" /> Back to Store
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-black tracking-tight mt-4">Management Console</h1>
            <p className="text-muted-foreground font-medium">Control center for marketplace applications and analytics.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => fetchApps(true)} 
              disabled={refreshing}
              className="rounded-xl font-bold h-12 gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Link href="/admin/add">
              <Button disabled={showConfigAlert} className="rounded-xl font-bold h-12 px-6 shadow-xl shadow-primary/20">
                <Plus className="mr-2 h-5 w-5" /> Publish New App
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inventory Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-black tracking-tight w-full">Inventory Catalog</h2>
            <div className="flex flex-wrap items-center gap-3 w-full justify-end">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search by name..." 
                  className="pl-11 rounded-xl bg-white h-12 font-medium border-none shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] h-12 rounded-xl bg-white border-none shadow-sm font-bold">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-12 rounded-xl bg-white border-none shadow-sm font-bold">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="downloads">Popularity</SelectItem>
                  <SelectItem value="name">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-black h-14 pl-8">Application</TableHead>
                  <TableHead className="font-black">Version</TableHead>
                  <TableHead className="font-black">Category</TableHead>
                  <TableHead className="font-black">Downloads</TableHead>
                  <TableHead className="font-black">Created</TableHead>
                  <TableHead className="text-right font-black pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24 text-muted-foreground font-medium">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      No matching applications found
                    </TableCell>
                  </TableRow>
                ) : filteredApps.map((app) => (
                  <TableRow key={app.id} className="border-border group transition-colors">
                    <TableCell className="font-medium pl-8">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted border border-border/50 relative shrink-0">
                            <Image 
                              src={app.icon_url || "https://picsum.photos/seed/app/48/48"} 
                              alt={app.app_name} 
                              fill 
                              className="object-cover" 
                            />
                         </div>
                         <div className="flex flex-col">
                           <span className="font-black text-base line-clamp-1">{app.app_name}</span>
                           <span className="text-[10px] text-muted-foreground font-bold uppercase">ID: {String(app.id).slice(0, 8)}</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-muted-foreground">{app.version}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                        {app.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-black text-lg">{app.downloads.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground text-sm font-medium">
                      {new Date(app.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2">
                         <Link href={`/apps/${app.id}`}>
                           <Button variant="ghost" size="icon" title="View in Store" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5">
                              <Eye className="h-5 w-5" />
                           </Button>
                         </Link>
                         <Link href={`/admin/edit/${app.id}`}>
                           <Button variant="ghost" size="icon" title="Edit Properties" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted">
                              <Edit className="h-5 w-5" />
                           </Button>
                         </Link>
                         <Button onClick={() => handleDelete(app)} variant="ghost" size="icon" title="Remove App" className="h-10 w-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5">
                            <Trash2 className="h-5 w-5" />
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}
