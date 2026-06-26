import { createFileRoute } from "@tanstack/react-router";
import { PremiumLanding } from "@/components/landing/PremiumLanding";

export const Route = createFileRoute("/")({
  component: PremiumLanding,
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
