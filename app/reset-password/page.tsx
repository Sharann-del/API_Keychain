"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { FullscreenLoader } from "@/components/fullscreen-loader";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/supabase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Phase = "verifying" | "ready" | "invalid";

/**
 * Landing page for the Supabase password-recovery email link. Exchanges the
 * recovery code for a session, then lets the user set a new password.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const handled = React.useRef(false);

  const [phase, setPhase] = React.useState<Phase>("verifying");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (!supabaseConfigured) {
      setPhase("invalid");
      return;
    }

    const supabase = getSupabase();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const authError = params.get("error_description") ?? params.get("error");

    (async () => {
      if (authError) {
        toast.error(friendlyAuthError(new Error(authError)));
        setPhase("invalid");
        return;
      }

      // PKCE recovery links arrive with ?code=…; exchange it for a session.
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast.error(friendlyAuthError(error));
          setPhase("invalid");
          return;
        }
        // Drop the code from the URL so a refresh doesn't re-exchange it.
        window.history.replaceState(null, "", "/reset-password");
      }

      // Hash-token recovery links are picked up by detectSessionInUrl; either
      // way we should now have a recovery session to update the password with.
      const { data } = await supabase.auth.getSession();
      setPhase(data.session ? "ready" : "invalid");
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(
        friendlyAuthError(
          err instanceof Error ? err : new Error("Could not update password")
        )
      );
      setSubmitting(false);
    }
  };

  if (phase === "verifying") {
    return <FullscreenLoader />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex shrink-0 justify-center px-6 pt-20 pb-2 lg:pt-24 lg:pb-4">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <h1 className="text-center font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            API Keychain
          </h1>
        </Link>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div
            className="mb-7 animate-rise text-center"
            style={{ animationDelay: "60ms" }}
          >
            <h2 className="font-heading text-2xl font-normal tracking-tight">
              {phase === "ready" ? "Choose a new password" : "Link expired"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {phase === "ready"
                ? "Enter a new password for your account."
                : "This reset link is invalid or has expired. Request a new one."}
            </p>
          </div>

          <div
            className="surface animate-rise p-6"
            style={{ animationDelay: "150ms" }}
          >
            {phase === "ready" ? (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update password
                </Button>
              </form>
            ) : (
              <Button asChild className="w-full">
                <Link href="/forgot-password">Request a new link</Link>
              </Button>
            )}
          </div>

          <p
            className="mt-6 animate-rise text-center text-xs text-muted-foreground"
            style={{ animationDelay: "230ms" }}
          >
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
