const registerPath = "/auth" + "#register";

export function EnterpriseAuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <a href={registerPath} className="hidden rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex">
        Rejestracja
      </a>
      <a href="/auth" className="rounded-full bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white">
        Logowanie
      </a>
    </div>
  );
}
