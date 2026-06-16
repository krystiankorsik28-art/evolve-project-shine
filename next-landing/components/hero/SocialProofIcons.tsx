"use client";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useState } from "react";

const PROVIDERS = [
  {
    id: "google" as const,
    label: "Google",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.678 1.24 6.65l4.026 3.115Z" />
        <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
        <path fill="#4A90E2" d="M19.834 21c2.195-2.05 3.621-5.09 3.621-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
        <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
      </svg>
    ),
  },
  {
    id: "apple" as const,
    label: "Apple",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
  {
    id: "azure" as const,
    label: "Microsoft",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" rx="1.5" />
        <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" rx="1.5" />
        <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" rx="1.5" />
        <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" rx="1.5" />
      </svg>
    ),
  },
];

export function SocialProofIcons() {
  const [busy, setBusy] = useState<string | null>(null);

  const signIn = async (provider: (typeof PROVIDERS)[number]["id"]) => {
    setBusy(provider);
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch {
      setBusy(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="space-y-4"
    >
      <p className="text-xs text-white/30 tracking-widest uppercase">Join 36,140+ students</p>
      <div className="flex items-center gap-3">
        {PROVIDERS.map((p) => (
          <motion.button
            key={p.id}
            onClick={() => signIn(p.id)}
            disabled={busy !== null}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-glass-border bg-glass backdrop-blur-md
              hover:border-white/20 hover:bg-white/[0.06] transition-colors disabled:opacity-50 disabled:cursor-wait"
            title={`Sign in with ${p.label}`}
          >
            {busy === p.id ? (
              <svg className="animate-spin w-4 h-4 text-white/50" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              p.svg
            )}
          </motion.button>
        ))}
        <span className="text-xs text-white/30 ml-1">Register with Google, Apple or Microsoft</span>
      </div>
    </motion.div>
  );
}
