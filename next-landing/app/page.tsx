"use client";
import { NavBar } from "@/components/hero/NavBar";
import { Hero } from "@/components/hero/Hero";
import { BentoFeatures } from "@/components/features/BentoFeatures";
import { AiDemo } from "@/components/ai/AiDemo";
import { Testimonials } from "@/components/testimonials/Testimonials";
import { Pricing } from "@/components/pricing/Pricing";
import { FAQSection } from "@/components/faq/FAQ";
import { CtaFooter } from "@/components/cta/CtaFooter";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { useReducedMotion } from "framer-motion";

export default function Home() {
  useReducedMotion();

  return (
    <main className="relative">
      <ScrollProgress />
      <NavBar />
      <Hero />
      <BentoFeatures />
      <AiDemo />
      <Testimonials />
      <Pricing />
      <FAQSection />
      <CtaFooter />
    </main>
  );
}
