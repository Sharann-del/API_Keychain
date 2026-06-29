import type { AuthError, User } from "@supabase/supabase-js";

/** Supabase returns a user with empty identities when the email is already taken. */
export function isSignUpExistingAccount(user: User | null): boolean {
  if (!user) return false;
  return !user.identities || user.identities.length === 0;
}

export function friendlyAuthError(error: AuthError | Error): string {
  const msg = error.message ?? "";
  const code = "code" in error ? (error as AuthError).code : undefined;

  if (
    code === "user_already_exists" ||
    /already registered|already been registered|user already exists/i.test(msg)
  ) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (/invalid login credentials/i.test(msg)) {
    return "Incorrect email or password.";
  }
  if (/email not confirmed/i.test(msg)) {
    return "Confirm your email first — check your inbox, then sign in.";
  }
  if (/rate limit|too many requests/i.test(msg)) {
    return "Too many attempts. Wait a minute and try again.";
  }
  return msg || "Authentication failed";
}
