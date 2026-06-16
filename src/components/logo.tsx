"use client";

import { cn } from "@/lib/utils";

export function HexagonLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4facfe" />
            <stop offset="50%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#92fe9d" />
          </linearGradient>
        </defs>
        <path
          d="M50 5L90 25V75L50 95L10 75V25L50 5Z"
          fill="url(#logoGrad)"
          stroke="white"
          strokeWidth="2"
        />
        <text
          x="50"
          y="65"
          textAnchor="middle"
          fill="white"
          fontSize="45"
          fontWeight="900"
          fontFamily="system-ui"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))" }}
        >
          S
        </text>
      </svg>
    </div>
  );
}