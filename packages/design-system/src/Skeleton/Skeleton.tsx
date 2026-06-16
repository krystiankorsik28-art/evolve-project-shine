import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect";
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-muted",
          variant === "text" && "h-4 rounded-md w-full",
          variant === "circle" && "rounded-full",
          variant === "rect" && "rounded-lg",
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";
