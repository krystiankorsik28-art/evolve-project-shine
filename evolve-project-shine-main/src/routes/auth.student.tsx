import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/student")({
  component: RedirectToAuth,
  head: () => ({ meta: [{ title: "Student — EduNex" }] }),
});

function RedirectToAuth() {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to: "/auth", replace: true }); }, [navigate]);
  return null;
}
