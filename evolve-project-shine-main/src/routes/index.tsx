import { createFileRoute } from "@tanstack/react-router";
import { PremiumLanding } from "@/components/landing/PremiumLanding";

export const Route = createFileRoute("/")({
  component: PremiumLanding,
});
