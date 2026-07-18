import { useEffect, useCallback, useRef } from "react";
import { Outlet, createRoute, useNavigate, redirect, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Route as rootRoute } from "./__root";
import { AppShell } from "@/components/dashboard/AppShell";
import { toast } from "sonner";
import { ROLE_DASHBOARD, resolveUserAccess, type PortalRole } from "@/lib/auth/access";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_MS = 60 * 1000;

function roleCanOpenPath(role: PortalRole, pathname: string) {
  if (pathname.startsWith("/admin")) return role === "admin";
  if (pathname.startsWith("/teacher")) return role === "teacher" || role === "admin";
  if (pathname.startsWith("/parent")) return role === "parent" || role === "admin";
  if (pathname.startsWith("/student")) return role === "student" || role === "admin";
  return true;
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: async ({ location }) => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) throw redirect({ to: "/auth", replace: true });

    const { approvedRole: role } = await resolveUserAccess(user);
    if (!role) throw redirect({ to: "/auth", replace: true });
    if (!roleCanOpenPath(role, location.pathname)) {
      throw redirect({ to: ROLE_DASHBOARD[role], replace: true });
    }
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
    events.forEach((eventName) => window.addEventListener(eventName, handler, { passive: true }));
    resetTimer();

    const check = window.setInterval(async () => {
      const elapsed = Date.now() - lastActivity.current;
      if (elapsed >= IDLE_TIMEOUT_MS) {
        window.clearInterval(check);
        await supabase.auth.signOut();
        toast.error("Wylogowano z powodu braku aktywności");
        await navigate({ to: "/auth", replace: true });
      } else if (elapsed >= IDLE_TIMEOUT_MS - WARNING_MS && !warned.current) {
        warned.current = true;
        toast.info("Sesja wygaśnie za minutę z powodu braku aktywności");
      }
    }, 10_000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, handler));
      window.clearInterval(check);
    };
  }, [navigate, resetTimer]);
}

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const usesOwnShell = ["/teacher", "/admin", "/parent"].some((path) =>
    location.pathname.startsWith(path),
  );

  useIdleTimeout();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        void navigate({ to: "/auth", replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (usesOwnShell) return <Outlet />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
