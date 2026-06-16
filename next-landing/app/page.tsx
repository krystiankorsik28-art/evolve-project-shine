"use client";
import { NavBar } from "@/components/sections/NavBar";
import { Hero } from "@/components/sections/Hero";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { SocialProof } from "@/components/sections/SocialProof";
import { AIFeatures } from "@/components/sections/AIFeatures";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { Security } from "@/components/sections/Security";
import { Integrations } from "@/components/sections/Integrations";
import { FAQSection } from "@/components/sections/FAQ";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <NavBar />
      <Hero />
      <ProblemSolution />
      <SocialProof />
      <AIFeatures />
      <HowItWorks />
      <Pricing />
      <Security />
      <Integrations />
      <FAQSection />
      <BlogPreview />
      <FinalCTA />
      <Footer />
    </main>
  );
}
