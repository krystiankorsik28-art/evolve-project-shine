import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/lib/theme";
import { ProductDemoSection } from "./ProductDemoSection";

export function LandingEnhancements() {
  const { theme } = useTheme();
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const target = document.getElementById("platforma");
    const parent = target?.parentElement;
    if (!target || !parent) return;

    const existing = document.querySelector<HTMLElement>("[data-edunex-product-demo]");
    if (existing) {
      setHost(existing);
      return;
    }

    const mount = document.createElement("div");
    mount.setAttribute("data-edunex-product-demo", "true");
    parent.insertBefore(mount, target);
    setHost(mount);

    return () => {
      mount.remove();
    };
  }, []);

  if (!host) return null;
  return createPortal(<ProductDemoSection isLight={theme === "light"} />, host);
}
