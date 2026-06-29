"use client";

import * as React from "react";

import { logoUrl } from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface ProviderLogoProps {
  domain: string;
  name: string;
  iconUrl?: string;
  /** Pixel size of the surrounding tile. */
  size?: number;
  className?: string;
}

/**
 * Provider logo in a rounded tile. Falls back to the first initial if the
 * image fails to load.
 */
export function ProviderLogo({
  domain,
  name,
  iconUrl,
  size = 40,
  className,
}: ProviderLogoProps) {
  const [failed, setFailed] = React.useState(false);
  const src = iconUrl ?? logoUrl(domain);

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary",
        className
      )}
      style={{ width: size, height: size }}
    >
      {failed ? (
        <span
          aria-hidden
          className="font-heading text-sm font-semibold text-muted-foreground"
        >
          {name.charAt(0).toUpperCase()}
        </span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={`${name} logo`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-[72%] w-[72%] object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
