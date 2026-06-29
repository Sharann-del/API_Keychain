import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        className
      )}
    >
      {Icon && (
        <Icon className="h-5 w-5 text-muted-foreground" />
      )}
      <div className="space-y-1">
        <p className="font-heading text-base font-semibold">{title}</p>
        {description && (
          <p className="max-w-sm text-base text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
