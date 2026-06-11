"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { LogOut, Package, Shield, Settings, User as UserIcon, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!auth || !db) return;
    setLoading(true);
    try {
      if (type === 'signup') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        // Default role for new hub users is 'user'
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          email,
          displayName,
          role: 'user',
          createdAt: new Date().toISOString()
        });
        toast({ title: "Hub Access Initialized", description: "Welcome to the PaliaAPK network." });
        router.push("/");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Identity Verified", description: "Successfully linked to the hub." });
        router.push("/");
      }
    } catch (error: any) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) return (
    <div className="space-y-6 pt-4">
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <Skeleton className="h-64 w-full rounded-[2rem]" />
    </div>
  );

  if (!user) {
    return (
      <div className="max-w-md mx-auto pt-6 animate-in fade-in duration-500">
        <div className="text-center mb-10 space-y-2">
          <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 text-primary">
            <UserIcon className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold font-headline">Hub Access</h1>
          <p className="text-muted-foreground">Authenticate to access PaliaAPK verified binaries.</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 h-14 rounded-full bg-gray-100/50 p-1 mb-6">
            <TabsTrigger value="login" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Input 
              placeholder="Hub Email Address" 
              type="email" 
              className="h-14 rounded-2xl px-6 bg-gray-50 border-none font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              placeholder="Private Key" 
              type="password" 
              className="h-14 rounded-2xl px-6 bg-gray-50 border-none font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" 
              disabled={loading}
              onClick={() => handleAuth('login')}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Verify Identity"}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <Input 
              placeholder="Identity Name" 
              className="h-14 rounded-2xl px-6 bg-gray-50 border-none font-bold"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input 
              placeholder="Hub Email Address" 
              type="email" 
              className="h-14 rounded-2xl px-6 bg-gray-50 border-none font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              placeholder="Private Key" 
              type="password" 
              className="h-14 rounded-2xl px-6 bg-gray-50 border-none font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" 
              disabled={loading}
              onClick={() => handleAuth('signup')}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Initialize Identity"}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white text-2xl font-bold">
          {user.email?.[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold font-headline">{user.displayName || "Hub Client"}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-red-50" onClick={() => {
          signOut(auth!);
          router.push("/");
        }}>
          <LogOut className="h-5 w-5 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 bg-gray-50 rounded-[2rem] space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Client Protocol</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm">Transfer History</span>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">0</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-bold text-sm">Hub Security</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="font-bold text-sm">System Prefs</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-primary/5 rounded-[2.5rem] p-8 text-center space-y-3 border border-primary/10">
          <h3 className="font-bold text-primary">Support Gateway</h3>
          <p className="text-xs text-muted-foreground">Contact PaliaAPK Hub infrastructure support for binary issues.</p>
          <Button variant="outline" className="rounded-full px-8 border-primary/20 hover:bg-primary/10 font-bold transition-all">Open Channel</Button>
        </div>
      </div>
    </div>
  );
}
