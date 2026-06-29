"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Network,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { FullscreenLoader } from "@/components/fullscreen-loader";
import { useAuth } from "@/lib/auth";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import {
  friendlyAuthError,
  isSignUpExistingAccount,
} from "@/lib/supabase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TOTAL_MODELS, TOTAL_PROVIDERS } from "@/lib/catalog";

type Mode = "signin" | "signup";
type NoticeKind = "info" | "warning";

const SELLING_POINTS = [
  {
    icon: Network,
    title: "Effort-based routing",
    body: "One key cascades across every connected provider by tier.",
  },
  {
    icon: RefreshCw,
    title: "Automatic failover",
    body: "Rate limits and outages roll to the next model transparently.",
  },
  {
    icon: ShieldCheck,
    title: "Encrypted at rest",
    body: "Upstream provider keys are sealed before they hit the database.",
  },
];

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
    <div className="flex min-h-screen flex-col">
      <header className="-mb-6 flex shrink-0 justify-center px-6 pt-20 pb-2 lg:-mb-8 lg:pt-24 lg:pb-4">
        <Link
          href="/"
          className="mt-6 transition-opacity hover:opacity-80 lg:mt-8"
        >
          <h1 className="text-center font-heading text-5xl font-medium tracking-tight sm:text-6xl">
            API Keychain
          </h1>
        </Link>
      </header>

      <div className="grid flex-1 lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="hidden overflow-hidden lg:flex lg:flex-col lg:justify-center lg:p-12 lg:pt-0">
        <div
          className="relative ml-auto max-w-md animate-rise"
          style={{ animationDelay: "120ms" }}
        >
          <h2 className="font-heading text-3xl font-medium leading-tight tracking-tight">
            One key for {TOTAL_PROVIDERS} providers and {TOTAL_MODELS} models.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Sign in to manage your providers, tune routing tiers and watch every
            request flow through a single OpenAI-compatible endpoint.
          </p>

          <ul className="mt-10 space-y-5">
            {SELLING_POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.title} className="flex gap-3.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-foreground" strokeWidth={1.6} />
                  <div>
                    <div className="font-heading text-sm font-normal">
                      {p.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.body}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div
            className="mb-7 animate-rise text-center"
            style={{ animationDelay: "60ms" }}
          >
            <div key={mode} className="animate-fade-in">
              <h2 className="font-heading text-2xl font-medium tracking-tight">
                {mode === "signin" ? "Welcome back" : "Create your keychain"}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to your dashboard."
                  : "Start routing across every free-tier model."}
              </p>
            </div>
          </div>

          <div
            className="surface animate-rise p-6"
            style={{ animationDelay: "150ms" }}
          >
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
          </div>

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
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setNotice(null);
              }}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </main>
      </div>
    </div>
  );
}
