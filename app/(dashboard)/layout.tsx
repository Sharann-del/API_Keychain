"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";
import { Topbar } from "@/components/topbar";
import { ApiConnectionBanner } from "@/components/api-connection-banner";
import { FullscreenLoader } from "@/components/fullscreen-loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, session, configured } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && configured && !session) {
      router.replace("/login");
    }
  }, [loading, configured, session, router]);

  if (loading) return <FullscreenLoader />;

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="surface max-w-md p-7 text-sm">
          <h2 className="mb-2 font-heading font-normal tracking-tight">
            Supabase not configured
          </h2>
          <p className="text-muted-foreground">
            Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            (or <code className="font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>) in{" "}
            <code className="font-mono">.env.local</code>, then restart the dev
            server.
          </p>
        </div>
      </div>
    );
  }

  if (!session) return <FullscreenLoader />;

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <ApiConnectionBanner />
        {children}
      </main>
    </div>
  );
}
