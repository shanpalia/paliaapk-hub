
'use client';

import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Package, 
  Settings as SettingsIcon,
  LogOut,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { HexagonLogo } from "@/components/logo";
import { useAuth, useUser } from "@/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";

const TEST_ADMIN_EMAIL = "shanpalia786@gmail.com";

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

  useEffect(() => {
    async function checkClearance() {
      if (!userLoading) {
        if (!currentUser) {
          router.push("/admin/login");
          return;
        }
        if (currentUser.email === TEST_ADMIN_EMAIL) {
          setIsAdmin(true);
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
          router.push("/");
        }
      }
    }
    checkClearance();
  }, [currentUser, userLoading, router]);

  const handleLogout = async () => {
    if (!auth) return;
    await auth.signOut();
    router.push("/");
  };

  if (userLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-black text-muted-foreground uppercase tracking-[0.3em] text-[10px]">Verifying Clearance Protocol...</p>
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
        <div className="flex items-center gap-4 px-2" onClick={() => router.push('/admin/dashboard')}>
          <HexagonLogo className="h-10 w-10 cursor-pointer" />
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
