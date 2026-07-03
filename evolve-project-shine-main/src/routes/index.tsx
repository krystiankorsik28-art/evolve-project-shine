import { createFileRoute } from "@tanstack/react-router";
import { PremiumLandingV2 } from "@/components/landing/PremiumLandingV2";

export const Route = createFileRoute("/")({
  component: PremiumLandingV2,
});
