"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/supabase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseConfigured) {
      toast.error("Supabase is not configured. Fill in .env.local first.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      // Always show the same confirmation — don't leak whether the email exists.
      setSent(true);
    } catch (err) {
      toast.error(
        friendlyAuthError(
          err instanceof Error ? err : new Error("Could not send reset email")
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

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
              {sent ? "Check your email" : "Reset your password"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {sent
                ? "We sent a reset link to your inbox if an account exists."
                : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          <div
            className="surface animate-rise p-6"
            style={{ animationDelay: "150ms" }}
          >
            {sent ? (
              <div className="space-y-4 text-center">
                <MailCheck className="mx-auto h-5 w-5 text-success" />
                <p className="text-sm text-muted-foreground">
                  Open the link in the email to choose a new password. The link
                  expires after a short while.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setSent(false)}
                >
                  Use a different email
                </Button>
              </div>
            ) : (
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
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send reset link
                </Button>
              </form>
            )}
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
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-medium text-foreground underline underline-offset-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
