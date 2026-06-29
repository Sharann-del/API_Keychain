"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";

interface SecretDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  secret: string | null;
}

/** Shows a one-time secret (an ak- key) that the backend returns only once. */
export function SecretDialog({
  open,
  onOpenChange,
  title = "Save your API key",
  secret,
}: SecretDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            This key is shown only once. Copy it now and store it somewhere safe.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 bg-warning px-3 py-2.5 text-xs text-warning-foreground">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            For security, you won&apos;t be able to view the full key again after
            closing this dialog.
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-secondary p-2">
          <code className="flex-1 overflow-x-auto whitespace-nowrap px-1 font-mono text-sm scrollbar-thin">
            {secret}
          </code>
          {secret && <CopyButton value={secret} label="API key copied" />}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
