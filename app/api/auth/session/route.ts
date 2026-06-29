import { createAppSupabaseContext } from "@/lib/supabase/context";

/** Returns the verified user from the session cookie (server-side). */
export async function GET() {
  const { data: ctx, error } = await createAppSupabaseContext({ auth: "user" });

  if (error) {
    return Response.json({ message: error.message }, { status: 401 });
  }

  return Response.json({
    sub: ctx!.userClaims?.id ?? ctx!.jwtClaims?.sub ?? null,
    email: ctx!.userClaims?.email ?? null,
    authMode: ctx!.authMode,
  });
}
