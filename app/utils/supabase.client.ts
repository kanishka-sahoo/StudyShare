import { createBrowserClient } from '@supabase/auth-helpers-remix';
import type { Database } from '~/types/database';

export const createClient = () =>
  createBrowserClient<Database>(
    window.env.SUPABASE_URL,
    window.env.SUPABASE_ANON_KEY
  );