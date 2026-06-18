import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/admin")({
  component: RedirectToAuth,
  head: () => ({ meta: [{ title: "Admin — EduNex" }] }),
});

function RedirectToAuth() {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to: "/auth", replace: true }); }, [navigate]);
  return null;
}
