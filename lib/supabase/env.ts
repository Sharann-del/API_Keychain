/** Browser-exposed Supabase project URL. */
export function supabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/** Publishable (anon) key — supports legacy and Connect-dialog names. */
export function supabasePublishableKey(): string | undefined {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Service-role secret key (server-only; never prefix with NEXT_PUBLIC_). */
export function supabaseSecretKey(): string | undefined {
  return process.env.SUPABASE_SECRET_KEY;
}

export const supabaseConfigured = Boolean(
  supabaseUrl() && supabasePublishableKey()
);
