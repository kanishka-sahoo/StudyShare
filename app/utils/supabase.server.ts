import { createServerClient, type SupabaseClient } from '@supabase/auth-helpers-remix';
import type { Database } from '../types/database';

export const createClient = (request: Request) => {
  const response = new Response();

  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    }
  );

  return { supabase, response };
};

export type TypedSupabaseClient = SupabaseClient<Database>;