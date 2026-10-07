"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function HexagonLogo({ className }: { className?: string }) {
  return <div className={cn("relative overflow-hidden rounded-[22.5%] bg-white shadow-xl", className)}><Image src="/paliaapk-hub-icon.svg" alt="PaliaAPK Hub" fill sizes="128px" className="object-cover" priority unoptimized /></div>;
}
