import { createServerClient } from "@supabase/ssr";
import {
  createAdminClient,
  createContextClient,
  verifyCredentials,
} from "@supabase/server/core";
import type {
  AuthModeWithKey,
  SupabaseContext,
  SupabaseEnv,
} from "@supabase/server";
import { cookies } from "next/headers";

import {
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/env";
import { resolveAppSupabaseEnv } from "@/lib/supabase/env.server";

let cachedJwks: SupabaseEnv["jwks"] = null;

async function getJwks(env: SupabaseEnv): Promise<SupabaseEnv["jwks"]> {
  if (env.jwks) return env.jwks;
  if (cachedJwks) return cachedJwks;
  try {
    const res = await fetch(`${env.url}/auth/v1/.well-known/jwks.json`);
    if (!res.ok) return null;
    cachedJwks = await res.json();
    return cachedJwks;
  } catch {
    return null;
  }
}

/**
 * Cookie-based Supabase context for Server Components and Route Handlers.
 * Composes `@supabase/ssr` (session cookies) with `@supabase/server` (JWT verify + clients).
 */
export async function createAppSupabaseContext(
  options: { auth?: AuthModeWithKey | AuthModeWithKey[] } = { auth: "user" }
): Promise<
  { data: SupabaseContext; error: null } | { data: null; error: Error }
> {
  const url = supabaseUrl();
  const publishableKey = supabasePublishableKey();

  if (!url || !publishableKey) {
    return {
      data: null,
      error: new Error(
        "Missing Supabase URL or publishable key (SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY)"
      ),
    };
  }

  const { data: baseEnv, error: envError } = resolveAppSupabaseEnv();
  if (envError || !baseEnv) {
    return { data: null, error: envError ?? new Error("Supabase env not configured") };
  }

  const jwks = await getJwks(baseEnv);
  const env: SupabaseEnv = { ...baseEnv, jwks };

  const cookieStore = await cookies();
  const ssrClient = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components cannot write cookies — middleware handles refresh.
        }
      },
    },
  });

  const {
    data: { session },
  } = await ssrClient.auth.getSession();
  const token = session?.access_token ?? null;

  const { data: auth, error } = await verifyCredentials(
    { token, apikey: null },
    { auth: options.auth ?? "user", env }
  );

  if (error) {
    return { data: null, error };
  }

  const supabase = createContextClient({
    auth: { token: auth!.token },
    env,
  });
  const supabaseAdmin = createAdminClient({ env });

  return {
    data: {
      supabase,
      supabaseAdmin,
      userClaims: auth!.userClaims,
      jwtClaims: auth!.jwtClaims,
      authMode: auth!.authMode,
    },
    error: null,
  };
}
