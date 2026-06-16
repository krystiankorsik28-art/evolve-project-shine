import type { Metadata } from "next";
import "./globals.css";
import { MotionProvider as Providers } from "./providers";

export const metadata: Metadata = {
  title: "EduNex — AI-Powered Education Platform",
  description:
    "EduNex — the next-generation education platform. AI exam generation, smart tutoring, real-time analytics, and certification for schools, teachers, and students.",
  openGraph: {
    title: "EduNex — AI-Powered Education Platform",
    description: "Generate exams, tutor with AI, track progress. One platform for the entire school ecosystem.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
