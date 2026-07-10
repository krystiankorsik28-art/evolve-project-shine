import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CallbackStatus = "loading" | "success" | "error";

const dashboards: Record<string, string> = {
  teacher: "/teacher",
  admin: "/admin",
  parent: "/student/dashboard",
  student: "/student/dashboard",
};

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
  head: () => ({ meta: [{ title: "Weryfikacja logowania | EduNex" }] }),
});

function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("Weryfikujemy sesję i uprawnienia użytkownika.");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) {
          const params = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = params.get("access_token");
          if (!accessToken) throw new Error("Nie znaleziono aktywnej sesji");
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Nie udało się pobrać użytkownika");

        const role = user.user_metadata?.role || user.app_metadata?.role || "student";
        setStatus("success");
        setMessage("Logowanie zakończone. Przekierowujemy do właściwego panelu.");

        window.setTimeout(() => {
          navigate({ to: dashboards[role] || "/student/dashboard", replace: true });
        }, 900);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Logowanie nie powiodło się");
        window.setTimeout(() => navigate({ to: "/auth", replace: true }), 2600);
      }
    };

    handleCallback();
  }, [navigate]);

  const Icon = status === "success" ? CheckCircle2 : status === "error" ? XCircle : Loader2;

  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f7fb] px-5 text-slate-950">
      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-[0_24px_90px_rgba(15,23,42,0.12)]"
      >
        <Link to="/" className="mx-auto mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          EduNex Exam OS
        </Link>
        <div className={`mx-auto grid h-14 w-14 place-items-center rounded-lg ${status === "error" ? "bg-red-50 text-red-700" : status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-800"}`}>
          <Icon className={`h-7 w-7 ${status === "loading" ? "animate-spin" : ""}`} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">
          {status === "loading" && "Trwa weryfikacja"}
          {status === "success" && "Dostęp potwierdzony"}
          {status === "error" && "Nie udało się zalogować"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-xs leading-6 text-slate-500">
          System sprawdza sesję Supabase Auth, rolę użytkownika i docelowy panel. Jeśli proces nie zakończy się automatycznie, wróć do logowania.
        </div>
        {status === "error" && (
          <Link to="/auth" className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Wróć do logowania
          </Link>
        )}
      </motion.main>
    </div>
  );
}
