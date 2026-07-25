import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalLanding } from "@/components/landing/InstitutionalLanding";

export const Route = createFileRoute("/")({
  component: InstitutionalLanding,
  head: () => ({
    meta: [
      { title: "EduNex — bezpieczne egzaminy i cyfrowa organizacja szkoły" },
      {
        name: "description",
        content:
          "EduNex łączy egzaminy online, sesje PIN, raporty, panele użytkowników i administrację w jednym systemie projektowanym dla polskiej edukacji.",
      },
    ],
  }),
});
