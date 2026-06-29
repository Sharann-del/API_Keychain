"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

import { API_BASE_URL } from "@/lib/config";

const HEALTH_RETRIES = 4;
const HEALTH_TIMEOUT_MS = 12_000;

function isLocalApi(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url);
}

async function pingHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function checkHealthWithRetries(): Promise<boolean> {
  for (let attempt = 0; attempt < HEALTH_RETRIES; attempt++) {
    if (await pingHealth()) return true;
    if (attempt < HEALTH_RETRIES - 1) {
      await wait(1500 * (attempt + 1));
    }
  }
  return false;
}

export function ApiConnectionBanner() {
  const [state, setState] = React.useState<"checking" | "ok" | "error">(
    "checking"
  );
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const runCheck = React.useCallback(async () => {
    const ok = await checkHealthWithRetries();
    setState(ok ? "ok" : "error");
    return ok;
  }, []);

  React.useEffect(() => {
    void runCheck();

    const onFocus = () => {
      if (stateRef.current === "error") void runCheck();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [runCheck]);

  if (state !== "error") return null;

  const local = isLocalApi(API_BASE_URL);

  return (
    <div
      className="mb-4 flex gap-3 rounded-lg border border-border bg-secondary px-4 py-3 text-base"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
      <div>
        <p className="font-medium text-foreground">
          Cannot reach the API gateway
        </p>
        <p className="mt-1 text-muted-foreground">
          The dashboard calls{" "}
          <code className="font-mono text-sm">{API_BASE_URL}</code> but the
          health check failed after several retries.
          {local
            ? " Start the backend in a second terminal:"
            : " The gateway may still be cold-starting — try again in a moment or check your Render service logs."}
        </p>
        {local ? (
          <>
            <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-sm">
              source .venv/bin/activate{"\n"}
              uvicorn main:app --reload
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              Env vars are read from <code className="font-mono">.env.local</code>{" "}
              automatically. You still need{" "}
              <code className="font-mono">MASTER_SECRET</code> in that file (or
              exported) before the first run.
            </p>
          </>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Confirm <code className="font-mono">NEXT_PUBLIC_API_BASE_URL</code> on
            Vercel and that the Render service is running. Refresh the page after
            the API responds at{" "}
            <code className="font-mono">{API_BASE_URL}/health</code>.
          </p>
        )}
      </div>
    </div>
  );
}
