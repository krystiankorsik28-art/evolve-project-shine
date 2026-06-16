import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../utils";

const variants = {
  default: "bg-surface text-muted-fg border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
};

const sizes = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  dot?: boolean;
  pulse?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", dot, pulse, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium rounded-full border",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {(dot || pulse) && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              variant === "default" && "bg-muted-fg",
              variant === "primary" && "bg-primary",
              variant === "success" && "bg-success",
              variant === "warning" && "bg-warning",
              variant === "danger" && "bg-danger",
              pulse && "animate-pulse"
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
