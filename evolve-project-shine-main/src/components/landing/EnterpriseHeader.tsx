import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function EnterpriseHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-[0_20px_80px_rgba(15,23,42,.08)] backdrop-blur-2xl">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#0f172a] text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">EduNex</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">education system</div>
          </div>
        </Link>
        <Link to="/auth" className="rounded-full bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white">
          Logowanie
        </Link>
      </nav>
    </header>
  );
}
