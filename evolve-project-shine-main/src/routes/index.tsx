import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseLanding } from "@/components/landing/EnterpriseLanding";
import { EnterpriseMotionLayer } from "@/components/landing/EnterpriseMotionLayer";

function HomePage() {
  return (
    <>
      <EnterpriseMotionLayer />
      <EnterpriseLanding />
    </>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
