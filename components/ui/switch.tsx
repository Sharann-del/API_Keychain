"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "switch-track peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "switch-thumb pointer-events-none block h-4 w-4 bg-foreground transition-transform data-[state=checked]:translate-x-[1.125rem] data-[state=checked]:bg-primary-foreground data-[state=unchecked]:translate-x-0.5"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
