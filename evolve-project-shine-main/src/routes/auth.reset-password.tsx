import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPassword,
  head: () => ({ meta: [{ title: "Reset Password — EduNex" }] }),
});

function ResetPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();

  return (
    <AuthLayout title="Secure & Reliable" subtitle="Reset your password safely. Enterprise-grade security.">
      <Toaster theme="dark" />
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-xl font-semibold text-white mb-1">Reset password</h1>
            <p className="text-sm mb-6" style={{ color: "oklch(1 0 0 / 0.45)" }}>Enter your email and we&apos;ll send a reset link.</p>
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(1 0 0 / 0.3)" }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full h-11 pl-10 pr-4 text-sm rounded-xl transition-all"
                  style={{
                    background: "oklch(1 0 0 / 0.04)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    color: "#fff", outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.4)";
                    e.currentTarget.style.boxShadow = "0 0 10px oklch(0.7 0.15 200 / 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
              {error && (
                <p className="text-xs" style={{ color: "oklch(0.6 0.2 25)" }}>{error}</p>
              )}
              <button
                onClick={async () => {
                  if (!email) return;
                  setLoading(true);
                  setError("");
                  const result = await resetPassword(email);
                  setLoading(false);
                  if (result.error) {
                    setError(result.error);
                  } else {
                    setSent(true);
                  }
                }}
                disabled={!email || loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))",
                  color: "#fff",
                  boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.3)",
                }}
                onMouseEnter={(e) => {
                  if (email && !loading) {
                    e.currentTarget.style.boxShadow = "0 0 40px oklch(0.7 0.15 200 / 0.5)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 20px oklch(0.7 0.15 200 / 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {loading ? "Sending..." : "Send reset link"} {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-6 text-center text-xs" style={{ color: "oklch(1 0 0 / 0.25)" }}>
              Remember your password?{" "}
              <Link to="/auth/student" className="transition-colors" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }}>
                Sign in
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <CheckCircle2 className="w-14 h-14" style={{ color: "oklch(0.65 0.2 150)" }} />
            </motion.div>
            <h1 className="mt-4 text-xl font-semibold text-white">Check your email</h1>
            <p className="mt-1 text-sm" style={{ color: "oklch(1 0 0 / 0.45)" }}>Reset link sent. Expires in 30 minutes.</p>
            <Link
              to="/auth/student"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))",
                color: "#fff",
                boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.3)",
              }}
            >
              Back to sign in <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
