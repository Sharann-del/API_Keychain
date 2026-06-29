"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Loader2, LogOut, RefreshCw, User } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { savePrimaryKey } from "@/lib/keystore";
import type { CreatedKeychainKey } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/copy-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SecretDialog } from "@/components/secret-dialog";

function Field({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: string;
  copyValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2 rounded-lg bg-secondary p-2">
        <code className="flex-1 overflow-x-auto whitespace-nowrap px-1 font-mono text-sm scrollbar-thin">
          {value}
        </code>
        {copyValue && <CopyButton value={copyValue} label={`${label} copied`} />}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { userId, email, user, signOut } = useAuth();
  const router = useRouter();

  const [regenOpen, setRegenOpen] = React.useState(false);
  const [secretOpen, setSecretOpen] = React.useState(false);
  const [newSecret, setNewSecret] = React.useState<string | null>(null);

  const initialName =
    (user?.user_metadata?.display_name as string | undefined) ??
    (user?.user_metadata?.full_name as string | undefined) ??
    "";
  const [displayName, setDisplayName] = React.useState(initialName);
  const [savingName, setSavingName] = React.useState(false);

  React.useEffect(() => {
    setDisplayName(initialName);
  }, [initialName]);

  const saveDisplayName = async () => {
    if (!supabaseConfigured) return;
    setSavingName(true);
    try {
      const { error } = await getSupabase().auth.updateUser({
        data: { display_name: displayName.trim() },
      });
      if (error) throw error;
      toast.success("Display name updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update display name"
      );
    } finally {
      setSavingName(false);
    }
  };

  const regenerate = async () => {
    try {
      const res = await api.post<CreatedKeychainKey>(
        `/users/${userId}/regenerate-key`
      );
      if (userId) savePrimaryKey(userId, res.api_key);
      setNewSecret(res.api_key);
      setSecretOpen(true);
      toast.success("Primary key regenerated");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to regenerate key"
      );
    }
  };

  const doSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account and rotate your primary keychain key."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="display-name">Display name</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we address you?"
                  maxLength={60}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !savingName) void saveDisplayName();
                  }}
                />
                <Button
                  onClick={saveDisplayName}
                  disabled={savingName || displayName.trim() === initialName.trim()}
                >
                  {savingName && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Shown across your dashboard in place of your email.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label="Email"
              value={email ?? "—"}
              copyValue={email ?? undefined}
            />
            <Field
              label="User ID"
              value={userId ?? "—"}
              copyValue={userId ?? undefined}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Regenerate primary key</p>
                <p className="text-sm text-muted-foreground">
                  Issues a new primary ak- key. The old one stops working
                  immediately.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setRegenOpen(true)}
              >
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-sm text-muted-foreground">
                  End your session on this device.
                </p>
              </div>
              <Button variant="outline" onClick={doSignOut}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={regenOpen}
        onOpenChange={setRegenOpen}
        title="Regenerate primary key?"
        description="Your current primary key will immediately stop working. Any apps using it must be updated with the new key."
        confirmLabel="Regenerate"
        destructive
        onConfirm={regenerate}
      />

      <SecretDialog
        open={secretOpen}
        onOpenChange={setSecretOpen}
        title="Your new primary key"
        secret={newSecret}
      />
    </div>
  );
}
