import { resolveEnv } from "@supabase/server/core";
import type { SupabaseEnv } from "@supabase/server";

import {
  supabasePublishableKey,
  supabaseSecretKey,
  supabaseUrl,
} from "@/lib/supabase/env";

/**
 * Resolve {@link SupabaseEnv} for `@supabase/server` primitives.
 * Bridges Next.js `NEXT_PUBLIC_*` names with server env vars from the Connect dialog.
 */
export function resolveAppSupabaseEnv(): {
  data: SupabaseEnv | null;
  error: Error | null;
} {
  const url = supabaseUrl();
  const publishableKey = supabasePublishableKey();
  const secretKey = supabaseSecretKey();

  const overrides: Partial<SupabaseEnv> = {
    url: url ?? undefined,
    publishableKeys: publishableKey ? { default: publishableKey } : {},
    secretKeys: secretKey ? { default: secretKey } : {},
  };

  const jwksUrl = process.env.SUPABASE_JWKS_URL;
  if (jwksUrl) {
    try {
      overrides.jwks = new URL(jwksUrl);
    } catch {
      return { data: null, error: new Error("SUPABASE_JWKS_URL is not a valid URL") };
    }
  }

  const resolved = resolveEnv(overrides);
  if (resolved.error) {
    return { data: null, error: resolved.error };
  }
  return { data: resolved.data, error: null };
}
