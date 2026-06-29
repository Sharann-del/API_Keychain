"use client";

import * as React from "react";

import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

export interface CodeSample {
  id: string;
  label: string;
  file: string;
  code: string;
}

export function CodeTabs({ samples }: { samples: CodeSample[] }) {
  const [active, setActive] = React.useState(samples[0]?.id);
  const current = samples.find((s) => s.id === active) ?? samples[0];

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-2.5">
        <span className="font-mono text-sm text-muted-foreground">
          {current.file}
        </span>
        <div className="flex items-center gap-1">
          {samples.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                s.id === current.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="absolute right-3 top-3 z-10">
          <CopyButton value={current.code} label="Snippet copied" />
        </div>
        <pre className="overflow-x-auto bg-background p-4 pr-12 font-mono text-sm leading-relaxed scrollbar-thin">
          <code
            className="font-mono text-foreground/90"
            dangerouslySetInnerHTML={{ __html: highlight(current.code) }}
          />
        </pre>
      </div>
    </div>
  );
}

function highlight(code: string): string {
  let out = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  out = out.replace(
    /(&quot;|")(?:\\.|[^"\\])*\1/g,
    (m) => `<span style="color:#9be6a3">${m}</span>`
  );
  out = out.replace(
    /(^|\s)(#[^\n]*|\/\/[^\n]*)/g,
    (_m, pre, c) => `${pre}<span style="color:#6b7280">${c}</span>`
  );
  out = out.replace(
    /\b(from|import|const|let|await|async|client|new|print|def|return|curl)\b/g,
    `<span style="color:#cbb6ff">$1</span>`
  );
  out = out.replace(
    /\b(\d+(?:\.\d+)?)\b/g,
    `<span style="color:#f0c987">$1</span>`
  );
  return out;
}
