import { createClient } from '@supabase/supabase-js';

// Fallback values prevent the client from throwing an error during module evaluation if env vars are missing.
// The app will still need valid credentials to function correctly with real data.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AppData = {
  id: string;
  app_name: string;
  version: string;
  description: string;
  image_url: string;
  apk_url: string;
  downloads: number;
  created_at: string;
  category: string;
};
