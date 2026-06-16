"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a12] flex">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0c0c1a] via-[#0a0a12] to-[#0c0c1a] p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_oklch(0.82_0.12_200_/_0.06),_transparent_60%)] pointer-events-none" />
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold">EduNex</span>
          </div>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Secure &amp; Reliable<br />Education Platform
          </h2>
          <p className="text-sm text-white/40 max-w-sm leading-relaxed mb-8">
            Your data is protected with enterprise-grade security. Reset your password safely.
          </p>
          <div className="space-y-3">
            {["End-to-end encryption", "GDPR / RODO compliant", "EU-based servers"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-white/40">
                <Shield className="w-3.5 h-3.5 text-cyan-400/60" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-white/20">&copy; 2026 EduNex. All rights reserved.</div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold">EduNex</span>
          </div>

          {!sent ? (
            <>
              <h1 className="text-xl font-semibold mb-1">Reset password</h1>
              <p className="text-sm text-white/40 mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors"
                />
                <button
                  onClick={() => setSent(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all"
                >
                  Send reset link <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <p className="mt-6 text-center text-[10px] text-white/20">
                Remember your password?{' '}
                <a href="/auth/login" className="text-cyan-400/60 hover:text-cyan-400">Sign in</a>
              </p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              </div>
              <h1 className="text-xl font-semibold mb-1">Check your email</h1>
              <p className="text-sm text-white/40 mb-6">
                We&apos;ve sent a password reset link to your email. It expires in 30 minutes.
              </p>
              <a
                href="/auth/login"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all"
              >
                Back to sign in <ArrowRight className="w-3 h-3" />
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
