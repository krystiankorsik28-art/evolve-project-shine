"use client";
import { TextReveal } from "@/components/ui/TextReveal";

export function HeroTitle() {
  return (
    <div className="space-y-4">
      <div className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[0.9] tracking-tight">
        <TextReveal text="EduNex" stagger={0.04} />
      </div>
      <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-white/60 font-light leading-tight max-w-2xl">
        <TextReveal text="The Future of Education" delay={0.4} stagger={0.06} />
      </div>
    </div>
  );
}
