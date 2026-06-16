
'use client';

import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Package, 
  Settings as SettingsIcon,
  LogOut,
  Loader2,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { HexagonLogo } from "@/components/logo";
import { useAuth, useUser } from "@/firebase";
import { useEffect, useState, useRef } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

const TEST_ADMIN_EMAIL = "shanpalia786@gmail.com";
const AUTH_TIMEOUT_MS = 10000; 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user: currentUser, loading: userLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clearance Bypass for Login Terminal
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    // Initialize Security Watchdog
    timeoutRef.current = setTimeout(() => {
      if (isAdmin === null) {
        setTimedOut(true);
        setIsAdmin(false);
        toast({
          variant: "destructive",
          title: "Clearance Timeout",
          description: "Security handshake took too long. Returning to login."
        });
        router.push("/admin/login");
      }
    }, AUTH_TIMEOUT_MS);

    async function checkClearance() {
      if (!userLoading) {
        if (!currentUser) {
          setIsAdmin(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          router.push("/admin/login");
          return;
        }

        if (currentUser.email === TEST_ADMIN_EMAIL) {
          setIsAdmin(true);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          return;
        }

        const db = getFirestore();
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data()?.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            router.push("/");
          }
        } catch (e) {
          setIsAdmin(false);
          router.push("/admin/login");
        } finally {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
      }
    }

    checkClearance();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentUser, userLoading, router, isLoginPage, isAdmin]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      router.push("/");
    } catch (e) {
      console.error("Admin Layout: Logout fault.", e);
    }
  };

  // Render Login Terminal without sidebar or clearance checks
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-white">
        {children}
        <Toaster />
      </div>
    );
  }

  // Clearance Loading State
  if (userLoading || (isAdmin === null && !timedOut)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <HexagonLogo className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-black text-muted-foreground uppercase tracking-[0.3em] text-[10px]">Verifying Clearance Protocol...</p>
          <p className="text-[8px] font-bold text-muted-foreground/40 uppercase">Global Hub Infrastructure v3.0</p>
        </div>
      </div>
    );
  }

  // Access Denied State
  if (isAdmin === false && !userLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-tight">Access Prohibited</h1>
        <p className="text-muted-foreground max-w-xs mt-2">Your identity does not hold administrative clearance for this terminal node.</p>
        <Button onClick={() => router.push("/")} className="mt-8 rounded-full h-12 px-8 font-black uppercase tracking-widest">Return to Hub</Button>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard, href: "/admin/dashboard" },
    { id: "apps", label: "Manage Hub", icon: Package, href: "/admin/apps" },
    { id: "add", label: "Publish New", icon: PlusCircle, href: "/admin/apps/new" },
    { id: "users", label: "Users", icon: Users, href: "/admin/users" },
    { id: "settings", label: "Settings", icon: SettingsIcon, href: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-gray-100 p-8 space-y-12 shadow-sm bg-white sticky top-0 h-screen">
        <div className="flex items-center gap-4 px-2 cursor-pointer" onClick={() => router.push('/admin/dashboard')}>
          <HexagonLogo className="h-10 w-10" />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter">Hub Admin</span>
            <span className="text-[8px] font-black uppercase text-primary tracking-widest">PaliaAPK Network</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-4 h-12 px-5 rounded-2xl font-bold text-xs transition-all ${
                pathname === item.href 
                ? "bg-primary/10 text-primary shadow-sm shadow-primary/5" 
                : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-gray-100">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start h-12 px-5 rounded-2xl font-bold text-xs text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-5 w-5 mr-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 space-y-10 overflow-y-auto bg-gray-50/20">
        {children}
        <Toaster />
      </main>
    </div>
  );
}
