import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/parent")({
  component: RedirectToAuth,
  head: () => ({ meta: [{ title: "Parent — EduNex" }] }),
});

function RedirectToAuth() {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to: "/auth", replace: true }); }, [navigate]);
  return null;
}
