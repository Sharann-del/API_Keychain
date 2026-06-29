import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { JsonLd } from "@/components/json-ld";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.apikeychain.dev"),
  title: "API Keychain",
  description:
    "One API key for every free AI model. Route across 12 providers with OpenAI Chat Completions and Anthropic Messages — effort tiers, failover, and analytics.",
  openGraph: {
    title: "API Keychain",
    description:
      "One API key for every free AI model. OpenAI and Anthropic-compatible routing across Gemini, Groq, NVIDIA NIM, SambaNova, and more.",
    siteName: "API Keychain",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "API Keychain — One API Key. Multiple AI Providers.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "API Keychain",
    description:
      "One API key for every free AI model. OpenAI Chat Completions and Anthropic Messages with automatic failover.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark font-sans ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <JsonLd />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
