"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Plus, Save, Search, X } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";
import { api, useApi, ApiError } from "@/lib/api";
import { providerLabel, cn } from "@/lib/utils";
import type {
  ListModelsResponse,
  PreferencesResponse,
} from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

function SortableProvider({
  id,
  index,
  onRemove,
}: {
  id: string;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg bg-secondary px-3 py-2",
        isDragging && "z-10 bg-accent"
      )}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex h-5 w-5 items-center justify-center rounded bg-accent text-xs tabular-nums text-muted-foreground">
        {index + 1}
      </span>
      <span className="flex-1 text-sm font-medium">{providerLabel(id)}</span>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function PreferencesPage() {
  const { userId, ready } = useAuth();
  const enabled = Boolean(userId && ready);

  const { data, isLoading, mutate } = useApi<PreferencesResponse>(
    enabled ? `/users/${userId}/preferences` : null
  );
  const { data: modelsData } = useApi<ListModelsResponse>(
    enabled ? `/users/${userId}/models` : null
  );

  const [preferred, setPreferred] = React.useState<string[]>([]);
  const [excludedProviders, setExcludedProviders] = React.useState<string[]>(
    []
  );
  const [excludedModels, setExcludedModels] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (data && !hydrated) {
      setPreferred(data.preferred_providers ?? []);
      setExcludedProviders(data.excluded_providers ?? []);
      setExcludedModels(data.excluded_models ?? []);
      setHydrated(true);
    }
  }, [data, hydrated]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPreferred((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const availableToPrefer = PROVIDERS.filter((p) => !preferred.includes(p));

  // Only offer models the user can actually route to (provider connected) as
  // exclusion candidates — excluding a keyless model would be a no-op.
  const allModels = React.useMemo(
    () =>
      Array.from(
        new Set(
          (modelsData?.models ?? [])
            .filter((m) => m.provider_connected)
            .map((m) => m.model_entry)
        )
      ).sort(),
    [modelsData]
  );
  const modelSearchResults = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return allModels
      .filter(
        (m) => m.toLowerCase().includes(q) && !excludedModels.includes(m)
      )
      .slice(0, 8);
  }, [search, allModels, excludedModels]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/users/${userId}/preferences`, {
        preferred_providers: preferred,
        excluded_providers: excludedProviders,
        excluded_models: excludedModels,
      });
      toast.success("Preferences saved");
      void mutate();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !hydrated) {
    return (
      <div>
        <PageHeader title="Preferences" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Preferences"
        description="Float providers to the front of routing, or exclude providers and models entirely."
        actions={
          <Button onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Preferred providers */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred providers</CardTitle>
            <p className="text-sm text-muted-foreground">
              Drag to reorder. Higher in the list = tried first.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {preferred.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No preferred providers. Add one below to float it to the front of
                routing.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={preferred}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {preferred.map((p, i) => (
                      <SortableProvider
                        key={p}
                        id={p}
                        index={i}
                        onRemove={() =>
                          setPreferred((prev) =>
                            prev.filter((x) => x !== p)
                          )
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {availableToPrefer.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {availableToPrefer.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPreferred((prev) => [...prev, p])}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    {providerLabel(p)}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Excluded providers */}
        <Card>
          <CardHeader>
            <CardTitle>Excluded providers</CardTitle>
            <p className="text-sm text-muted-foreground">
              Selected providers will never be used for routing.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PROVIDERS.map((p) => {
                const on = excludedProviders.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setExcludedProviders((prev) =>
                        on ? prev.filter((x) => x !== p) : [...prev, p]
                      )
                    }
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      on
                        ? "bg-[#2a1517] text-red-300"
                        : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {providerLabel(p)}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Excluded models */}
        <Card>
          <CardHeader>
            <CardTitle>Excluded models</CardTitle>
            <p className="text-sm text-muted-foreground">
              Search and exclude specific models from all routing.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models to exclude…"
                className="pl-8"
              />
              {modelSearchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg bg-popover shadow-xl">
                  {modelSearchResults.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setExcludedModels((prev) => [...prev, m]);
                        setSearch("");
                      }}
                      className="flex w-full items-center px-3 py-2 text-left font-mono text-xs hover:bg-accent"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {excludedModels.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No models excluded.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {excludedModels.map((m) => (
                  <Badge key={m} variant="danger" className="font-mono">
                    {m}
                    <button
                      type="button"
                      onClick={() =>
                        setExcludedModels((prev) =>
                          prev.filter((x) => x !== m)
                        )
                      }
                      className="ml-1 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
