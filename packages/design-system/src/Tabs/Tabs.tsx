import { useState, type ReactNode } from "react";
import { cn } from "../utils";

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: Tab[];
  activeId?: string;
  onChange?: (id: string) => void;
  variant?: "underline" | "pills";
  className?: string;
}

export function Tabs({ tabs, activeId, onChange, variant = "underline", className }: TabsProps) {
  const [internal, setInternal] = useState(tabs[0]?.id);
  const active = activeId ?? internal;

  const handleChange = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };

  return (
    <div className={cn("flex", variant === "underline" ? "border-b border-border gap-0" : "gap-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          className={cn(
            "relative flex items-center gap-2 whitespace-nowrap font-medium transition-all duration-200",
            variant === "underline" && [
              "px-4 py-3 text-sm border-b-2 border-transparent -mb-px",
              active === tab.id
                ? "text-fg border-accent"
                : "text-muted-fg hover:text-fg hover:border-border",
            ],
            variant === "pills" && [
              "px-4 py-2 text-sm rounded-lg",
              active === tab.id
                ? "bg-surface text-fg border border-border shadow-sm"
                : "text-muted-fg hover:text-fg hover:bg-muted",
            ]
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge != null && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-primary/10 text-primary">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
