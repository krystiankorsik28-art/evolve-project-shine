import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPassword,
  head: () => ({ meta: [{ title: "Reset Password — EduNex" }] }),
});

function ResetPassword() {
  const [sent, setSent] = useState(false);

  return (
    <AuthLayout title="Secure & Reliable" subtitle="Reset your password safely. Enterprise-grade security.">
      <Toaster theme="dark" />
      {!sent ? (
        <>
          <h1 className="text-xl font-semibold text-white mb-1">Reset password</h1>
          <p className="text-sm text-white/40 mb-6">Enter your email and we&apos;ll send a reset link.</p>
          <div className="space-y-4">
            <input type="email" placeholder="Email" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
            <button onClick={() => setSent(true)} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all">
              Send reset link <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="mt-6 text-center text-[10px] text-white/20">
            Remember your password?{' '}
            <Link to="/auth/student" className="text-cyan-400/60 hover:text-cyan-400">Sign in</Link>
          </p>
        </>
      ) : (
        <div className="text-center">
          <CheckCircle2 className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-1">Check your email</h1>
          <p className="text-sm text-white/40 mb-6">Reset link sent. Expires in 30 minutes.</p>
          <Link to="/auth/student" className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all">
            Back to sign in <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
