"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FullscreenLoader } from "@/components/fullscreen-loader";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/supabase-auth";

/**
 * Handles Supabase email-confirmation and OAuth redirects (?code=… or hash tokens).
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const handled = React.useRef(false);

  React.useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (!supabaseConfigured) {
      router.replace("/login");
      return;
    }

    const supabase = getSupabase();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const authError = params.get("error_description") ?? params.get("error");

    (async () => {
      if (authError) {
        toast.error(friendlyAuthError(new Error(authError)));
        router.replace("/login");
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast.error(friendlyAuthError(error));
          router.replace("/login");
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    })();
  }, [router]);

  return <FullscreenLoader />;
}
