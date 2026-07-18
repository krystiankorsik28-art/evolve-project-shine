import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/e-dziennik")({
  component: RedirectToEdziennik,
  head: () => ({ meta: [{ title: "NexDziennik — EduNex" }] }),
});

function RedirectToEdziennik() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/edziennik", replace: true });
  }, [navigate]);
  return null;
}
