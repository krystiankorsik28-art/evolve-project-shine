import { useEffect, useState, useCallback, useRef } from "react";
import { Outlet, createRoute, useNavigate, redirect, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Route as rootRoute } from "./__root";
import { AppShell } from "@/components/dashboard/AppShell";
import { toast } from "sonner";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_MS = 60 * 1000;

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth", replace: true });
  },
  component: AuthenticatedLayout,
});

function useIdleTimeout() {
  const navigate = useNavigate();
  const lastActivity = useRef(Date.now());
  const warned = useRef(false);

  const resetTimer = useCallback(() => {
    lastActivity.current = Date.now();
    warned.current = false;
  }, []);

  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "mousemove", "scroll", "click"];
    const handler = () => resetTimer();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetTimer();

    const check = setInterval(() => {
      const elapsed = Date.now() - lastActivity.current;
      if (elapsed >= IDLE_TIMEOUT_MS) {
        supabase.auth.signOut();
        toast.error("Wylogowano z powodu braku aktywności");
        navigate({ to: "/auth", replace: true });
        clearInterval(check);
      } else if (elapsed >= IDLE_TIMEOUT_MS - WARNING_MS && !warned.current) {
        warned.current = true;
        toast.info("Sesja wygaśnie za 1 minutę z powodu braku aktywności");
      }
    }, 10000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearInterval(check);
    };
  }, [navigate, resetTimer]);
}

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(true);
  const usesOwnShell = ["/teacher", "/admin", "/parent"].some((path) => location.pathname.startsWith(path));

  useIdleTimeout();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate({ to: "/auth", replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg text-fg-muted">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-blue-700 animate-pulse" />
          Sprawdzanie sesji...
        </div>
      </div>
    );
  }

  if (usesOwnShell) return <Outlet />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
