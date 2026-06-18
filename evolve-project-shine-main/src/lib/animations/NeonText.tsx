"use client";
import { type ReactNode } from "react";

type NeonColor = "teal" | "blue" | "purple" | "pink";

const colorStyles: Record<NeonColor, string> = {
  teal: "text-neon [text-shadow:0_0_10px_oklch(0.85_0.18_160_/_0.5),0_0_20px_oklch(0.85_0.18_160_/_0.3)]",
  blue: "text-neon-blue [text-shadow:0_0_10px_oklch(0.70_0.20_240_/_0.5),0_0_20px_oklch(0.70_0.20_240_/_0.3)]",
  purple: "text-neon-purple [text-shadow:0_0_10px_oklch(0.65_0.25_290_/_0.5),0_0_20px_oklch(0.65_0.25_290_/_0.3)]",
  pink: "text-neon-pink [text-shadow:0_0_10px_oklch(0.75_0.22_330_/_0.5),0_0_20px_oklch(0.75_0.22_330_/_0.3)]",
};

export function NeonText({ color = "teal", className = "", children, as: Tag = "span", pulse = false }: { color?: NeonColor; className?: string; children: ReactNode; as?: "span" | "h1" | "h2" | "h3" | "p" | "div"; pulse?: boolean }) {
  return (
    <Tag className={`${colorStyles[color]} ${pulse ? "animate-pulse" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
