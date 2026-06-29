import { cn } from "@/lib/utils";

/** Minimal circular ring spinner. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-foreground",
        className
      )}
    />
  );
}

/**
 * Full-screen centered spinner. Pass `overlay` to render it fixed on top of the
 * current page (used for deliberate page-transition delays).
 */
export function FullscreenLoader({ overlay = false }: { overlay?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background",
        overlay
          ? "fixed inset-0 z-[100] animate-fade-in"
          : "min-h-screen"
      )}
    >
      <Spinner />
    </div>
  );
}
