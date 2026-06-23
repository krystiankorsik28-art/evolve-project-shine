"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { NavBar } from "@/components/sections/NavBar";
import { Hero } from "@/components/sections/Hero";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { SocialProof } from "@/components/sections/SocialProof";
import { AIFeatures } from "@/components/sections/AIFeatures";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { PricingExpanded } from "@/components/sections/PricingExpanded";
import { DemoQuiz } from "@/components/sections/DemoQuiz";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { UseCasesSection } from "@/components/sections/UseCasesSection";
import { QuickStartSection } from "@/components/sections/QuickStartSection";
import { Security } from "@/components/sections/Security";
import { Integrations } from "@/components/sections/Integrations";
import { FAQSection } from "@/components/sections/FAQ";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";

const EntryScene = dynamic(() => import("@/components/three/EntryScene").then((m) => ({ default: m.EntryScene })), { ssr: false });

export default function Home() {
  const [showEntry, setShowEntry] = useState(true);

  return (
    <>
      {showEntry && <EntryScene onComplete={() => setShowEntry(false)} />}
      <main style={{ opacity: showEntry ? 0 : 1, transition: "opacity 0.8s ease-in" }}>
        <NavBar />
        <Hero />
        <ProblemSolution />
        <SocialProof />
        <AIFeatures />
        <UseCasesSection />
        <HowItWorks />
        <QuickStartSection />
        <DemoQuiz />
        <TestimonialsSection />
        <PricingExpanded />
        <Security />
        <Integrations />
        <FAQSection />
        <BlogPreview />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
