"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface StoreIconProps { className?: string; size?: "sm" | "md" | "lg" | "xl"; }

export function StoreIcon({ className, size = "md" }: StoreIconProps) {
  const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-16 w-16", xl: "h-32 w-32" };
  return <div className={cn("relative overflow-hidden rounded-[22.5%] shadow-lg shadow-primary/20 bg-white", sizes[size], className)}><Image src="/icon-512.png" alt="PaliaAPK Hub" fill sizes="128px" className="object-cover" priority={size === "xl"} unoptimized /></div>;
}
