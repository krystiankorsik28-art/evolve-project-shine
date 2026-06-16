import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying authentication...");

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
      <div className="flex flex-col items-center justify-center text-center py-12">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
            <p className="text-white/60 text-sm">{message}</p>
          </div>
        )}
        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
            <p className="text-white text-lg font-semibold">Signed in!</p>
            <p className="text-white/40 text-sm">Redirecting you shortly...</p>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="w-14 h-14 text-red-400 mx-auto" />
            <p className="text-white/60 text-sm">{message}</p>
            <p className="text-white/30 text-xs">Redirecting to sign in...</p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
