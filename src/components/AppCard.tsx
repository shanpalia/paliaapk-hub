
"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { AppData, supabase } from "@/lib/supabase";

interface AppCardProps {
  app: AppData;
}

export function AppCard({ app }: AppCardProps) {
  const router = useRouter();

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (app.apk_url) {
      window.open(app.apk_url, "_blank");
      try {
        await supabase
          .from('apps')
          .update({ downloads: (app.downloads || 0) + 1 })
          .eq('id', app.id);
      } catch (err) {
        console.error("Hub Distribution: Download increment fault", err);
      }
    }
  };

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-[1.5rem] flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        <Link href={`/apps/${app.id}`} className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl shadow-sm bg-muted border border-border/20">
              <Image
                src={app.icon_url || `https://picsum.photos/seed/${app.id}/200/200`}
                alt={app.app_name}
                width={80}
                height={80}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col justify-center overflow-hidden">
              <h3 className="line-clamp-1 font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {app.app_name}
              </h3>
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mt-0.5">{app.category}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-xs font-bold">4.8</span>
                <span className="text-[10px] text-muted-foreground ml-1 bg-muted px-1.5 py-0.5 rounded-full">v{app.version}</span>
              </div>
            </div>
          </div>
        </Link>
        <div className="mt-auto">
          <Button 
            className="w-full rounded-xl h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10"
            onClick={handleDownloadClick}
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
