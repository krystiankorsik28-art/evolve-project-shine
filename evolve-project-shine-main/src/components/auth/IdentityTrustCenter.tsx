import {
  BadgeCheck,
  Building2,
  Fingerprint,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

type IdentityTrustCenterProps = {
  mode: "login" | "register";
  className?: string;
};

type TrustItem = {
  icon: LucideIcon;
  label: string;
  description: string;
};

const trustItems: Record<IdentityTrustCenterProps["mode"], TrustItem[]> = {
  login: [
    {
      icon: BadgeCheck,
      label: "Weryfikacja roli",
      description: "Właściwy panel otwiera się dopiero po potwierdzeniu uprawnień konta.",
    },
    {
      icon: Fingerprint,
      label: "Dostęp wielokanałowy",
      description: "Konto EduNex, kod egzaminu albo SSO szkoły — zależnie od roli.",
    },
    {
      icon: LockKeyhole,
      label: "Izolacja danych",
      description: "Dostęp respektuje reguły RLS oraz zakres przypisany użytkownikowi.",
    },
    {
      icon: KeyRound,
      label: "Odzyskiwanie dostępu",
      description: "Reset hasła jest kierowany wyłącznie na zweryfikowany adres konta.",
    },
  ],
  register: [
    {
      icon: BadgeCheck,
      label: "Potwierdzona tożsamość",
      description: "Imię, nazwisko i dane kontaktowe tworzą jednoznaczny profil użytkownika.",
    },
    {
      icon: Building2,
      label: "Powiązanie z placówką",
      description: "Szkoła, klasa lub kod zaproszenia ustalają właściwy kontekst dostępu.",
    },
    {
      icon: ShieldCheck,
      label: "Akceptacja uprawnień",
      description: "Wybrana rola składa wniosek — dostęp aktywuje uprawniona placówka.",
    },
    {
      icon: LockKeyhole,
      label: "Bezpieczny start",
      description: "Silne hasło, wymagane zgody i kontrola danych przed utworzeniem konta.",
    },
  ],
};

export function IdentityTrustCenter({ mode, className = "" }: IdentityTrustCenterProps) {
  const isLogin = mode === "login";
  const headingId = `identity-trust-center-${mode}`;

  return (
    <section
      aria-labelledby={headingId}
      className={`border-t border-slate-200 bg-slate-50/80 px-5 py-6 sm:px-8 lg:px-10 ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#0067b8]">
            <ShieldCheck className="h-4 w-4" />
            Centrum zaufania EduNex
          </div>
          <h3
            id={headingId}
            className="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-950"
          >
            {isLogin
              ? "Ochrona od logowania do właściwego panelu"
              : "Kontrolowany proces tworzenia konta"}
          </h3>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          <Link to="/dokumenty" className="text-[#0067b8] transition hover:text-[#004f8b]">
            Dokumenty i RODO
          </Link>
          <Link
            to="/pomoc"
            className="inline-flex items-center gap-1.5 text-slate-600 transition hover:text-slate-950"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            Pomoc z dostępem
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {trustItems[mode].map(({ icon: Icon, label, description }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0067b8]/10 text-[#0067b8]">
              <Icon className="h-[17px] w-[17px]" />
            </span>
            <div className="mt-3 text-sm font-semibold text-slate-950">{label}</div>
            <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
