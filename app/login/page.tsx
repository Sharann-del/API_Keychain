"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { FullscreenLoader } from "@/components/fullscreen-loader";
import { PixelSwarm } from "@/components/pixel-swarm";
import { TransitionLink } from "@/components/transition-link";
import { useAuth } from "@/lib/auth";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import {
  friendlyAuthError,
  isSignUpExistingAccount,
} from "@/lib/supabase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup";
type NoticeKind = "info" | "warning";

export default function AuthPage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  const [mode, setMode] = React.useState<Mode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [noticeKind, setNoticeKind] = React.useState<NoticeKind>("info");
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error_description") ?? params.get("error");
    if (authError) {
      toast.error(friendlyAuthError(new Error(authError)));
      window.history.replaceState(null, "", "/login");
    }
  }, []);

  React.useEffect(() => {
    // The dashboard layout holds the loader for a beat, so redirect promptly
    // here — the same minimal spinner carries across the hand-off.
    if (!loading && session) router.replace("/dashboard");
  }, [loading, session, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseConfigured) {
      toast.error("Supabase is not configured. Fill in .env.local first.");
      return;
    }
    setSubmitting(true);
    setNotice(null);
    const supabase = getSupabase();
    const emailRedirectTo = `${window.location.origin}/auth/callback`;
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo },
        });
        if (error) throw error;
        if (isSignUpExistingAccount(data.user)) {
          setMode("signin");
          setNoticeKind("warning");
          setNotice(
            "An account with this email already exists. Sign in with your password."
          );
          toast.error("Account already exists — sign in instead.");
          return;
        }
        if (data.session) {
          toast.success("Account created");
          // The session effect shows the loader and redirects after a beat.
        } else if (data.user) {
          setNoticeKind("info");
          setNotice(
            "Check your email to confirm your account, then sign in. (For local dev you can disable email confirmation in Supabase.)"
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signed in");
        // The session effect shows the loader and redirects after a beat.
      }
    } catch (err) {
      toast.error(friendlyAuthError(err instanceof Error ? err : new Error("Authentication failed")));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || session) {
    return <FullscreenLoader />;
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Drifting pixel field behind the card. */}
      <PixelSwarm className="[mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />

      {/* Form */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        <div
          className="surface w-full max-w-3xl animate-rise p-12 sm:p-24"
          style={{ animationDelay: "60ms" }}
        >
          <div className="mx-auto w-full max-w-sm">
          <TransitionLink
            href="/"
            className="mb-8 block text-center font-heading text-4xl font-medium tracking-tight transition-opacity hover:opacity-80 sm:text-5xl"
          >
            API Keychain
          </TransitionLink>

          <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
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
                    className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {notice && (
                <p
                  className={
                    "flex items-start gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs " +
                    (noticeKind === "warning"
                      ? "bg-warning text-warning-foreground"
                      : "bg-success text-success-foreground")
                  }
                >
                  <CheckCircle2
                    className={
                      "mt-0.5 h-3.5 w-3.5 shrink-0 " +
                      (noticeKind === "warning"
                        ? "text-warning-foreground"
                        : "text-success-foreground")
                    }
                  />
                  {notice}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

          {!supabaseConfigured && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Supabase keys missing — add them to{" "}
              <code className="font-mono">.env.local</code>.
            </p>
          )}

          <p
            className="mt-6 animate-rise text-center text-xs text-muted-foreground"
            style={{ animationDelay: "230ms" }}
          >
            {mode === "signin"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setNotice(null);
              }}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
          </div>
        </div>
      </main>
    </div>
  );
}
