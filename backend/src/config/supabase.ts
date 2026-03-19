import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Public client — for normal user operations
export const supabase = createClient(
  env.supabase.url,
  env.supabase.anonKey
);

// Admin client — for admin operations that bypass row level security
export const supabaseAdmin = createClient(
  env.supabase.url,
  env.supabase.serviceKey || env.supabase.anonKey
);  