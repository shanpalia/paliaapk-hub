
"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface AppCardProps {
  id: string;
  name: string;
  category: string;
  version: string;
  rating: number;
  iconUrl: string;
}

export function AppCard({ id, name, category, version, rating, iconUrl }: AppCardProps) {
  const router = useRouter();

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/apps/${id}`);
  };

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-[1.5rem] flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        <Link href={`/apps/${id}`} className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl shadow-sm bg-muted border border-border/20">
              <Image
                src={iconUrl}
                alt={name}
                width={80}
                height={80}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col justify-center overflow-hidden">
              <h3 className="line-clamp-1 font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mt-0.5">{category}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-xs font-bold">{rating}</span>
                <span className="text-[10px] text-muted-foreground ml-1 bg-muted px-1.5 py-0.5 rounded-full">v{version}</span>
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
