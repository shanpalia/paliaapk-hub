
"use client";

import { cn } from "@/lib/utils";

interface StoreIconProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function StoreIcon({ className, size = "md" }: StoreIconProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-32 w-32",
  };

  return (
    <div className={cn(
      "relative flex items-center justify-center overflow-hidden rounded-[22.5%] bg-gradient-to-br from-[#2DD4BF] to-[#0D9488] shadow-lg shadow-primary/20",
      sizes[size],
      className
    )}>
      {/* Subtle App Grid Background */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-2 opacity-20">
        <div className="rounded-md bg-white" />
        <div className="rounded-md bg-white" />
        <div className="rounded-md bg-white" />
        <div className="rounded-md bg-white" />
      </div>
      
      {/* Central Download Arrow */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="relative z-10 h-3/5 w-3/5 text-white"
      >
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
