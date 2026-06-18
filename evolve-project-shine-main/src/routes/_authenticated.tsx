import { useEffect, useState } from "react";
import { Outlet, createRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Route as rootRoute } from "./__root";
import { AppShell } from "@/components/dashboard/AppShell";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const redirectToLogin = async () => {
      await navigate({ to: "/auth", replace: true });
    };

    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;

      if (error || !data.user) {
        setReady(false);
        await redirectToLogin();
        return;
      }

      setReady(true);
    };

    void checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (session?.user) {
        setReady(true);
        return;
      }
      setReady(false);
      await redirectToLogin();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg text-fg-muted">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
