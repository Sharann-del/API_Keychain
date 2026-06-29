"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock,
  Cpu,
  Gauge,
  Hash,
  LineChart as LineChartIcon,
  Zap,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/api";
import {
  formatNumber,
  formatPercent,
  formatDateTime,
  providerLabel,
  cn,
} from "@/lib/utils";
import type {
  ProviderHealthResponse,
  ProviderStatus,
  RecentUsageResponse,
  UsageResponse,
} from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { UsageChart, BreakdownBars } from "@/components/usage-chart";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_DOT: Record<ProviderStatus, string> = {
  active: "bg-success",
  cooling_down: "bg-warning",
  untested: "bg-muted-foreground",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "success") return <Badge variant="success">success</Badge>;
  return <Badge variant="danger">{status}</Badge>;
}

export default function DashboardPage() {
  const { userId, ready } = useAuth();
  const enabled = Boolean(userId && ready);

  const { data: usage, isLoading: usageLoading } = useApi<UsageResponse>(
    enabled ? `/users/${userId}/usage` : null
  );
  const { data: recent, isLoading: recentLoading } =
    useApi<RecentUsageResponse>(
      enabled ? `/users/${userId}/usage/recent?limit=25` : null
    );
  const { data: health } = useApi<ProviderHealthResponse>(
    enabled ? `/users/${userId}/providers/health` : null
  );

  const chartData = React.useMemo(() => {
    if (!usage) return [];
    return Object.entries(usage.requests_over_time)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [usage]);

  const topProviders = React.useMemo(() => {
    if (!usage) return [];
    return Object.entries(usage.per_provider)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [usage]);

  const topModels = React.useMemo(() => {
    if (!usage) return [];
    return Object.entries(usage.per_model)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [usage]);

  const healthList = React.useMemo(() => {
    if (!health) return [];
    return Object.entries(health.providers)
      .map(([provider, h]) => ({ provider, ...h }))
      .sort((a, b) => b.requests_last_day - a.requests_last_day);
  }, [health]);

  const connectedProviders = healthList.filter((p) => p.configured).length;
  const coolingDown = healthList.filter(
    (p) => p.status === "cooling_down"
  ).length;

  const totalRequests = usage?.total_requests ?? 0;
  const failed =
    usage && usage.success_rate != null
      ? Math.round(totalRequests * (1 - usage.success_rate))
      : 0;
  const avgTokens =
    usage && totalRequests > 0
      ? Math.round(usage.total_tokens / totalRequests)
      : 0;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayCount = usage?.requests_over_time?.[todayKey] ?? 0;
  const requestsLastDay = healthList.reduce(
    (sum, p) => sum + p.requests_last_day,
    0
  );

  const loading = usageLoading || !ready;
  const logs = recent?.logs ?? [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A live view of routing across your connected providers."
        actions={
          <Badge variant={connectedProviders > 0 ? "success" : "muted"}>
            {connectedProviders} connected
          </Badge>
        }
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          icon={Activity}
          loading={loading}
          value={formatNumber(totalRequests)}
          badge={
            todayCount > 0 ? (
              <Badge variant="muted" className="gap-1">
                <Clock className="h-3 w-3" /> {formatNumber(todayCount)} today
              </Badge>
            ) : undefined
          }
        />
        <StatCard
          label="Total Tokens"
          icon={Hash}
          loading={loading}
          value={formatNumber(usage?.total_tokens ?? 0)}
          hint={avgTokens > 0 ? `${formatNumber(avgTokens)} avg / request` : undefined}
        />
        <StatCard
          label="Success Rate"
          icon={CheckCircle2}
          loading={loading}
          value={formatPercent(usage?.success_rate ?? null)}
          hint={
            totalRequests > 0
              ? failed > 0
                ? `${formatNumber(failed)} failed of ${formatNumber(totalRequests)}`
                : "No failures recorded"
              : undefined
          }
        />
        <StatCard
          label="Connected Providers"
          icon={Boxes}
          loading={loading || !health}
          value={connectedProviders}
          hint={
            coolingDown > 0
              ? `${coolingDown} cooling down`
              : connectedProviders > 0
                ? "All healthy"
                : undefined
          }
        />
      </div>

      {/* Chart + provider health */}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4 text-muted-foreground" />
              Requests over time
            </CardTitle>
            {chartData.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {chartData.length} day{chartData.length > 1 ? "s" : ""} ·{" "}
                {formatNumber(requestsLastDay)} in last 24h
              </span>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : chartData.length === 0 ? (
              <EmptyState
                icon={LineChartIcon}
                title="No requests yet"
                description="Once you start sending requests through your keychain key, daily volume will show up here."
              />
            ) : (
              <UsageChart data={chartData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              Provider health
            </CardTitle>
            <Link
              href="/providers"
              className="inline-flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {!health ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : healthList.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="No providers connected"
                description="Add a provider key to start routing."
              />
            ) : (
              <ul className="space-y-1">
                {healthList.map((p) => (
                  <li
                    key={p.provider}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 !rounded-full",
                          STATUS_DOT[p.status],
                          p.status === "active" && "animate-status"
                        )}
                      />
                      <span className="truncate text-sm font-medium">
                        {providerLabel(p.provider)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      <span className="tabular-nums">
                        {formatNumber(p.requests_last_day)}
                        <span className="ml-1 text-muted-foreground/60">/24h</span>
                      </span>
                      {p.status === "cooling_down" && (
                        <Badge variant="warning">{p.cooldown_seconds_remaining}s</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Requests by provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <BreakdownBars
                items={topProviders}
                formatLabel={providerLabel}
                emptyLabel="No served requests yet"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              Requests by model
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <BreakdownBars
                items={topModels}
                emptyLabel="No served requests yet"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent requests */}
      <Card className="mt-3">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Recent requests
          </CardTitle>
          {logs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Last {logs.length}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {recentLoading || !ready ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="Your most recent requests will appear here with model, tokens, latency and status."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Effort</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="muted" className="font-mono lowercase">
                        {log.effort}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.succeeded_model ? (
                        <span>
                          {log.succeeded_model}
                          {log.provider && (
                            <span className="ml-1.5 text-muted-foreground">
                              · {providerLabel(log.provider)}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {log.total_tokens != null
                        ? formatNumber(log.total_tokens)
                        : "—"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        log.latency_ms != null && log.latency_ms > 5000
                          ? "text-warning"
                          : ""
                      )}
                    >
                      {log.latency_ms != null ? `${log.latency_ms} ms` : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={log.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
