import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "../utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={cn(
          "relative w-full bg-surface border border-border rounded-xl shadow-lg",
          "animate-in fade-in zoom-in-95 duration-200 ease-spring",
          sizeClasses[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-fg">{title}</h2>
              {description && <p className="text-sm text-muted-fg mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-muted-fg hover:text-fg transition-colors p-1 rounded-md hover:bg-muted"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        {children && <div className="px-6 py-2">{children}</div>}
        {footer && <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-4">{footer}</div>}
      </div>
    </div>
  );
}
