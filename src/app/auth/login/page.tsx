
'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import Link from 'next/link';
import {Lock, Mail, ArrowLeft, Loader2} from 'lucide-react';
import {useState} from 'react';
import {supabase} from '@/lib/supabase';
import {useRouter, useSearchParams} from 'next/navigation';
import {useToast} from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {toast} = useToast();

  const isAdminRequest = searchParams.get('admin') === 'true';
  const returnTo = searchParams.get('returnTo');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Security Check: If it's an admin request, enforce specific hardcoded credentials
      if (isAdminRequest) {
        if (email !== 'shanpalia786@gmail.com' || password !== 'hafsa@1#HASAN') {
          throw new Error('Invalid Admin Credentials');
        }
      }

      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({title: 'Signed in successfully'});

      // Strict redirect for admin
      if (isAdminRequest || data.user?.email === 'shanpalia786@gmail.com') {
        router.push('/admin/dashboard');
      } else if (returnTo) {
        router.push(returnTo);
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
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-[2rem] shadow-xl border border-border/50">
        <div className="text-center space-y-2">
          <div className="h-16 w-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-primary-foreground font-black text-3xl shadow-lg shadow-primary/30">
            P
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-6">
            {isAdminRequest ? 'Admin Portal' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground">
            {isAdminRequest ? 'Enter administrative credentials' : 'Sign in to your PLKAPK Hub account'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10 rounded-xl h-12"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10 rounded-xl h-12"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              isAdminRequest ? 'Login as Admin' : 'Sign In'
            )}
          </Button>
        </form>

        {!isAdminRequest && (
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-primary font-bold hover:underline"
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
