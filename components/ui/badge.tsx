import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-sm font-medium",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        muted: "border-transparent bg-secondary text-muted-foreground",
        accent: "border-transparent bg-primary text-primary-foreground",
        success: "border-transparent bg-secondary text-success",
        warning: "border-transparent bg-secondary text-warning",
        danger: "border-transparent bg-secondary text-danger",
        purple: "border-border bg-secondary text-foreground",
        orange: "border-border bg-secondary text-foreground",
        red: "border-border bg-secondary text-danger",
        green: "border-border bg-secondary text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
