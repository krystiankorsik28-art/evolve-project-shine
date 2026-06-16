import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Shield } from "lucide-react";

const trustItems = [
  "End-to-end encryption",
  "GDPR / RODO compliant",
  "EU-based servers",
  "99.9% uptime",
];

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a12] flex">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0c0c1a] via-[#0a0a12] to-[#0c0c1a] p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,oklch(0.82_0.12_200_/_0.06),transparent_60%)] pointer-events-none" />
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold text-white">EduNex</span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
            {title}
          </h2>
          <p className="text-sm text-white/40 max-w-sm leading-relaxed mb-8">
            {subtitle}
          </p>
          <div className="space-y-3">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-white/40">
                <Shield className="w-3.5 h-3.5 text-cyan-400/60" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-white/20">
          &copy; 2026 EduNex. All rights reserved.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-semibold text-white">EduNex</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
