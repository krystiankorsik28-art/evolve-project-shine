import { createFileRoute } from "@tanstack/react-router";
import { PremiumLandingV2 } from "@/components/landing/PremiumLandingV2";

export const Route = createFileRoute("/")({
  component: PremiumLandingV2,
  head: () => ({
    meta: [
      { title: "EduNex — system egzaminacyjny, AI, E-dziennik i dokumenty szkoły" },
      {
        name: "description",
        content:
          "EduNex to nowoczesna platforma dla szkoły: egzaminy online, panel nauczyciela, PIN ucznia, AI Tutor, E-dziennik i Centrum dokumentów dla IOD.",
      },
    ],
  }),
});
