"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface UsageChartProps {
  data: { date: string; count: number }[];
  height?: number;
}

function formatTick(date: string): string {
  const d = new Date(date + "T00:00:00");
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="surface px-3 py-2 text-xs">
      <div className="text-muted-foreground">{label && formatTick(label)}</div>
      <div className="mt-0.5 font-heading text-sm font-normal tabular-nums">
        {payload[0].value.toLocaleString()}
        <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">
          requests
        </span>
      </div>
    </div>
  );
}

export function UsageChart({ data, height = 280 }: UsageChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="rgba(255,255,255,0.06)"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatTick}
          tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          allowDecimals={false}
          width={44}
          tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="hsl(0 0% 100%)"
          strokeWidth={1.75}
          fill="url(#usageFill)"
          dot={false}
          activeDot={{ r: 3.5, fill: "hsl(0 0% 100%)", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Horizontal ranked bars for per-provider / per-model breakdowns. */
export function BreakdownBars({
  items,
  emptyLabel = "No data yet",
  formatLabel = (k) => k,
}: {
  items: { key: string; value: number }[];
  emptyLabel?: string;
  formatLabel?: (key: string) => string;
}) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-medium text-foreground/90">
              {formatLabel(item.key)}
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {item.value.toLocaleString()}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
