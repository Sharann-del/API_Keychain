import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  supabaseConfigured,
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/env";

export { supabaseConfigured };

let _client: SupabaseClient | null = null;

/** Lazily-created singleton browser Supabase client. */
export function getSupabase(): SupabaseClient {
  const url = supabaseUrl();
  const publishableKey = supabasePublishableKey();

  if (!supabaseConfigured || !url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in .env.local."
    );
  }
  if (_client) return _client;
  _client = createClient(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}
