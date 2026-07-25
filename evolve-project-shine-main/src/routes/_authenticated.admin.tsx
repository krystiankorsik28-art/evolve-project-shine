import { useEffect, useMemo, useState, type ComponentType } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileText,
  KeyRound,
  Loader2,
  LogOut,
  MailCheck,
  Search,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserDisplayName } from "@/lib/auth/user-display-name";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPanel,
  head: () => ({ meta: [{ title: "Konsola administratora | EduNex" }] }),
});

type PendingTeacher = {
  id: string;
  user_id: string;
  role: string;
  approval_status: string;
  created_at: string;
};

type SystemMetric = {
  id: string;
  label: string;
  value: string;
  note: string;
  icon: ComponentType<{ className?: string }>;
  tone: "blue" | "emerald" | "amber" | "slate";
};

const governanceItems = [
  "Weryfikacja kont nauczycieli przed dostępem do danych uczniów",
  "Oddzielne ścieżki dla szkoły, dyrekcji, nauczycieli i uczniów",
  "Dokumenty RODO i regulaminy dostępne publicznie w /dokumenty",
  "Zdarzenia administracyjne gotowe do spięcia z dziennikiem audytu",
];

function AdminPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Administratorze");
  const [pending, setPending] = useState<PendingTeacher[]>([]);
  const [stats, setStats] = useState({ exams: 0, attempts: 0, messages: 0 });
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/auth/admin" });
        return;
      }

      const [{ data: profile }, { data: roles }, { count: examCount }, { count: attemptCount }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("display_name,first_name,last_name")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("user_roles")
            .select("id,user_id,role,approval_status,created_at")
            .eq("approval_status", "pending"),
          supabase.from("exams").select("*", { count: "exact", head: true }),
          supabase.from("attempts").select("*", { count: "exact", head: true }),
        ]);

      if (!active) return;
      setDisplayName(
        resolveUserDisplayName({ profile, metadata: user.user_metadata, role: "admin" }),
      );
      setPending((roles ?? []) as PendingTeacher[]);
      setStats({ exams: examCount ?? 0, attempts: attemptCount ?? 0, messages: 0 });
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  const filteredPending = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return pending;
    return pending.filter(
      (item) =>
        item.user_id.toLowerCase().includes(term) ||
        item.role.toLowerCase().includes(term) ||
        item.approval_status.toLowerCase().includes(term),
    );
  }, [pending, query]);

  const metrics: SystemMetric[] = [
    {
      id: "pending",
      label: "Oczekujące konta",
      value: String(pending.length),
      note: "Do decyzji administratora",
      icon: UserCheck,
      tone: pending.length ? "amber" : "emerald",
    },
    {
      id: "exams",
      label: "Egzaminy w systemie",
      value: String(stats.exams),
      note: "Aktywne i archiwalne",
      icon: FileText,
      tone: "blue",
    },
    {
      id: "attempts",
      label: "Podejścia uczniów",
      value: String(stats.attempts),
      note: "Zarejestrowane wyniki",
      icon: Activity,
      tone: "emerald",
    },
    {
      id: "compliance",
      label: "Status zgodności",
      value: "RODO",
      note: "Dokumenty dostępne publicznie",
      icon: Shield,
      tone: "slate",
    },
  ];

  const decide = async (id: string, approve: boolean) => {
    const { error } = await supabase
      .from("user_roles")
      .update({
        approval_status: approve ? "approved" : "rejected",
        approved_at: approve ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setPending((items) => items.filter((item) => item.id !== id));
    toast.success(approve ? "Konto nauczyciela zostało zatwierdzone" : "Wniosek został odrzucony");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="edunex-next-gen-panel min-h-screen bg-slate-50 text-slate-900 grid place-items-center">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
          <span className="text-sm font-medium">Ładowanie konsoli administratora...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="edunex-next-gen-panel edunex-admin-workspace min-h-screen bg-[#f6f8fb] text-slate-950">
      <Toaster richColors />
      <header className="workspace-topbar sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">EduNex Workspace</div>
              <div className="text-xs text-slate-500">Konsola szkoły</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:flex">
              <MailCheck className="h-3.5 w-3.5 text-blue-700" />
              {displayName}
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      <main className="workspace-main mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="workspace-hero admin-hero overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-950 px-6 py-7 text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/75">
                <Sparkles className="h-3.5 w-3.5" />
                Instytucjonalny nadzór platformy
              </div>
              <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  Konsola administracyjna EduNex
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Zarządzaj dostępem nauczycieli, kontroluj aktywność egzaminacyjną i utrzymuj
                  standard bezpieczeństwa danych w jednej, spokojnej konsoli.
                </p>
              </div>
            </div>
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <MetricTile key={metric.id} metric={metric} />
              ))}
            </div>
          </div>

          <aside className="workspace-status-card rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">Gotowość operacyjna</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Podstawowe punkty kontroli dla wdrożenia szkolnego.
                </p>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <BadgeCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {governanceItems.map((item) => (
                <div key={item} className="flex gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="workspace-panel rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Wnioski nauczycieli</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Zatwierdź tylko zweryfikowane konta powiązane ze szkołą.
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:w-72">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Szukaj po identyfikatorze"
                />
              </div>
            </div>

            {filteredPending.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-950">
                  Brak oczekujących wniosków
                </h3>
                <p className="mt-1 text-sm text-slate-500">Kolejka weryfikacji jest czysta.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredPending.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-4 px-5 py-4 transition hover:bg-slate-50/80 md:grid-cols-[1fr_auto] md:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                          {item.user_id}
                        </span>
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                          {item.role}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Wniosek utworzony: {new Date(item.created_at).toLocaleString("pl-PL")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => decide(item.id, true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Zatwierdź
                      </button>
                      <button
                        onClick={() => decide(item.id, false)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Odrzuć
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-950">Skróty administracyjne</h2>
              <div className="mt-4 space-y-2">
                <QuickLink icon={FileText} label="Dokumenty i RODO" to="/dokumenty" />
                <QuickLink icon={Database} label="Rejestr egzaminów" to="/teacher" />
                <QuickLink icon={Building2} label="Widok platformy" to="/" />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-700">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">Zasada dostępu</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Panel administracyjny nie nadaje uprawnień automatycznie. Każda decyzja zmienia
                    status w istniejącej tabeli ról.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricTile({ metric }: { metric: SystemMetric }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  }[metric.tone];

  return (
    <div className="bg-white p-5">
      <div className={`mb-4 grid h-9 w-9 place-items-center rounded-lg ${toneClass}`}>
        <metric.icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-semibold text-slate-950">{metric.value}</div>
      <div className="mt-1 text-sm font-medium text-slate-700">{metric.label}</div>
      <div className="mt-1 text-xs text-slate-500">{metric.note}</div>
    </div>
  );
}

function QuickLink({
  icon: Icon,
  label,
  to,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500" />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-slate-400" />
    </Link>
  );
}
