"use client";
import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/dashboard/GlassPanel";

type TileSize = "1x1" | "2x1" | "1x2" | "2x2" | "3x2" | "4x2";
type TileVariant = "default" | "neon" | "chart" | "action";

interface TileProps {
  size?: TileSize;
  variant?: TileVariant;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const sizeMap: Record<TileSize, string> = {
  "1x1": "col-span-1 row-span-1",
  "2x1": "col-span-2 row-span-1",
  "1x2": "col-span-1 row-span-2",
  "2x2": "col-span-2 row-span-2",
  "3x2": "col-span-3 row-span-2",
  "4x2": "col-span-4 row-span-2",
};

const variantStyles: Record<TileVariant, string> = {
  default: "border-white/[0.06]",
  neon: "border-neon/15 bg-neon/[0.02]",
  chart: "border-white/[0.06]",
  action: "border-neon/20 bg-neon/[0.03] hover:bg-neon/[0.06] cursor-pointer",
};

export function Tile({ size = "1x1", variant = "default", children, className = "", onClick }: TileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${sizeMap[size]} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
    >
      <GlassPanel variant={variant === "neon" ? "neon" : "card"} className="h-full p-4">
        {children}
      </GlassPanel>
    </motion.div>
  );
}

export function TileGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-4 gap-3 auto-rows-min ${className}`}>
      {children}
    </div>
  );
}
