"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";

type TransitionLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

/**
 * Drop-in replacement for next/link that crossfades the route change via the
 * View Transitions API. The shared, wall-clock-synced PixelSwarm means the
 * background lines up across pages, so only the foreground fades. Browsers
 * without the API (or users who prefer reduced motion) just navigate normally.
 */
export function TransitionLink({ href, onClick, ...props }: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Leave modified clicks / new-tab intent to the browser.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    const url = typeof href === "string" ? href : href.toString();
    if (!url.startsWith("/")) return; // external — let it be

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (typeof doc.startViewTransition !== "function") return;

    e.preventDefault();
    doc.startViewTransition(() => router.push(url));
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
