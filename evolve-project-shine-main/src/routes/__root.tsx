import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import ultraCss from "../ultra.css?url";
import teacherCompatCss from "../teacher-compat.css?url";
import nextGenerationCss from "../next-generation.css?url";
import identityInstitutionalCss from "../identity-institutional.css?url";
import institutionalLiquidGlassCss from "../institutional-liquid-glass.css?url";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RouteTransitionOverlay } from "@/components/RouteTransitionOverlay";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth/auth-context";

const themeBootScript = `(function(){try{var t=localStorage.getItem('edunex.theme');if(t!=='light'&&t!=='dark'&&t!=='system')t='system';var r=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;var d=document.documentElement;d.classList.remove('light','dark');d.classList.add(r);d.dataset.theme=t;d.dataset.resolvedTheme=r;d.style.colorScheme=r;}catch(e){}})();`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 text-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0067b8]">
          Błąd 404
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Nie znaleziono strony</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Adres może być nieaktualny albo strona została przeniesiona.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Wróć na stronę główną
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 text-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
          Błąd aplikacji
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Nie udało się załadować widoku
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Spróbuj ponownie. Jeżeli problem będzie się powtarzał, wróć do strony głównej.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#0067b8] px-4 text-sm font-semibold text-white transition hover:bg-[#005a9e]"
          >
            Spróbuj ponownie
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Strona główna
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EduNex - bezpieczna platforma egzaminacyjna z AI i monitoringiem" },
      {
        name: "description",
        content: "EduNex - bezpieczna platforma egzaminacyjna z AI, monitoringiem i e-dziennikiem.",
      },
      { name: "author", content: "EduNex" },
      {
        property: "og:title",
        content: "EduNex - bezpieczna platforma egzaminacyjna z AI i monitoringiem",
      },
      { property: "og:description", content: "Bezpieczne egzaminy online z AI i monitoringiem." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        type: "application/ld+json",
        content: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "EduNex",
              url: "https://edunex.pl",
              logo: "https://edunex.pl/favicon.svg",
              description:
                "Bezpieczna platforma egzaminacyjna z AI, monitoringiem i e-dziennikiem.",
            },
            {
              "@type": "WebSite",
              url: "https://edunex.pl",
              name: "EduNex",
              description: "Bezpieczne egzaminy online z AI i monitoringiem.",
              inLanguage: "pl",
            },
          ],
        }),
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: ultraCss },
      { rel: "stylesheet", href: teacherCompatCss },
      { rel: "stylesheet", href: nextGenerationCss },
      { rel: "stylesheet", href: identityInstitutionalCss },
      { rel: "stylesheet", href: institutionalLiquidGlassCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <div className="edunex-next-generation">
            <Outlet />
          </div>
          <RouteTransitionOverlay />
          <ConfirmDialog />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
