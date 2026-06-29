/**
 * Static catalog data. Provider endpoints + tier cascades mirror the backend
 * registry (`registry.py`); the per-provider `freeModels` lists enumerate the
 * free-tier models each provider exposes that the router can reach.
 */

export interface ProviderMeta {
  slug: string;
  name: string;
  /** One-line positioning used on provider cards / landing. */
  tagline: string;
  /** Optional extra copy for the connect dialog. */
  notes?: string;
  /** Shown when a provider may log prompts (e.g. free tiers). */
  promptLoggingWarning?: string;
  /** Prefix hint for API key format in the connect dialog. */
  authPrefix?: string;
  /** Where the backend proxies requests for this provider. */
  baseUrl: string;
  /** Domain used to resolve the real company logo via favicon service. */
  domain: string;
  /** Local icon override when the favicon is poor or wrong (e.g. Gemini). */
  iconUrl?: string;
  /** Free-tier models this provider serves, available through the keychain. */
  freeModels: string[];
  /** Models flagged as deprecated in the catalog UI. */
  deprecatedModels?: string[];
  /** Extra credential fields required beyond api_key (e.g. account_id). */
  credentialFields?: string[];
  /** Billing model hint shown on provider cards. */
  providerType?: ProviderType;
}

export type ProviderType = "permanent_free" | "trial_credits" | "usage_based";

export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  permanent_free: "Free tier",
  trial_credits: "Trial credits",
  usage_based: "Usage based",
};

export function providerTypeBadgeVariant(
  type: ProviderType
): "success" | "warning" | "outline" {
  if (type === "permanent_free") return "success";
  if (type === "trial_credits") return "warning";
  return "outline";
}

export const PROVIDERS: ProviderMeta[] = [
  {
    slug: "gemini",
    name: "Gemini",
    tagline: "Google's multimodal flagship — fast 2.0 Flash, deep 2.5 Pro.",
    baseUrl: "generativelanguage.googleapis.com",
    domain: "gemini.google.com",
    iconUrl: "/icons/gemini.png",
    freeModels: [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemma-3-27b-it",
      "gemma-3-12b-it",
      "gemma-3-4b-it",
    ],
  },
  {
    slug: "groq",
    name: "Groq",
    tagline: "LPU inference — Llama 3.3 70B at hundreds of tokens/sec.",
    baseUrl: "api.groq.com",
    domain: "groq.com",
    iconUrl: "/icons/groq.ico",
    freeModels: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "llama-3.2-3b-preview",
      "llama-3.2-1b-preview",
      "llama3-70b-8192",
      "llama3-8b-8192",
      "gemma2-9b-it",
      "qwen-2.5-32b",
      "deepseek-r1-distill-llama-70b",
      "mixtral-8x7b-32768",
    ],
  },
  {
    slug: "cerebras",
    name: "Cerebras",
    tagline: "Wafer-scale speed for Llama- and Qwen-class open models.",
    baseUrl: "api.cerebras.ai",
    domain: "cerebras.ai",
    iconUrl: "/icons/cerebras.ico",
    freeModels: [
      "llama-3.3-70b",
      "llama3.1-8b",
      "llama-4-scout-17b-16e-instruct",
      "qwen-3-32b",
      "deepseek-r1-distill-llama-70b",
    ],
  },
  {
    slug: "mistral",
    name: "Mistral",
    tagline: "Efficient European frontier models, open-weight roots.",
    baseUrl: "api.mistral.ai",
    domain: "mistral.ai",
    iconUrl: "/icons/mistral.svg",
    freeModels: [
      "mistral-small-latest",
      "mistral-large-latest",
      "open-mistral-nemo",
      "open-mistral-7b",
      "open-mixtral-8x7b",
      "open-mixtral-8x22b",
      "pixtral-12b",
      "codestral-latest",
      "ministral-8b-latest",
      "ministral-3b-latest",
    ],
  },
  {
    slug: "deepseek",
    name: "DeepSeek",
    tagline: "Reasoning-first models that rival closed frontier labs.",
    baseUrl: "api.deepseek.com",
    domain: "deepseek.com",
    iconUrl: "/icons/deepseek.svg",
    freeModels: ["deepseek-chat", "deepseek-reasoner"],
  },
  {
    slug: "openrouter",
    name: "OpenRouter",
    tagline: "A meta-gateway — dozens of free community models in one slot.",
    baseUrl: "openrouter.ai",
    domain: "openrouter.ai",
    iconUrl: "/icons/openrouter.svg",
    freeModels: [
      "deepseek/deepseek-r1:free",
      "deepseek/deepseek-chat:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemini-2.0-flash-exp:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "qwen/qwq-32b:free",
      "mistralai/mistral-nemo:free",
      "mistralai/mistral-7b-instruct:free",
      "nvidia/llama-3.1-nemotron-70b-instruct:free",
      "nousresearch/hermes-3-llama-3.1-405b:free",
      "openai/gpt-oss-120b:free",
      "openai/gpt-oss-20b:free",
    ],
  },
  {
    slug: "together",
    name: "Together",
    tagline: "Open-source model hosting at production scale.",
    baseUrl: "api.together.xyz",
    domain: "together.ai",
    iconUrl: "/icons/together.ico",
    freeModels: [
      "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      "meta-llama/Llama-Vision-Free",
      "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
    ],
  },
  {
    slug: "cohere",
    name: "Cohere",
    tagline: "Enterprise-grade Command models, OpenAI-compatible.",
    baseUrl: "api.cohere.ai",
    domain: "cohere.com",
    iconUrl: "/icons/cohere.ico",
    freeModels: [
      "command-r-plus",
      "command-r",
      "command-r7b",
      "command-light",
      "command-nightly",
      "aya-expanse-32b",
      "aya-expanse-8b",
    ],
  },
  {
    slug: "nim",
    name: "NVIDIA NIM",
    tagline: "NVIDIA-hosted open models via the NIM OpenAI-compatible API.",
    baseUrl: "integrate.api.nvidia.com",
    domain: "nvidia.com",
    freeModels: [
      "meta/llama-3.1-8b-instruct",
      "meta/llama-3.3-70b-instruct",
      "nvidia/llama-3.1-nemotron-70b-instruct",
    ],
  },
  {
    slug: "sambanova",
    name: "SambaNova",
    tagline: "Enterprise-speed Llama inference on SambaNova Cloud.",
    baseUrl: "api.sambanova.ai",
    domain: "sambanova.ai",
    freeModels: [
      "Meta-Llama-3.1-8B-Instruct",
      "Meta-Llama-3.3-70B-Instruct",
    ],
  },
  {
    slug: "hf",
    name: "Hugging Face",
    tagline: "Open models via the Hugging Face inference router.",
    baseUrl: "router.huggingface.co",
    domain: "huggingface.co",
    freeModels: [
      "meta-llama/Meta-Llama-3.1-8B-Instruct",
      "meta-llama/Meta-Llama-3.3-70B-Instruct",
      "Qwen/Qwen2.5-7B-Instruct",
    ],
  },
  {
    slug: "cf",
    name: "Cloudflare",
    tagline: "Workers AI models on Cloudflare's global edge.",
    baseUrl: "api.cloudflare.com",
    domain: "cloudflare.com",
    credentialFields: ["account_id"],
    freeModels: [
      "@cf/meta/llama-3.1-8b-instruct",
      "@cf/meta/llama-3.3-70b-instruct",
    ],
  },
];

export interface TierMeta {
  tier: "low" | "medium" | "high";
  label: string;
  blurb: string;
  /** The exact registry entries the router tries, in order. */
  models: string[];
}

export const TIERS: TierMeta[] = [
  {
    tier: "low",
    label: "Low",
    blurb:
      "Latency-optimized small models for autocomplete, classification and high-volume calls.",
    models: [
      "gemini-2.0-flash",
      "groq/llama-3.1-8b-instant",
      "cerebras/llama3.1-8b",
      "nim/meta/llama-3.1-8b-instruct",
      "sambanova/Meta-Llama-3.1-8B-Instruct",
      "openrouter/nvidia/llama-nemotron-nano-9b-v2:free",
      "openrouter/google/gemma-4-26b-a4b:free",
      "openrouter/openai/gpt-oss-20b:free",
    ],
  },
  {
    tier: "medium",
    label: "Medium",
    blurb:
      "The everyday workhorse tier — balanced quality and speed for chat and agents.",
    models: [
      "gemini-2.0-flash",
      "groq/llama-3.3-70b-versatile",
      "mistral-small-latest",
      "nim/meta/llama-3.3-70b-instruct",
      "sambanova/Meta-Llama-3.3-70B-Instruct",
      "openrouter/google/gemma-4-31b:free",
      "openrouter/nvidia/nemotron-3-super:free",
      "openrouter/openai/gpt-oss-120b:free",
    ],
  },
  {
    tier: "high",
    label: "High",
    blurb:
      "Frontier reasoning for hard problems — R1, Gemini 2.5 Pro and Nemotron Ultra.",
    models: [
      "gemini-2.5-pro",
      "deepseek/deepseek-r1",
      "groq/llama-3.3-70b-versatile",
      "nim/nvidia/llama-3.1-nemotron-70b-instruct",
      "openrouter/nvidia/nemotron-3-ultra:free",
      "openrouter/poolside/laguna-m.1:free",
      "openrouter/tngtech/deepseek-r1t2-chimera:free",
    ],
  },
];

/** Total free-tier models routable across every provider. */
export const TOTAL_MODELS = PROVIDERS.reduce(
  (sum, p) => sum + p.freeModels.length,
  0
);
export const TOTAL_PROVIDERS = PROVIDERS.length;

/** All provider slugs from the static catalog. */
export const PROVIDER_SLUGS = PROVIDERS.map((p) => p.slug);

/** Real company logo via Google's favicon service (no API key, highly available). */
export function logoUrl(domain: string, _size = 128): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}
