import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseLanding } from "@/components/landing/EnterpriseLanding";

export const Route = createFileRoute("/")({
  component: EnterpriseLanding,
});
