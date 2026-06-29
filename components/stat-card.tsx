import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: string;
  loading?: boolean;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  loading,
  badge,
  footer,
}: StatCardProps) {
  return (
    <div className="surface group p-5">
      <div className="flex items-center justify-between">
        <span className="meta-caps">{label}</span>
        <Icon
          className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground"
          strokeWidth={1.75}
        />
      </div>

      {loading ? (
        <Skeleton className="mt-4 h-8 w-24" />
      ) : (
        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="font-heading text-3xl font-medium leading-none tracking-tight tabular-nums">
            {value}
          </div>
          {badge}
        </div>
      )}

      {hint && !loading && (
        <p className={cn("mt-2 text-xs text-muted-foreground")}>{hint}</p>
      )}
      {footer && !loading && <div className="mt-3">{footer}</div>}
    </div>
  );
}
