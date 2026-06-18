import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/teacher")({
  component: RedirectToAuth,
  head: () => ({ meta: [{ title: "Teacher — EduNex" }] }),
});

function RedirectToAuth() {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to: "/auth", replace: true }); }, [navigate]);
  return null;
}
