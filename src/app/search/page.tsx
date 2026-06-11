
import { Search as SearchIcon, TrendingUp, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

const trendingSearches = ['Minecraft', 'PUBG Mobile', 'WhatsApp', 'Instagram', 'Adobe Lightroom', 'Spotify'];
const recentSearches = ['Clash of Clans', 'Zoom'];

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-10 h-12 rounded-2xl bg-gray-50 border-none ring-offset-background focus-visible:ring-primary" 
          placeholder="Search apps and games..." 
          autoFocus
        />
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Recent Searches</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((s) => (
            <div key={s} className="px-4 py-2 rounded-full bg-gray-50 text-sm border border-gray-100">
              {s}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Trending Apps</h2>
        </div>
        <div className="space-y-4">
          {trendingSearches.map((s, idx) => (
            <div key={s} className="flex items-center gap-4 cursor-pointer active:opacity-70 transition-opacity">
              <span className="text-primary font-bold w-4">{idx + 1}</span>
              <span className="font-medium">{s}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
