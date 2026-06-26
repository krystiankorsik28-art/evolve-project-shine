import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/lib/theme";
import { AIShowcaseSection } from "./AIShowcaseSection";
import { EnterpriseTrustSection } from "./EnterpriseTrustSection";
import { ProductDemoSection } from "./ProductDemoSection";

type Mounts = {
  product: HTMLElement | null;
  ai: HTMLElement | null;
  enterprise: HTMLElement | null;
};

export function LandingEnhancements() {
  const { theme } = useTheme();
  const [mounts, setMounts] = useState<Mounts>({ product: null, ai: null, enterprise: null });

  useEffect(() => {
    const created: HTMLElement[] = [];

    const ensureMount = (selector: string, attr: string, position: "before" | "after") => {
      const target = document.querySelector<HTMLElement>(selector);
      const parent = target?.parentElement;
      if (!target || !parent) return null;

      const existing = document.querySelector<HTMLElement>(`[${attr}]`);
      if (existing) return existing;

      const mount = document.createElement("div");
      mount.setAttribute(attr, "true");
      if (position === "before") parent.insertBefore(mount, target);
      else parent.insertBefore(mount, target.nextSibling);
      created.push(mount);
      return mount;
    };

    const product = ensureMount("#platforma", "data-edunex-product-demo", "before");
    const ai = ensureMount("#ai", "data-edunex-ai-showcase", "after");
    const enterprise = ensureMount("#bezpieczenstwo", "data-edunex-enterprise-trust", "after");

    setMounts({ product, ai, enterprise });

    return () => {
      created.forEach((node) => node.remove());
    };
  }, []);

  return (
    <>
      {mounts.product && createPortal(<ProductDemoSection isLight={theme === "light"} />, mounts.product)}
      {mounts.ai && createPortal(<AIShowcaseSection isLight={theme === "light"} />, mounts.ai)}
      {mounts.enterprise && createPortal(<EnterpriseTrustSection isLight={theme === "light"} />, mounts.enterprise)}
    </>
  );
}
