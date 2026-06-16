"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield } from "lucide-react";

const ROLES = [
  { id: "student", label: "Student", desc: "Take exams, learn with AI, track progress" },
  { id: "teacher", label: "Teacher", desc: "Create exams, grade with AI, monitor classes" },
  { id: "parent", label: "Parent", desc: "Monitor progress, receive reports" },
];

const trustItems = [
  "End-to-end encryption",
  "GDPR / RODO compliant",
  "EU-based servers",
];

export default function RegisterPage() {
  const [role, setRole] = useState("student");
  const [step, setStep] = useState(1);

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
            Start Your<br />Education Journey
          </h2>
          <p className="text-sm text-white/40 max-w-sm leading-relaxed mb-8">
            Join 36,000+ students and 800+ teachers. Create your account in under 60 seconds.
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

          <h1 className="text-xl font-semibold mb-1">Create account</h1>
          <p className="text-sm text-white/40 mb-6">Choose your role to get started</p>

          <div className="space-y-2 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id); setStep(2); }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  role === r.id && step > 1
                    ? "border-cyan-500/30 bg-cyan-500/[0.04]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                }`}
              >
                <div className="text-sm font-medium text-white/80">{r.label}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{r.desc}</div>
              </button>
            ))}
          </div>

          {step > 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border border-white/[0.08] text-white/80 hover:bg-white/[0.04] transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4"><rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" rx="1.5"/><rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" rx="1.5"/><rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" rx="1.5"/><rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" rx="1.5"/></svg>
                Continue with Microsoft
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border border-white/[0.08] text-white/80 hover:bg-white/[0.04] transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.678 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.05 3.621-5.09 3.621-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/></svg>
                Continue with Google
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
                <div className="relative flex justify-center"><span className="px-2 text-[10px] text-white/20 bg-[#0a0a12]">or</span></div>
              </div>

              <input type="text" placeholder="Full name" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
              <input type="email" placeholder="Email" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
              <input type="password" placeholder="Password" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
              <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all">
                Create account <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <p className="mt-6 text-center text-[10px] text-white/20">
              Already have an account?{' '}
              <a href="/auth/login" className="text-cyan-400/60 hover:text-cyan-400">Sign in</a>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
