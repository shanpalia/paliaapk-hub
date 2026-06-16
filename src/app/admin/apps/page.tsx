
"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package,
  PlusCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { supabase, AppData } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export default function ManageApps() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setApps(data);
    setLoading(false);
  };

  const toggleVisibility = async (id: string, currentHidden: boolean) => {
    const { error } = await supabase
      .from('apps')
      .update({ is_hidden: !currentHidden } as any)
      .eq('id', id);
    
    if (!error) fetchApps();
  };

  const deleteApp = async (id: string) => {
    if (!confirm("Decommission this hub entry?")) return;
    const { error } = await supabase.from('apps').delete().eq('id', id);
    if (!error) {
      toast({ title: "Hub Entry Removed" });
      fetchApps();
    }
  };

  const filteredApps = apps.filter(app => 
    app.app_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Accessing Hub Repository...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tighter uppercase">Manage Hub</h1>
          <p className="text-primary text-[9px] font-black uppercase tracking-[0.3em] mt-2">Distribution Repository Control</p>
        </div>
        <Button onClick={() => router.push('/admin/apps/new')} className="rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest premium-gradient">
          <PlusCircle className="mr-2 h-5 w-5" /> Publish New Binary
        </Button>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="rounded-2xl h-14 pl-12 bg-white border-gray-100 shadow-sm font-bold" 
          placeholder="Filter hub repository..." 
        />
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-none">
              <TableHead className="pl-8 font-black text-[9px] uppercase tracking-widest">Binary Hub Entry</TableHead>
              <TableHead className="font-black text-[9px] uppercase tracking-widest text-center">Traffic</TableHead>
              <TableHead className="font-black text-[9px] uppercase tracking-widest text-center">Version</TableHead>
              <TableHead className="text-right pr-8 font-black text-[9px] uppercase tracking-widest">Protocol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApps.map((app) => (
              <TableRow key={app.id} className="h-24 hover:bg-gray-50/30 border-gray-100 group">
                <TableCell className="pl-8">
                  <div className="flex items-center gap-4">
                    <img 
                      src={app.icon_url || `https://picsum.photos/seed/${app.id}/100/100`} 
                      className={`w-14 h-14 rounded-2xl object-cover shadow-sm ${app.is_hidden ? 'opacity-30 grayscale' : ''}`} 
                    />
                    <div>
                      <p className={`font-black tracking-tighter ${app.is_hidden ? 'text-muted-foreground line-through' : 'text-lg'}`}>{app.app_name}</p>
                      <Badge variant="secondary" className="rounded-full font-black text-[7px] uppercase tracking-wider h-4">{app.category}</Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-black text-sm">{app.downloads || 0}</TableCell>
                <TableCell className="text-center font-black">v{app.version}</TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="rounded-xl h-10 w-10" 
                      onClick={() => toggleVisibility(app.id, app.is_hidden || false)}
                    >
                      {app.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-primary" />}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="rounded-xl h-10 w-10 bg-gray-100 hover:bg-primary/10 hover:text-primary" 
                      onClick={() => router.push(`/admin/apps/new?edit=${app.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="rounded-xl h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50" 
                      onClick={() => deleteApp(app.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredApps.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                    <Package className="h-12 w-12" />
                    <p className="font-black text-xs uppercase tracking-widest">No entries found in hub terminal.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
