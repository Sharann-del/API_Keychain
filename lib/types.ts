export type Tier = "low" | "medium" | "high";
export type Effort = "low" | "medium" | "high";
export type ProviderStatus = "active" | "cooling_down" | "untested";

export interface KeychainKey {
  id: number;
  label: string;
  masked: string;
  is_primary: boolean;
  rate_limit_per_minute: number | null;
  revoked: boolean;
  created_at: string | null;
  last_used_at: string | null;
}

export interface CreatedKeychainKey extends KeychainKey {
  user_id: string;
  api_key: string;
  warning: string;
}

export interface ListKeychainKeysResponse {
  user_id: string;
  keys: KeychainKey[];
}

export interface ProviderKeyInfo {
  id: number;
  provider: string;
  key_label: string;
  created_at: string | null;
}

export interface ListProviderKeysResponse {
  user_id: string;
  providers: string[];
  keys: ProviderKeyInfo[];
}

export interface ProviderCatalogEntry {
  provider: string;
  base_url: string;
  openai_compatible: boolean;
}

export interface ProviderHealthEntry {
  status: ProviderStatus;
  configured: boolean;
  last_success: string | null;
  last_failure: string | null;
  last_429: string | null;
  cooldown_seconds_remaining: number;
  requests_last_minute: number;
  requests_last_day: number;
}

export interface ProviderHealthResponse {
  user_id: string;
  cooldown_seconds: number;
  providers: Record<string, ProviderHealthEntry>;
}

export interface UserModel {
  id: string;
  model_entry: string;
  provider: string;
  tier: Tier;
  enabled: boolean;
  priority: number;
  is_custom: boolean;
  /** False when the user has no key for this model's provider — it won't route. */
  provider_connected: boolean;
}

export interface ListModelsResponse {
  user_id: string;
  models: UserModel[];
}

export interface Preferences {
  preferred_providers: string[];
  excluded_providers: string[];
  excluded_models: string[];
}

export interface PreferencesResponse extends Preferences {
  user_id: string;
}

export interface UsageResponse {
  user_id: string;
  total_requests: number;
  total_tokens: number;
  success_rate: number | null;
  per_provider: Record<string, number>;
  per_model: Record<string, number>;
  requests_over_time: Record<string, number>;
}

export interface RequestLog {
  id: number;
  timestamp: string | null;
  effort: Effort;
  models_attempted: Array<Record<string, unknown>> | null;
  succeeded_model: string | null;
  provider: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  latency_ms: number | null;
  status: string;
  status_code: number | null;
}

export interface RecentUsageResponse {
  user_id: string;
  count: number;
  logs: RequestLog[];
}

export interface InitUserResponse {
  user_id: string;
  created: boolean;
}
