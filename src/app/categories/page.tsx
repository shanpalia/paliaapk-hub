
"use client";

import { Navigation } from "@/components/Navigation";
import { useEffect, useState } from "react";
import { supabase, AppData, isSupabaseConfigured } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid, Users, Gamepad2, Wrench, GraduationCap, Play, Briefcase, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { name: "Social", icon: Users, color: "bg-blue-500" },
  { name: "Tools", icon: Wrench, color: "bg-orange-500" },
  { name: "Games", icon: Gamepad2, color: "bg-red-500" },
  { name: "Education", icon: GraduationCap, color: "bg-emerald-500" },
  { name: "Entertainment", icon: Play, color: "bg-purple-500" },
  { name: "Productivity", icon: Briefcase, color: "bg-indigo-500" },
  { name: "General", icon: LayoutGrid, color: "bg-slate-500" },
];

export default function CategoriesPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('apps').select('category');
      if (data) {
        const catCounts: Record<string, number> = {};
        data.forEach(app => {
          const cat = app.category || "General";
          catCounts[cat] = (catCounts[cat] || 0) + 1;
        });
        setCounts(catCounts);
      }
      setLoading(false);
    }
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Browse Categories</h1>
          <p className="text-muted-foreground font-medium">Find your next favorite app by department.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} href={`/search?category=${cat.name}`}>
                <Card className="hover:shadow-lg transition-all active:scale-[0.98] border-none bg-card rounded-[2rem] overflow-hidden group">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-14 w-14 rounded-2xl ${cat.color} flex items-center justify-center text-white shadow-lg`}>
                        <cat.icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black">{cat.name}</h3>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                          {counts[cat.name] || 0} Apps
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
