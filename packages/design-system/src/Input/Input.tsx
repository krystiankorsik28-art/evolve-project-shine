import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, icon, suffix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-muted-fg">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-lg bg-surface border border-border text-fg placeholder:text-muted-fg/50",
              "transition-all duration-200",
              "focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && "pl-10",
              suffix && "pr-10",
              error && "border-danger/50 focus:border-danger focus:ring-danger/20",
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {helper && !error && <p className="text-xs text-muted-fg">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
