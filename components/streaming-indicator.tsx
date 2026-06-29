import { cn } from "@/lib/utils";

export function StreamingIndicator({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      role="status"
      aria-label="Generating response"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-foreground animate-streaming-pulse" />
    </span>
  );
}
