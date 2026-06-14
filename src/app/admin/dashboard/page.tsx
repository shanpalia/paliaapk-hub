"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Settings, 
  Trash2, 
  Edit, 
  TrendingUp, 
  Users, 
  Package, 
  BarChart3,
  Search,
  Grid
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
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Apps", value: "48", icon: Package, color: "text-blue-500" },
    { label: "Active Users", value: "1,240", icon: Users, color: "text-green-500" },
    { label: "Downloads (Monthly)", value: "12.4K", icon: TrendingUp, color: "text-primary" },
    { label: "Storage Used", value: "14.2 GB", icon: BarChart3, color: "text-purple-500" },
  ];

  const recentApps = [
    { id: "1", name: "WhatsApp", category: "Social", version: "2.23.4", downloads: "5B+", date: "2023-12-15", icon: PlaceHolderImages.find(i => i.id === "app-icon-1")?.imageUrl! },
    { id: "2", name: "Notion", category: "Productivity", version: "0.24.11", downloads: "10M+", date: "2023-12-12", icon: PlaceHolderImages.find(i => i.id === "app-icon-3")?.imageUrl! },
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
            <Button className="rounded-xl font-bold px-6 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Upload New App
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl border-border bg-white">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
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

        {/* Apps Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Manage Inventory</h2>
            <div className="relative w-full max-w-sm hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search catalog..." className="pl-10 rounded-xl bg-white" />
            </div>
          </div>
          
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-card">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border">
                  <TableHead className="font-bold">Application</TableHead>
                  <TableHead className="font-bold">Version</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Downloads</TableHead>
                  <TableHead className="font-bold">Last Updated</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApps.map((app) => (
                  <TableRow key={app.id} className="border-border hover:bg-muted/10 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <Image src={app.icon} alt={app.name} width={40} height={40} className="object-cover" />
                         </div>
                         <span>{app.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{app.version}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal border-primary/20 text-primary">{app.category}</Badge>
                    </TableCell>
                    <TableCell className="font-bold">{app.downloads}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{app.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Categories Section */}
        <div className="grid gap-6 md:grid-cols-2">
           <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-card">
             <CardHeader className="border-b bg-muted/10">
                <CardTitle className="text-lg flex items-center gap-2">
                   <Grid className="h-5 w-5 text-primary" /> Manage Categories
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <div className="space-y-4">
                   {["Productivity", "Social", "Action", "Photography"].map((cat) => (
                     <div key={cat} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border">
                        <span className="font-medium">{cat}</span>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Edit</Button>
                           <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive">Delete</Button>
                        </div>
                     </div>
                   ))}
                   <Button variant="outline" className="w-full rounded-xl border-dashed border-2 hover:bg-muted">
                      <Plus className="mr-2 h-4 w-4" /> Add Category
                   </Button>
                </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-card">
             <CardHeader className="border-b bg-muted/10">
                <CardTitle className="text-lg flex items-center gap-2">
                   <Users className="h-5 w-5 text-primary" /> User Moderation
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                   <Users className="h-8 w-8" />
                </div>
                <div>
                   <h4 className="font-bold">Review Registered Users</h4>
                   <p className="text-sm text-muted-foreground max-w-[240px]">Monitor user activity and manage membership permissions from here.</p>
                </div>
                <Button variant="secondary" className="rounded-xl px-8">Manage All Users</Button>
             </CardContent>
           </Card>
        </div>
      </main>
    </div>
  );
}
