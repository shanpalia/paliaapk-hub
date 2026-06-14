
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
