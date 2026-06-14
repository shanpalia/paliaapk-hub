
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, LayoutGrid, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Categories", href: "/categories", icon: LayoutGrid },
    { name: "Profile", href: "/profile", icon: User },
  ];

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden bg-white border-t rounded-t-[2rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] px-6 pb-2 pt-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
