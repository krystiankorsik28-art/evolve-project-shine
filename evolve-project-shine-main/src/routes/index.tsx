import { createFileRoute } from "@tanstack/react-router";
import { PremiumLanding } from "@/components/landing/PremiumLanding";

export const Route = createFileRoute("/")({
  component: PremiumLanding,
  head: () => ({
    meta: [
      { title: "EduNex — egzaminy, NexAI, NexDziennik i cyfrowa szkoła" },
      {
        name: "description",
        content:
          "EduNex to nowoczesna platforma dla szkoły: egzaminy online, panel nauczyciela, PIN ucznia, NexAI, własny NexDziennik i publiczne Centrum Pomocy.",
      },
    ],
  }),
});
