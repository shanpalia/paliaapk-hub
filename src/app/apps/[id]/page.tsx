import { Navigation } from '@/components/Navigation';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import AppDetailsContent from './AppDetailsClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  const { data, error } = await supabase
    .from('apps')
    .select('id');

  if (error) {
    console.error('Failed to load app IDs for static export:', error);
    return [];
  }

  return (data ?? [])
    .filter((app) => app?.id)
    .map((app) => ({ id: String(app.id) }));
}

export default function AppDetailsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        }
      >
        <AppDetailsContent />
      </Suspense>
    </div>
  );
}
