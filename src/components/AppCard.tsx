
"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface AppCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  downloads: string;
  iconUrl: string;
}

export function AppCard({ id, name, category, rating, downloads, iconUrl }: AppCardProps) {
  return (
    <Link href={`/apps/${id}`}>
      <Card className="group relative overflow-hidden border-none bg-card shadow-sm hover:shadow-md transition-all duration-300 rounded-[1.25rem]">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl shadow-inner bg-muted">
              <Image
                src={iconUrl}
                alt={name}
                width={80}
                height={80}
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col justify-between overflow-hidden">
              <div>
                <h3 className="line-clamp-1 font-semibold text-foreground group-hover:text-primary transition-colors">
                  {name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{category}</p>
              </div>
              <div className="mt-auto flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs font-medium">{rating}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Download className="h-3 w-3" />
                  <span className="text-xs">{downloads}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
