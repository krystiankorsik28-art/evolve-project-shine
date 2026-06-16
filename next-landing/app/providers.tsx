"use client";
import { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

export function MotionProvider({ children }: { children: ReactNode }) {
  useReducedMotion();
  return <>{children}</>;
}
