import { createFileRoute } from "@tanstack/react-router";
import { PremiumLanding } from "@/components/landing/PremiumLanding";

export const Route = createFileRoute("/")({
  component: PremiumLanding,
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
