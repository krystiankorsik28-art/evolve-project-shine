import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function Spinner() {
  return (
    <div className="relative w-12 h-12 mx-auto">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: "2px solid oklch(1 0 0 / 0.06)" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: "2px solid transparent",
          borderTopColor: "oklch(0.7 0.15 200)",
          borderRightColor: "oklch(0.6 0.2 240)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-1 rounded-full"
        style={{
          border: "2px solid transparent",
          borderBottomColor: "oklch(0.65 0.2 280 / 0.6)",
          borderLeftColor: "oklch(0.7 0.15 200 / 0.4)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

const PHASES = [
  "Verifying session",
  "Fetching profile",
  "Checking permissions",
  "Redirecting",
];

function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [phase, setPhase] = useState(0);
  const [message, setMessage] = useState("Verifying authentication...");

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase((p) => Math.min(p + 1, PHASES.length - 1));
    }, 600);
    return () => clearInterval(phaseInterval);
  }, []);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) {
          const params = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = params.get("access_token");
          if (!accessToken) throw new Error("No session found");
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const role = user.user_metadata?.role || "student";
        setStatus("success");
        setMessage("Signed in successfully!");

        setTimeout(() => {
          switch (role) {
            case "teacher": navigate({ to: "/teacher" }); break;
            case "admin": navigate({ to: "/admin" }); break;
            case "parent": navigate({ to: "/student/dashboard" }); break;
            default: navigate({ to: "/student/dashboard" }); break;
          }
        }, 1500);
      } catch (e: any) {
        setStatus("error");
        setMessage(e.message || "Authentication failed");
        setTimeout(() => navigate({ to: "/auth/student" }), 3000);
      }
    };
    handleCallback();
  }, [navigate]);

  return (
    <AuthLayout title="Completing sign-in" subtitle="Please wait while we verify your credentials.">
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center py-8"
          >
            <Spinner />
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 text-sm font-medium"
              style={{ color: "oklch(1 0 0 / 0.6)" }}
            >
              {PHASES[phase]}
            </motion.p>
            <div className="flex gap-1.5 mt-4">
              {PHASES.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: i === phase ? "20px" : "6px",
                    background: i <= phase ? "oklch(0.7 0.15 200)" : "oklch(1 0 0 / 0.08)",
                    boxShadow: i <= phase ? "0 0 6px oklch(0.7 0.15 200 / 0.4)" : "none",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center justify-center text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
            >
              <CheckCircle2 className="w-14 h-14" style={{ color: "oklch(0.65 0.2 150)" }} />
            </motion.div>
            <p className="mt-4 text-lg font-semibold text-white">Signed in!</p>
            <p className="mt-1 text-sm" style={{ color: "oklch(1 0 0 / 0.4)" }}>Redirecting you shortly...</p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center justify-center text-center py-8"
          >
            <XCircle className="w-14 h-14" style={{ color: "oklch(0.6 0.2 30)" }} />
            <p className="mt-4 text-sm" style={{ color: "oklch(1 0 0 / 0.6)" }}>{message}</p>
            <p className="mt-2 text-xs" style={{ color: "oklch(1 0 0 / 0.3)" }}>Redirecting to sign in...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
