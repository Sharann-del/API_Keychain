import { Badge } from "@/components/ui/badge";
import type { ProviderStatus } from "@/lib/types";

const MAP: Record<
  ProviderStatus,
  { label: string; variant: "success" | "warning" | "muted" }
> = {
  active: { label: "active", variant: "success" },
  cooling_down: { label: "cooling down", variant: "warning" },
  untested: { label: "untested", variant: "muted" },
};

export function HealthBadge({ status }: { status: ProviderStatus }) {
  const { label, variant } = MAP[status] ?? MAP.untested;
  return <Badge variant={variant}>{label}</Badge>;
}
