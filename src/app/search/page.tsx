
"use client";

import { Navigation } from "@/components/Navigation";
import { AppCard } from "@/components/AppCard";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useMemo } from "react";
import { supabase, AppData, isSupabaseConfigured } from "@/lib/supabase";
import { Search as SearchIcon, Loader2, FilterX } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");

  useEffect(() => {
    async function fetchApps() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('apps').select('*');
      setApps(data || []);
      setLoading(false);
    }
    fetchApps();
  }, []);

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesQuery = app.app_name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter ? app.category === categoryFilter : true;
      return matchesQuery && matchesCategory;
    });
  }, [apps, query, categoryFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="relative mb-10">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
          <Input
            placeholder={categoryFilter ? `Search in ${categoryFilter}...` : "Search all apps..."}
            className="h-16 pl-16 rounded-[2rem] text-xl font-medium bg-muted/30 border-none focus-visible:ring-primary shadow-inner"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {categoryFilter && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black">Category: <span className="text-primary italic">{categoryFilter}</span></h2>
            <button 
              onClick={() => window.location.href = '/search'}
              className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
            <FilterX className="h-20 w-20 mb-4" />
            <h3 className="text-2xl font-black uppercase tracking-widest">No Matches Found</h3>
            <p className="font-medium mt-2">Try a different search term or browse categories.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredApps.map((app) => (
              <AppCard 
                key={app.id} 
                id={app.id}
                name={app.app_name}
                category={app.category || "General"}
                version={app.version}
                rating={4.8}
                iconUrl={app.icon_url}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
