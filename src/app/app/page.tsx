import { Navigation } from '@/components/Navigation';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import AppDetailsContent from '../apps/[id]/AppDetailsClient';

export default function AppPage() {
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
