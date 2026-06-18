"use client";
import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { tileEntry } from "../animations";

type TileSize = "1x1" | "2x1" | "2x2" | "3x1" | "3x2" | "4x2";
type TileVariant = "glass" | "neon" | "gradient";

interface TileProps {
  size?: TileSize;
  variant?: TileVariant;
  className?: string;
  children: ReactNode;
  index?: number;
}

const sizeStyles: Record<TileSize, string> = {
  "1x1": "col-span-1 row-span-1",
  "2x1": "col-span-2 row-span-1",
  "2x2": "col-span-2 row-span-2",
  "3x1": "col-span-3 row-span-1",
  "3x2": "col-span-3 row-span-2",
  "4x2": "col-span-4 row-span-2",
};

const variantStyles: Record<TileVariant, string> = {
  glass: "bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]",
  neon: "bg-black/40 backdrop-blur-xl border border-neon/15 shadow-[0_0_20px_oklch(0.85_0.18_160_/_0.15)]",
  gradient: "bg-gradient-to-br from-neon/5 to-transparent border border-neon/20",
};

export function Tile({ size = "1x1", variant = "glass", className = "", children, index = 0 }: TileProps) {
  return (
    <motion.div
      variants={tileEntry}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true }}
      custom={index}
      className={`relative rounded-xl p-5 flex flex-col overflow-hidden group cursor-default
        ${sizeStyles[size]} ${variantStyles[variant]}
        hover:border-neon/30 hover:shadow-[0_0_30px_oklch(0.85_0.18_160_/_0.2)]
        transition-all duration-300 ${className}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
        bg-[radial-gradient(ellipse_at_50%_0%,_oklch(0.85_0.18_160_/_0.08),_transparent_60%)]" />
      <div className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
        bg-gradient-to-b from-neon/10 to-transparent" style={{ mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "xor" }} />
      {children}
    </motion.div>
  );
}
