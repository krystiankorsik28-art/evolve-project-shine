import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../utils";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
}

const variantColors = {
  default: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const sizeHeights = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, variant = "default", size = "md", label, showValue, ...props }, ref) => {
    const pct = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className="flex flex-col gap-1.5">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && <span className="text-xs text-muted-fg">{label}</span>}
            {showValue && <span className="text-xs text-muted-fg font-mono">{Math.round(pct)}%</span>}
          </div>
        )}
        <div
          ref={ref}
          className={cn("w-full bg-muted rounded-full overflow-hidden", sizeHeights[size], className)}
          {...props}
        >
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-spring", variantColors[variant])}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";
