"use client";
import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { pageTransition } from "./variants";

export function PageTransition({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className={className}>
      {children}
    </motion.div>
  );
}
