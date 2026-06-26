import { createFileRoute } from "@tanstack/react-router";
import { PremiumLanding } from "@/components/landing/PremiumLanding";
import { LandingEnhancements } from "@/components/landing/LandingEnhancements";

function LandingPage() {
  return (
    <>
      <PremiumLanding />
      <LandingEnhancements />
    </>
  );
}

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "EduNex - premium platforma egzaminacyjna" },
      {
        name: "description",
        content:
          "EduNex to nowoczesna platforma egzaminacyjna dla szkół: sprawdziany, egzaminy, PIN ucznia, panel nauczyciela, AI, raporty, cennik i bezpieczeństwo.",
      },
    ],
  }),
});
