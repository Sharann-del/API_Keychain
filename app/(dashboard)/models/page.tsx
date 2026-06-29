"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Cpu,
  Loader2,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";
import { api, useApi, ApiError } from "@/lib/api";
import { TIER_LABELS } from "@/lib/catalog";
import { providerLabel, cn } from "@/lib/utils";
import type { ListModelsResponse, Tier, UserModel } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TIERS: Tier[] = ["high", "medium", "low"];
const PROVIDERS = [
  "gemini",
  "groq",
  "cerebras",
  "mistral",
  "deepseek",
  "openrouter",
  "together",
  "cohere",
];

const TIER_VARIANT: Record<Tier, "accent" | "default" | "muted"> = {
  high: "accent",
  medium: "default",
  low: "muted",
};

export default function ModelsPage() {
  const { userId, ready } = useAuth();
  const enabled = Boolean(userId && ready);

  const { data, isLoading, mutate } = useApi<ListModelsResponse>(
    enabled ? `/users/${userId}/models` : null
  );

  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<UserModel | null>(
    null
  );

  const byTier = React.useMemo(() => {
    const map: Record<Tier, UserModel[]> = { high: [], medium: [], low: [] };
    for (const m of data?.models ?? []) map[m.tier].push(m);
    for (const t of TIERS) {
      map[t].sort((a, b) => a.priority - b.priority);
    }
    return map;
  }, [data]);

  const toggleEnabled = async (m: UserModel) => {
    setBusyId(m.id);
    try {
      await api.put(`/users/${userId}/models/${m.id}`, { enabled: !m.enabled });
      void mutate();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setBusyId(null);
    }
  };

  const move = async (tier: Tier, index: number, dir: -1 | 1) => {
    const list = byTier[tier];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const a = list[index];
    const b = list[target];
    setBusyId(a.id);
    try {
      // Renumber the two swapped rows by their new positions.
      await Promise.all([
        api.put(`/users/${userId}/models/${a.id}`, { priority: b.priority }),
        api.put(`/users/${userId}/models/${b.id}`, { priority: a.priority }),
      ]);
      void mutate();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to reorder");
    } finally {
      setBusyId(null);
    }
  };

  const removeCustom = async () => {
    if (!deleteTarget) return;
    try {
      await api.del(`/users/${userId}/models/${deleteTarget.id}`);
      toast.success("Custom model removed");
      void mutate();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete");
    }
  };

  const totalModels = data?.models.length ?? 0;
  const unavailableCount = React.useMemo(
    () => (data?.models ?? []).filter((m) => !m.provider_connected).length,
    [data]
  );

  return (
    <div>
      <PageHeader
        title="Models"
        description="Enable, prioritize and extend the free models each routing tier cascades through."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add custom model
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
      ) : totalModels === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No models available"
          description="Add a provider key, then come back to enable and prioritize models."
        />
      ) : (
        <div className="space-y-6">
          {unavailableCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-[#221c10] px-4 py-3 text-sm">
              <TriangleAlert className="h-4 w-4 shrink-0 text-amber-300" />
              <span className="text-muted-foreground">
                {unavailableCount} model{unavailableCount > 1 ? "s" : ""} can&apos;t
                be used yet because you haven&apos;t connected their provider.{" "}
                <Link
                  href="/providers"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  Connect a provider
                </Link>{" "}
                to enable them.
              </span>
            </div>
          )}
          {TIERS.map((tier) => {
            const list = byTier[tier];
            if (list.length === 0) return null;
            return (
              <Card key={tier}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <Badge variant={TIER_VARIANT[tier]}>{TIER_LABELS[tier]}</Badge>
                    <span className="text-muted-foreground">
                      {list.length} model{list.length > 1 ? "s" : ""}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Order</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Enabled</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((m, i) => (
                        <TableRow
                          key={m.id}
                          className={cn(
                            (!m.enabled || !m.provider_connected) && "opacity-45"
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={
                                  i === 0 ||
                                  busyId === m.id ||
                                  !m.provider_connected
                                }
                                onClick={() => move(tier, i, -1)}
                                title="Move up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={
                                  i === list.length - 1 ||
                                  busyId === m.id ||
                                  !m.provider_connected
                                }
                                onClick={() => move(tier, i, 1)}
                                title="Move down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {m.model_entry}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {providerLabel(m.provider)}
                          </TableCell>
                          <TableCell>
                            {m.is_custom ? (
                              <Badge variant="outline">custom</Badge>
                            ) : (
                              <Badge variant="muted">built-in</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              {m.provider_connected ? (
                                <Switch
                                  checked={m.enabled}
                                  disabled={busyId === m.id}
                                  onCheckedChange={() => toggleEnabled(m)}
                                />
                              ) : (
                                <Link href="/providers" title="Connect this provider">
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer whitespace-nowrap"
                                  >
                                    Needs key
                                  </Badge>
                                </Link>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {m.is_custom && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setDeleteTarget(m)}
                                title="Delete custom model"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddModelDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        userId={userId}
        onAdded={() => void mutate()}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete custom model?"
        description={
          <>
            <span className="font-mono text-foreground">
              {deleteTarget?.model_entry}
            </span>{" "}
            will be removed from the {deleteTarget?.tier} tier.
          </>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={removeCustom}
      />
    </div>
  );
}

function AddModelDialog({
  open,
  onOpenChange,
  userId,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onAdded: () => void;
}) {
  const [provider, setProvider] = React.useState("gemini");
  const [modelId, setModelId] = React.useState("");
  const [tier, setTier] = React.useState<Tier>("medium");
  const [saving, setSaving] = React.useState(false);

  const reset = () => {
    setProvider("gemini");
    setModelId("");
    setTier("medium");
  };

  const save = async () => {
    if (!modelId.trim()) {
      toast.error("Enter a model ID");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/users/${userId}/models`, {
        provider,
        model_id: modelId.trim(),
        tier,
      });
      toast.success("Custom model added");
      reset();
      onOpenChange(false);
      onAdded();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add model");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add custom model</DialogTitle>
          <DialogDescription>
            Add any model id supported by a provider you&apos;ve connected.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {providerLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model-id">Model ID</Label>
            <Input
              id="model-id"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="e.g. gemini-2.0-flash"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tier</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">{TIER_LABELS.high}</SelectItem>
                <SelectItem value="medium">{TIER_LABELS.medium}</SelectItem>
                <SelectItem value="low">{TIER_LABELS.low}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Add model
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
