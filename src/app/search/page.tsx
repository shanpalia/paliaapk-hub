'use client';

import { useEffect, useState } from 'react';
import { Search as SearchIcon, TrendingUp, Clock, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AppCard } from '@/components/app-card';
import { AppData, supabase } from '@/lib/supabase';

const trendingSearches = ['Minecraft', 'PUBG Mobile', 'WhatsApp', 'Instagram', 'Adobe Lightroom', 'Spotify'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => { try { setRecentSearches(JSON.parse(localStorage.getItem('palia-searches') || '[]')); } catch {} }, []);
  useEffect(() => {
    const value = query.trim(); if (!value) { setResults([]); setLoading(false); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const safe = value.trim().replace(/[%_]/g, '');
      const pattern = `%${safe}%`;
      try {
        // Run independent filters instead of a fragile PostgREST .or() expression.
        const fields = ['app_name', 'developer', 'category', 'description'] as const;
        const responses = await Promise.all(
          fields.map((field) =>
            supabase
              .from('apps')
              .select('*')
              .ilike(field, pattern)
              .order('created_at', { ascending: false })
              .limit(30)
          )
        );
        const firstError = responses.find((response) => response.error)?.error;
        if (firstError) throw firstError;

        const unique = new Map<string, AppData>();
        for (const response of responses) {
          for (const app of (response.data || []) as AppData[]) {
            if (app.is_hidden !== true) unique.set(app.id, app);
          }
        }
        setResults(
          Array.from(unique.values())
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 30)
        );
      } catch (error) {
        console.error('Search failed', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);
  const runSearch = (value: string) => {
    const clean = value.trim(); setQuery(value);
    if (!clean) return;
    const next = [clean, ...recentSearches.filter(item => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    setRecentSearches(next); localStorage.setItem('palia-searches', JSON.stringify(next));
  };
  return <div className="space-y-8 pb-24">
    <div className="relative"><SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10"/><Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSearch(query)} className="pl-12 pr-12 h-14 rounded-2xl bg-gray-50 border-none ring-offset-background focus-visible:ring-primary font-semibold" placeholder="Search apps and games..." autoFocus/>{query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2"><X className="h-4 w-4"/></button>}</div>
    {query.trim() ? <section className="space-y-4"><div className="flex items-center justify-between px-1"><h2 className="text-lg font-black">Results for “{query.trim()}”</h2>{loading && <Loader2 className="h-5 w-5 animate-spin text-primary"/>}</div>{!loading && results.length === 0 ? <div className="py-16 text-center rounded-[2rem] bg-gray-50 border border-dashed border-gray-200"><SearchIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30"/><p className="font-bold">No published app found</p><p className="text-xs text-muted-foreground mt-1">Try an app name, developer, category or keyword.</p></div> : <div className="space-y-4">{results.map(app => <AppCard key={app.id} app={app}/>)}</div>}</section> : <>{recentSearches.length > 0 && <section><div className="flex items-center gap-2 mb-4 text-muted-foreground"><Clock className="h-4 w-4"/><h2 className="text-sm font-semibold uppercase tracking-wider">Recent Searches</h2></div><div className="flex flex-wrap gap-2">{recentSearches.map(s => <button key={s} onClick={() => setQuery(s)} className="px-4 py-2 rounded-full bg-gray-50 text-sm border border-gray-100">{s}</button>)}</div></section>}<section><div className="flex items-center gap-2 mb-4 text-muted-foreground"><TrendingUp className="h-4 w-4"/><h2 className="text-sm font-semibold uppercase tracking-wider">Popular Searches</h2></div><div className="space-y-3">{trendingSearches.map((s, idx) => <button key={s} onClick={() => setQuery(s)} className="w-full flex items-center gap-4 text-left cursor-pointer active:opacity-70 transition-opacity"><span className="text-primary font-bold w-4">{idx + 1}</span><span className="font-medium">{s}</span></button>)}</div></section></>}
  </div>;
}
