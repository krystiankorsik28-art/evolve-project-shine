import { GraduationCap } from "lucide-react";

export function Logo({ size = "md", variant = "default" }: { size?: "sm" | "md" | "lg" | "xl"; variant?: "default" | "light" }) {
  const sizes = {
    sm: { icon: "h-6 w-6", text: "text-lg", subtext: "text-[10px]" },
    md: { icon: "h-8 w-8", text: "text-xl", subtext: "text-xs" },
    lg: { icon: "h-10 w-10", text: "text-2xl", subtext: "text-sm" },
    xl: { icon: "h-14 w-14", text: "text-4xl", subtext: "text-base" },
  };
  const s = sizes[size];
  const textColor = variant === "light" ? "text-primary-foreground" : "text-foreground";
  const subColor = variant === "light" ? "text-primary-foreground/70" : "text-muted-foreground";

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-gold rounded-lg blur-md opacity-60" />
        <div className="relative bg-gradient-gold rounded-lg p-2 shadow-gold">
          <GraduationCap className={`${s.icon} text-primary-deep`} strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold ${s.text} ${textColor} tracking-tight`}>
          EduNex<span className="text-accent">.pl</span>
        </span>
        <span className={`${s.subtext} ${subColor} uppercase tracking-[0.2em] font-medium mt-0.5`}>
          Państwowa platforma edukacyjna
        </span>
      </div>
    </div>
  );
}
