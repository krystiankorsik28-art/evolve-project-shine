export const tokens = {
  color: {
    accent: {
      DEFAULT: "oklch(0.82 0.12 200)",
      hover: "oklch(0.88 0.10 200)",
      muted: "oklch(0.82 0.12 200 / 0.15)",
      subtle: "oklch(0.82 0.12 200 / 0.06)",
    },
    semantic: {
      success: "oklch(0.72 0.18 160)",
      error: "oklch(0.70 0.20 30)",
      warning: "oklch(0.78 0.18 85)",
      info: "oklch(0.65 0.15 240)",
    },
    neutral: {
      50: "oklch(0.98 0 0)",
      100: "oklch(0.94 0.01 260)",
      200: "oklch(0.88 0.02 260)",
      300: "oklch(0.78 0.03 260)",
      400: "oklch(0.68 0.04 260)",
      500: "oklch(0.55 0.04 260)",
      600: "oklch(0.42 0.04 260)",
      700: "oklch(0.28 0.04 260)",
      800: "oklch(0.18 0.03 260)",
      900: "oklch(0.12 0.03 260)",
      950: "oklch(0.06 0.04 260)",
    },
    surface: {
      dark: "oklch(0.06 0.04 260)",
      elevated: "oklch(0.09 0.03 260)",
      card: "oklch(0.12 0.03 260)",
      light: "oklch(0.97 0.01 260)",
      "light-elevated": "oklch(0.95 0.01 260)",
      "light-card": "oklch(1 0 0)",
    },
  },
  typography: {
    hero: { size: "clamp(3rem, 5vw, 5rem)", lineHeight: "0.92", weight: "700", letterSpacing: "-0.05em" },
    h1: { size: "clamp(2rem, 3vw, 3rem)", lineHeight: "1.05", weight: "600", letterSpacing: "-0.04em" },
    h2: { size: "clamp(1.5rem, 2vw, 2rem)", lineHeight: "1.1", weight: "600", letterSpacing: "-0.03em" },
    h3: { size: "clamp(1.2rem, 1.5vw, 1.5rem)", lineHeight: "1.2", weight: "600", letterSpacing: "-0.02em" },
    body: { size: "1rem", lineHeight: "1.7", weight: "400" },
    sm: { size: "0.875rem", lineHeight: "1.6", weight: "400" },
    xs: { size: "0.75rem", lineHeight: "1.5", weight: "400" },
    label: { size: "0.7rem", lineHeight: "1", weight: "500", letterSpacing: "0.12em", textTransform: "uppercase" },
  },
  spacing: {
    0: "0px", 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px",
    6: "24px", 8: "32px", 10: "40px", 12: "48px", 16: "64px",
    20: "80px", 24: "96px", 28: "112px", 32: "128px",
  },
  radius: {
    sm: "6px", md: "10px", lg: "16px", xl: "24px", full: "9999px",
  },
  animation: {
    spring: "cubic-bezier(0.16, 1, 0.3, 1)",
    ease: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export type Token = typeof tokens;
