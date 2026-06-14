'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import Link from 'next/link';
import {Lock, Mail, ArrowLeft, Loader2} from 'lucide-react';
import {useState, Suspense} from 'react';
import {supabase} from '@/lib/supabase';
import {useRouter, useSearchParams} from 'next/navigation';
import {useToast} from '@/hooks/use-toast';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {toast} = useToast();

  const isAdminRequest = searchParams.get('admin') === 'true';
  const returnTo = searchParams.get('returnTo');
  const action = searchParams.get('action');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (isAdminRequest) {
        if (data.user?.email !== 'shanpalia786@gmail.com') {
          await supabase.auth.signOut();
          throw new Error('Invalid Admin Credentials');
        }
        toast({title: 'Admin signed in successfully'});
        router.push('/admin/dashboard');
        return;
      }

      toast({title: 'Signed in successfully'});

      if (data.user?.email === 'shanpalia786@gmail.com') {
        router.push('/admin/dashboard');
      } else if (returnTo) {
        const redirectUrl = action ? `${returnTo}?action=${action}` : returnTo;
        router.push(redirectUrl);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </Link>

      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-[3rem] shadow-2xl border border-border/50">
        <div className="text-center space-y-2">
          <div className="h-20 w-20 bg-primary rounded-3xl mx-auto flex items-center justify-center text-primary-foreground font-black text-4xl shadow-xl shadow-primary/30">
            P
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-6">
            {isAdminRequest ? 'Admin Portal' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground font-medium">
            {isAdminRequest ? 'Verify administrative identity' : 'Access your PLKAPK Hub collection'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold ml-1">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-12 rounded-2xl h-14 bg-muted/30 border-none font-medium"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold ml-1">Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-12 rounded-2xl h-14 bg-muted/30 border-none font-medium"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-16 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              isAdminRequest ? 'Login as Admin' : 'Sign In'
            )}
          </Button>
        </form>

        {!isAdminRequest && (
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground font-medium">
              New to PLKAPK Hub?{' '}
              <Link
                href="/auth/signup"
                className="text-primary font-black hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
