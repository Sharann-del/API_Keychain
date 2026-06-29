import { withSupabase } from "@supabase/server";

import { resolveAppSupabaseEnv } from "@/lib/supabase/env.server";

/**
 * Header-based auth check (`Authorization: Bearer <jwt>`).
 * Useful for API clients; browser sessions use `/api/auth/session` instead.
 */
export async function GET(req: Request) {
  const { data: env, error: envError } = resolveAppSupabaseEnv();
  if (!env) {
    return Response.json(
      { message: envError?.message ?? "Supabase is not configured" },
      { status: 500 }
    );
  }

  const handle = withSupabase({ auth: "user", env }, async (_request, ctx) => {
    return Response.json({
      sub: ctx.userClaims?.id ?? ctx.jwtClaims?.sub ?? null,
      email: ctx.userClaims?.email ?? null,
      authMode: ctx.authMode,
    });
  });

  return handle(req);
}
