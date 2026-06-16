
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Standard Application Metadata Interface
 * All fields match the snake_case schema of the Supabase Hub Registry.
 */
export interface AppData {
  id: string;
  app_name: string;
  version: string;
  description: string;
  icon_url: string;
  apk_url: string;
  apk_file_name?: string;
  screenshot_url?: string;
  downloads: number;
  created_at: string;
  category: string;
  developer: string;
  whats_new?: string;
  is_featured: boolean;
  package_name?: string;
  apk_size?: string;
  is_hidden?: boolean;
}

export type UserProfile = {
  id: string;
  uid: string;
  email: string;
  role: 'user' | 'admin' | 'blocked';
  display_name?: string;
  created_at: string;
};
