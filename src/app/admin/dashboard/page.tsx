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
  Home,
  ArrowUpDown,
  RefreshCcw,
  Filter,
  Eye,
  Pencil,
  Trash
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
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
  
  // Selection Dialog State
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectAction, setSelectAction] = useState<'edit' | 'delete'>('edit');
  const [selectedAppId, setSelectedAppId] = useState<string>("");

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
        if (authError || !session || session.user.email !== "shanpalia786@gmail.com") {
          toast({ variant: "destructive", title: "Access Denied", description: "Administrative authentication required." });
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
    if (!confirm(`Are you sure you want to delete ${app.app_name}? This will remove all files from storage permanently.`)) return;

    try {
      setLoading(true);
      const iconPath = extractPathFromUrl(app.icon_url, 'app-icons');
      const apkPath = extractPathFromUrl(app.apk_url, 'apk-files');
      const ssPath = extractPathFromUrl(app.screenshot_url || '', 'screenshots');

      const cleanupPromises = [];
      if (iconPath) cleanupPromises.push(supabase.storage.from('app-icons').remove([iconPath]));
      if (apkPath) cleanupPromises.push(supabase.storage.from('apk-files').remove([apkPath]));
      if (ssPath) cleanupPromises.push(supabase.storage.from('screenshots').remove([ssPath]));
      
      await Promise.all(cleanupPromises);

      const { error } = await supabase.from('apps').delete().eq('id', app.id);
      if (error) throw error;
      
      setApps(apps.filter(a => a.id !== app.id));
      toast({ title: "App Deleted Successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: err.message });
    } finally {
      setLoading(false);
      setIsSelectModalOpen(false);
    }
  };

  const handleActionClick = (type: 'edit' | 'delete') => {
    setSelectAction(type);
    setIsSelectModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedAppId) return;
    const app = apps.find(a => String(a.id) === selectedAppId);
    if (!app) return;

    if (selectAction === 'edit') {
      router.push(`/admin/edit/${app.id}`);
    } else {
      handleDelete(app);
    }
  };

  const handleQuickUpdate = () => {
    fetchApps(true);
    toast({ title: "Database Synchronized", description: "Remote repository data has been updated." });
  };

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

  const totalDownloads = apps.reduce((sum, app) => sum + (app.downloads || 0), 0);
  const categoriesCount = Array.from(new Set(apps.map(a => a.category))).length;

  const stats = [
    { label: "Total Apps", value: apps.length.toString(), icon: Package, color: "text-blue-500" },
    { label: "Total Downloads", value: totalDownloads.toLocaleString(), icon: TrendingUp, color: "text-primary" },
    { label: "Active Categories", value: categoriesCount.toString(), icon: LayoutGrid, color: "text-green-500" },
    { label: "System Status", value: !isInvalidKey ? "Online" : "Offline", icon: BarChart3, color: !isInvalidKey ? "text-purple-500" : "text-destructive" },
  ];

  if (loading && apps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20 lg:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-10">
        {isInvalidKey && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-black uppercase tracking-widest text-xs">Service Offline</AlertTitle>
            <AlertDescription className="text-sm">Database connection not established.</AlertDescription>
          </Alert>
        )}

        {/* Console Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="rounded-full font-bold h-10 gap-2 border-primary/20 hover:bg-primary/5">
                  <Home className="h-4 w-4" /> Back to Store
                </Button>
              </Link>
            </div>
            <h1 className="text-5xl font-black tracking-tight mt-4">Management Console</h1>
            <p className="text-muted-foreground font-medium text-lg">Central control suite for marketplace applications and cloud assets.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
            <Link href="/admin/add">
              <Button className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all bg-primary px-6">
                <Plus className="mr-3 h-6 w-6" /> Publish New
              </Button>
            </Link>
            
            <Button 
              onClick={() => handleActionClick('edit')}
              className="h-16 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all bg-blue-600 hover:bg-blue-700 px-6"
            >
              <Pencil className="mr-3 h-5 w-5" /> Edit App
            </Button>

            <Button 
              onClick={handleQuickUpdate}
              className="h-16 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all bg-orange-500 hover:bg-orange-600 px-6"
            >
              <RefreshCcw className={`mr-3 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} /> Update
            </Button>

            <Button 
              onClick={() => handleActionClick('delete')}
              className="h-16 rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-all bg-destructive hover:bg-red-700 px-6"
            >
              <Trash className="mr-3 h-5 w-5" /> Delete App
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <p className="text-4xl font-black tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inventory Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <h2 className="text-3xl font-black tracking-tight w-full">Inventory Catalog</h2>
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
                <SelectTrigger className="w-[180px] h-12 rounded-xl bg-white border-none shadow-sm font-bold">
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
                <SelectTrigger className="w-[180px] h-12 rounded-xl bg-white border-none shadow-sm font-bold">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="downloads">Most Popular</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-black h-16 pl-10 text-sm uppercase tracking-widest">Application</TableHead>
                  <TableHead className="font-black text-sm uppercase tracking-widest">Version</TableHead>
                  <TableHead className="font-black text-sm uppercase tracking-widest">Category</TableHead>
                  <TableHead className="font-black text-sm uppercase tracking-widest">Downloads</TableHead>
                  <TableHead className="font-black text-sm uppercase tracking-widest">Released</TableHead>
                  <TableHead className="text-right font-black pr-10 text-sm uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-32 text-muted-foreground font-medium">
                      <Package className="h-16 w-16 mx-auto mb-6 opacity-20" />
                      {loading ? <Loader2 className="animate-spin h-8 w-8 mx-auto" /> : "No applications match your criteria"}
                    </TableCell>
                  </TableRow>
                ) : filteredApps.map((app) => (
                  <TableRow key={app.id} className="border-border group transition-colors">
                    <TableCell className="font-medium pl-10">
                      <div className="flex items-center gap-5">
                         <div className="h-14 w-14 rounded-2xl overflow-hidden bg-muted border border-border/50 relative shrink-0 shadow-sm">
                            <Image 
                              src={app.icon_url || "https://picsum.photos/seed/app/64/64"} 
                              alt={app.app_name} 
                              fill 
                              className="object-cover" 
                            />
                         </div>
                         <div className="flex flex-col">
                           <span className="font-black text-lg line-clamp-1">{app.app_name}</span>
                           <span className="text-[10px] text-muted-foreground font-bold uppercase truncate max-w-[150px]">
                             FILE: {app.apk_file_name || String(app.id).slice(0, 8)}
                           </span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-muted-foreground">{app.version}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest border-primary/20 text-primary bg-primary/5 px-3 py-1">
                        {app.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-black text-xl">{app.downloads.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground text-sm font-medium">
                      {new Date(app.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex justify-end gap-3">
                         <Link href={`/apps/${app.id}`}>
                           <Button variant="ghost" size="icon" title="View Store Page" className="h-11 w-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5">
                              <Eye className="h-5 w-5" />
                           </Button>
                         </Link>
                         <Link href={`/admin/edit/${app.id}`}>
                           <Button variant="ghost" size="icon" title="Configure App" className="h-11 w-11 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted">
                              <Edit className="h-5 w-5" />
                           </Button>
                         </Link>
                         <Button onClick={() => handleDelete(app)} variant="ghost" size="icon" title="Destroy Record" className="h-11 w-11 rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/5">
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

      {/* Selection Modal */}
      <Dialog open={isSelectModalOpen} onOpenChange={setIsSelectModalOpen}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-lg p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">
              {selectAction === 'edit' ? 'Configure Application' : 'Delete Application'}
            </DialogTitle>
            <p className="text-muted-foreground font-medium pt-2">
              {selectAction === 'edit' ? 'Select an application from the repository to update its metadata and assets.' : 'Select an application to permanently remove it and all its associated cloud storage.'}
            </p>
          </DialogHeader>
          
          <div className="py-8 space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select from Inventory</p>
              <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none text-lg font-bold px-6">
                  <SelectValue placeholder="Browse applications..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {apps.map(app => (
                    <SelectItem key={app.id} value={String(app.id)}>{app.app_name} (v{app.version})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:flex-row flex-col">
            <Button 
              variant="outline" 
              className="h-14 rounded-2xl font-black flex-1 border-border/50"
              onClick={() => setIsSelectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className={`h-14 rounded-2xl font-black flex-1 shadow-xl transition-all ${selectAction === 'delete' ? 'bg-destructive hover:bg-red-700 shadow-red-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
              onClick={handleConfirmAction}
              disabled={!selectedAppId}
            >
              {selectAction === 'edit' ? 'Continue to Editor' : 'Confirm Deletion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
