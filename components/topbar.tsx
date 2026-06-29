"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Cpu,
  SlidersHorizontal,
  Settings,
  LogOut,
  KeyRound,
  Menu,
  X,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/playground", label: "Playground", icon: FlaskConical },
  { href: "/keys", label: "API Keys", icon: KeyRound },
  { href: "/providers", label: "Providers", icon: Boxes },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/preferences", label: "Preferences", icon: SlidersHorizontal },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({
  pathname,
  className,
  onNavigate,
}: {
  pathname: string;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className={cn("flex items-center justify-center gap-1", className)}>
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-base font-medium transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const { email, user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const name =
    (user?.user_metadata?.display_name as string | undefined) ??
    (user?.user_metadata?.full_name as string | undefined) ??
    null;

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-black/95 backdrop-blur-sm">
        <div className="relative flex h-16 w-full items-center px-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 font-heading text-base font-semibold tracking-tight"
          >
            API Keychain
          </Link>

          <nav className="pointer-events-none absolute inset-x-0 hidden justify-center lg:flex">
            <div className="pointer-events-auto">
              <NavLinks pathname={pathname} />
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <span
              className="hidden max-w-[12rem] truncate text-base text-muted-foreground md:block"
              title={email ?? undefined}
            >
              {name || email || "—"}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              title="Sign out"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="font-heading text-base font-semibold"
          >
            API Keychain
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
        <nav className="max-h-[calc(100vh-4rem)] overflow-y-auto px-3 pb-4 scrollbar-thin">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-base font-medium",
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="truncate text-base text-muted-foreground">
              {name || email || "—"}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-base text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
