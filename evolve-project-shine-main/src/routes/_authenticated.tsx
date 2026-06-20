import { useEffect, useState } from "react";
import { Outlet, createRoute, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Route as rootRoute } from "./__root";
import { AppShell } from "@/components/dashboard/AppShell";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth", replace: true });
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(true);

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
