
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, Mail, Lock, Loader2, UserCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { HexagonLogo } from "@/components/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const TEST_ADMIN_EMAIL = "shanpalia786@gmail.com";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifyingUser, setVerifyingUser] = useState<{ email: string; role: string | null } | null>(null);
  
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  useEffect(() => {
    console.log("Admin Login: Terminal Ready.");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setVerifyingUser(null);
    
    if (!auth || !db) {
      const msg = "Infrastructure node offline. Firebase not initialized.";
      setAuthError(msg);
      console.error(msg);
      return;
    }

    setLoading(true);
    console.log("Admin Login: Initiating handshake for", email);
    
    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Admin Login: Auth handshake successful. UID:", user.uid);
      
      // 2. Fetch Clearance Role from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const role = userDoc.exists() ? userDoc.data()?.role : "user";
      
      setVerifyingUser({ email: user.email || "Anonymous", role });

      // 3. Admin Clearance Logic
      if (user.email?.toLowerCase() === TEST_ADMIN_EMAIL || role === "admin") {
        console.log("Admin Login: Clearance Level VERIFIED.");
        toast({ 
          title: "Access Authorized", 
          description: `Welcome. Clearance Level: ${role === 'admin' ? 'ROOT' : 'IDENTIFIED'}`,
          className: "bg-emerald-500 text-white font-black" 
        });
        
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1500);
      } else {
        const errorMsg = "Access Denied: Insufficient clearance for administrative terminal.";
        console.error(errorMsg);
        setAuthError(errorMsg);
        toast({ title: "Insufficient Clearance", description: errorMsg, variant: "destructive" });
        await signOut(auth);
      }
    } catch (error: any) {
      console.error("Admin Login: Critical Fault.", error.code, error.message);
      let friendlyMessage = error.message;
      if (error.code === 'auth/invalid-credential') friendlyMessage = "Invalid administrative credentials.";
      if (error.code === 'auth/user-not-found') friendlyMessage = "Entity not found in hub database.";
      
      setAuthError(friendlyMessage);
      toast({ 
        title: "Protocol Fault", 
        description: friendlyMessage, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-24 h-24 animate-float">
            <HexagonLogo />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black font-headline tracking-tighter uppercase text-foreground">Admin Login</h1>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.3em]">Authorized Access Only</p>
          </div>
        </div>

        {authError && (
          <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5 animate-in shake-1">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle className="font-black text-xs uppercase tracking-widest">Protocol Fault</AlertTitle>
            <AlertDescription className="text-xs font-mono mt-2">{authError}</AlertDescription>
          </Alert>
        )}

        {verifyingUser && !authError && (
          <Alert className="rounded-2xl border-primary/20 bg-primary/5 animate-in zoom-in-95">
            <UserCheck className="h-4 w-4 text-primary" />
            <AlertTitle className="font-black text-xs uppercase tracking-widest text-primary">Identity Verified</AlertTitle>
            <AlertDescription className="mt-3 flex flex-col gap-2">
              <p className="text-xs font-bold text-muted-foreground">Linked: <span className="text-foreground">{verifyingUser.email}</span></p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Clearance:</span>
                <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest bg-white">
                  {verifyingUser.role?.toUpperCase() || "PENDING"}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl rounded-[3rem] overflow-hidden">
          <CardContent className="p-10">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 text-primary">Admin Identity</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder="admin@paliaapk.com"
                    className="h-16 rounded-[2rem] pl-14 bg-gray-50 border-none font-bold text-base shadow-inner focus:ring-4 focus:ring-primary/10 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || !!verifyingUser}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 text-primary">Terminal Key</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-16 rounded-[2rem] pl-14 bg-gray-50 border-none font-bold text-base shadow-inner focus:ring-4 focus:ring-primary/10 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || !!verifyingUser}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-[2rem] font-black text-lg premium-gradient text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all" 
                  disabled={loading || !!verifyingUser}
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Authorize Access"}
                </Button>
                
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={() => router.push("/")}
                  className="w-full h-16 rounded-[2rem] font-black text-xs uppercase tracking-widest text-muted-foreground hover:bg-gray-50 flex gap-2 items-center justify-center transition-all"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Home
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Infrastructure Node Secured
        </div>
      </div>
    </div>
  );
}
