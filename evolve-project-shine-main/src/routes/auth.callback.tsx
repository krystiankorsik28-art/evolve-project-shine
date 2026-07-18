import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Clock3, Loader2, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isPortalRole, resolveUserAccess, ROLE_DASHBOARD, ROLE_LABEL } from "@/lib/auth/access";

type CallbackStatus = "loading" | "onboarding" | "success" | "pending" | "error";

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

        if (user.user_metadata?.onboarding_completed !== true) {
          setStatus("onboarding");
          setMessage(
            "Adres został potwierdzony. Za chwilę zadamy kilka krótkich pytań i przygotujemy Twój pierwszy widok EduNex.",
          );
          window.setTimeout(() => {
            navigate({ to: "/onboarding", replace: true });
          }, 750);
          return;
        }

        const intendedRoleValue = window.sessionStorage.getItem("edunex_intended_role");
        const intendedRole = isPortalRole(intendedRoleValue) ? intendedRoleValue : null;
        const access = await resolveUserAccess(user, intendedRole);
        window.sessionStorage.removeItem("edunex_intended_role");

        if (!access.approvedRole) {
          setStatus("pending");
          setMessage(
            access.selectedStatus === "rejected"
              ? "Wniosek o tę rolę został odrzucony. Skontaktuj się z administratorem placówki."
              : "Tożsamość została potwierdzona, ale dostęp do wybranej roli oczekuje jeszcze na akceptację placówki.",
          );
          return;
        }

        setStatus("success");
        setMessage(
          intendedRole && intendedRole !== access.approvedRole
            ? `Konto ma aktywny dostęp jako ${ROLE_LABEL[access.approvedRole]}. Otwieramy właściwy panel.`
            : `Dostęp jako ${ROLE_LABEL[access.approvedRole]} został potwierdzony.`,
        );

        window.setTimeout(() => {
          navigate({ to: ROLE_DASHBOARD[access.approvedRole!], replace: true });
        }, 900);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Logowanie nie powiodło się");
        window.setTimeout(() => navigate({ to: "/auth", replace: true }), 2600);
      }
    };

    handleCallback();
  }, [navigate]);

  const Icon =
    status === "success"
      ? CheckCircle2
      : status === "onboarding"
        ? Sparkles
        : status === "pending"
          ? Clock3
          : status === "error"
            ? XCircle
            : Loader2;

  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f7fb] px-5 text-slate-950">
      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-[0_24px_90px_rgba(15,23,42,0.12)]"
      >
        <Link
          to="/"
          className="mx-auto mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          EduNex Exam OS
        </Link>
        <div
          className={`mx-auto grid h-14 w-14 place-items-center rounded-lg ${status === "error" ? "bg-red-50 text-red-700" : status === "success" ? "bg-emerald-50 text-emerald-700" : status === "pending" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-800"}`}
        >
          <Icon className={`h-7 w-7 ${status === "loading" ? "animate-spin" : ""}`} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">
          {status === "loading" && "Trwa weryfikacja"}
          {status === "onboarding" && "Zacznijmy od krótkiego startu"}
          {status === "success" && "Dostęp potwierdzony"}
          {status === "pending" && "Dostęp oczekuje na akceptację"}
          {status === "error" && "Nie udało się zalogować"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-xs leading-6 text-slate-500">
          System sprawdza sesję Supabase Auth, rolę użytkownika i docelowy panel. Jeśli proces nie
          zakończy się automatycznie, wróć do logowania.
        </div>
        {(status === "error" || status === "pending") && (
          <Link
            to="/auth"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Wróć do logowania
          </Link>
        )}
      </motion.main>
    </div>
  );
}
