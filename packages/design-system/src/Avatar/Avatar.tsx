import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../utils";

const sizes = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
  xl: "w-12 h-12 text-base",
};

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: keyof typeof sizes;
  status?: "online" | "offline" | "away";
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, initials, size = "md", status, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative inline-flex flex-shrink-0", className)} {...props}>
        {src ? (
          <img
            src={src}
            alt={alt || ""}
            className={cn("rounded-full object-cover", sizes[size])}
          />
        ) : (
          <div
            className={cn(
              "rounded-full bg-surface border border-border flex items-center justify-center font-medium text-muted-fg",
              sizes[size]
            )}
          >
            {initials || "?"}
          </div>
        )}
        {status && (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg",
              status === "online" && "bg-success",
              status === "offline" && "bg-muted-fg",
              status === "away" && "bg-warning"
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
