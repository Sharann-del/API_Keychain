"use client";

import * as React from "react";
import { Loader2, Plus, Trash2, Activity, Boxes, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";
import { api, useApi, ApiError } from "@/lib/api";
import { providerLabel, formatRelative, formatNumber } from "@/lib/utils";
import { PROVIDERS as CATALOG, PROVIDER_TYPE_LABELS, providerTypeBadgeVariant } from "@/lib/catalog";
import type {
  ListProviderKeysResponse,
  ProviderHealthResponse,
  ProviderKeyInfo,
  ProviderStatus,
} from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HealthBadge } from "@/components/health-badge";
import { ProviderLogo } from "@/components/provider-logo";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProvidersPage() {
  const { userId, ready } = useAuth();
  const enabled = Boolean(userId && ready);

  const {
    data: keysData,
    isLoading: keysLoading,
    mutate: mutateKeys,
  } = useApi<ListProviderKeysResponse>(
    enabled ? `/users/${userId}/keys` : null
  );
  const { data: health, mutate: mutateHealth } =
    useApi<ProviderHealthResponse>(
      enabled ? `/users/${userId}/providers/health` : null
    );

  const [activeProvider, setActiveProvider] = React.useState<string | null>(
    null
  );

  const keysByProvider = React.useMemo(() => {
    const map: Record<string, ProviderKeyInfo[]> = {};
    for (const k of keysData?.keys ?? []) {
      (map[k.provider] ??= []).push(k);
    }
    return map;
  }, [keysData]);

  const connectedCount = CATALOG.filter(
    (p) => (keysByProvider[p.slug] ?? []).length > 0
  ).length;
  const totalKeys = keysData?.keys.length ?? 0;

  const refresh = () => {
    void mutateKeys();
    void mutateHealth();
  };

  return (
    <div>
      <PageHeader
        title="Providers"
        description="Connect free-tier keys. The router rotates and fails over across everything you add."
        actions={
          !keysLoading ? (
            <Badge variant={connectedCount > 0 ? "success" : "muted"}>
              <Boxes className="h-3 w-3" /> {connectedCount}/{CATALOG.length} connected
            </Badge>
          ) : undefined
        }
      />

      {keysLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATALOG.map((meta) => {
            const keys = keysByProvider[meta.slug] ?? [];
            const connected = keys.length > 0;
            const h = health?.providers[meta.slug];
            const status: ProviderStatus = h?.status ?? "untested";
            return (
              <button
                key={meta.slug}
                type="button"
                onClick={() => setActiveProvider(meta.slug)}
                className="surface surface-interactive group flex flex-col overflow-hidden p-5 text-left"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ProviderLogo
                      domain={meta.domain}
                      name={meta.name}
                      iconUrl={meta.iconUrl}
                      size={40}
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-heading text-sm font-normal">
                        {meta.name}
                      </div>
                      <div className="truncate font-mono text-[10px] text-muted-foreground">
                        {meta.baseUrl}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge
                      variant={providerTypeBadgeVariant(meta.providerType ?? "permanent_free")}
                      className="shrink-0 whitespace-nowrap"
                    >
                      {PROVIDER_TYPE_LABELS[meta.providerType ?? "permanent_free"]}
                    </Badge>
                    {!connected && (
                      <Badge variant="outline" className="shrink-0 whitespace-nowrap">
                        not connected
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-muted-foreground">
                  {meta.tagline}
                </p>

                {connected && h ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="tabular-nums text-foreground">
                        {formatNumber(h.requests_last_day)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        last 24h
                      </div>
                    </div>
                    <div>
                      <div className="tabular-nums text-foreground">
                        {h.last_success ? formatRelative(h.last_success) : "—"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        last success
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-1.5 overflow-hidden">
                    {meta.freeModels.slice(0, 3).map((m) => (
                      <span
                        key={m}
                        className="max-w-full truncate bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {m}
                        {meta.deprecatedModels?.includes(m) ? " (deprecated)" : ""}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {connected ? (
                      <span className="inline-flex items-center gap-1.5">
                        <HealthBadge status={status} />
                        <span>
                          {keys.length} key{keys.length > 1 ? "s" : ""}
                        </span>
                      </span>
                    ) : (
                      "No keys added"
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                    <Plus className="h-3.5 w-3.5" />
                    {connected ? "Manage" : "Add key"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!keysLoading && totalKeys > 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {totalKeys} key{totalKeys > 1 ? "s" : ""} across {connectedCount}{" "}
          provider{connectedCount > 1 ? "s" : ""} — all encrypted at rest.
        </p>
      )}

      {activeProvider && (
        <ProviderDialog
          provider={activeProvider}
          userId={userId!}
          keys={keysByProvider[activeProvider] ?? []}
          open={Boolean(activeProvider)}
          onOpenChange={(o) => !o && setActiveProvider(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

function ProviderDialog({
  provider,
  userId,
  keys,
  open,
  onOpenChange,
  onChanged,
}: {
  provider: string;
  userId: string;
  keys: ProviderKeyInfo[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const meta = CATALOG.find((p) => p.slug === provider);
  const [label, setLabel] = React.useState("default");
  const [apiKey, setApiKey] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] =
    React.useState<ProviderKeyInfo | null>(null);

  const needsAccountId = meta?.credentialFields?.includes("account_id") ?? false;

  const save = async () => {
    if (!apiKey.trim()) {
      toast.error("Paste an API key first");
      return;
    }
    if (needsAccountId && !accountId.trim()) {
      toast.error("Cloudflare requires an account ID");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/users/${userId}/keys`, {
        provider,
        api_key: apiKey.trim(),
        key_label: label.trim() || "default",
        ...(needsAccountId ? { account_id: accountId.trim() } : {}),
      });
      toast.success(`${providerLabel(provider)} key saved`);
      setApiKey("");
      setAccountId("");
      setLabel("default");
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save key");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await api.del(`/users/${userId}/keys/${deleteTarget.id}`);
      toast.success("Key removed");
      onChanged();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to remove key"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            {meta && (
              <ProviderLogo
                domain={meta.domain}
                name={meta.name}
                iconUrl={meta.iconUrl}
                size={32}
              />
            )}
            {providerLabel(provider)}
          </DialogTitle>
          <DialogDescription>
            {meta?.tagline}{" "}
            {meta?.notes ? `${meta.notes} ` : ""}
            Keys are encrypted at rest by the backend; add more than one to
            rotate.
          </DialogDescription>
        </DialogHeader>

        {meta?.promptLoggingWarning && (
          <p className="bg-warning px-3 py-2 text-xs text-warning-foreground">
            {meta.promptLoggingWarning}
          </p>
        )}

        {keys.length > 0 && (
          <div className="space-y-2">
            <Label>Existing keys</Label>
            <div className="space-y-1.5">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {k.key_label}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" /> Added{" "}
                      {formatRelative(k.created_at)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(k)}
                    title="Delete key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="key-label">Key label</Label>
            <Input
              id="key-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="default"
            />
          </div>
          {needsAccountId && (
            <div className="space-y-1.5">
              <Label htmlFor="account-id">Account ID</Label>
              <Input
                id="account-id"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Cloudflare account ID"
                autoComplete="off"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="api-key">
              API key{meta?.authPrefix ? ` (${meta.authPrefix}…)` : ""}
            </Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Paste your ${providerLabel(provider)} key`}
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <Plus className="h-4 w-4" /> Save key
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this key?"
        description={
          <>
            The key{" "}
            <span className="font-mono text-foreground">
              {deleteTarget?.key_label}
            </span>{" "}
            for {providerLabel(provider)} will be permanently removed.
          </>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
      />
    </Dialog>
  );
}
