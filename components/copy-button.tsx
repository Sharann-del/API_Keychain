"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";
import { copyToClipboard, cn } from "@/lib/utils";

interface CopyButtonProps extends Omit<ButtonProps, "value"> {
  value: string;
  label?: string;
  /** Show a text label next to the icon. */
  withLabel?: boolean;
}

export function CopyButton({
  value,
  label = "Copied to clipboard",
  withLabel = false,
  variant = "ghost",
  size = withLabel ? "sm" : "icon",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      toast.success(label);
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Couldn't copy to clipboard");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onCopy}
      className={cn(className)}
      {...props}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {withLabel && (copied ? "Copied" : "Copy")}
    </Button>
  );
}
