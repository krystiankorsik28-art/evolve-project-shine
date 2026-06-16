import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../utils";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label htmlFor={switchId} className="inline-flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div className={cn(
            "w-9 h-5 rounded-full bg-border transition-colors duration-200",
            "peer-checked:bg-accent",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50",
            "group-hover:bg-muted-fg/30 peer-checked:group-hover:bg-accent/80",
            "after:content-[''] after:absolute after:top-0.5 after:left-0.5",
            "after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-sm",
            "after:transition-transform after:duration-200",
            "peer-checked:after:translate-x-4"
          )} />
        </div>
        {label && <span className="text-sm text-fg select-none">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = "Switch";
