import { createFileRoute } from "@tanstack/react-router";
import { PremiumLanding } from "@/components/landing/PremiumLanding";

function LandingPage() {
  return <PremiumLanding />;
}

export const Route = createFileRoute("/")({
  component: LandingPage,
});
