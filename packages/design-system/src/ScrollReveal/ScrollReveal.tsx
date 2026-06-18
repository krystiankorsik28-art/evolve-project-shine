"use client";
import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { slideUp, fadeIn, scaleIn, slideLeft, slideRight, tiltIn, staggerContainer } from "../animations";

type VariantName = "slideUp" | "fadeIn" | "scaleIn" | "slideLeft" | "slideRight" | "tiltIn" | "stagger";

interface ScrollRevealProps {
  variant?: VariantName;
  delay?: number;
  className?: string;
  children: ReactNode;
  once?: boolean;
  margin?: string;
}

const variants = { slideUp, fadeIn, scaleIn, slideLeft, slideRight, tiltIn, stagger: staggerContainer };

export function ScrollReveal({ variant = "slideUp", delay = 0, className = "", children, once = true, margin = "-80px" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin });

  return (
    <motion.div
      ref={ref}
      variants={variants[variant]}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
