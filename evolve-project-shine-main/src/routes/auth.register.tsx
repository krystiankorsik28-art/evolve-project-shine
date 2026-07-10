import { useState, type ComponentType, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Building2, CheckCircle2, GraduationCap, Loader2, School, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";

type RoleId = "student" | "parent" | "teacher" | "admin";

const roles: Array<{ id: RoleId; label: string; description: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "teacher", label: "Nauczyciel", description: "Konto do tworzenia egzaminów i pracy z klasami.", icon: Users },
  { id: "admin", label: "Dyrekcja / Admin", description: "Konto do zarządzania szkołą, rolami i licencją.", icon: Building2 },
  { id: "parent", label: "Rodzic", description: "Konto do podglądu postępów i komunikacji.", icon: School },
  { id: "student", label: "Uczeń", description: "Konto ucznia, jeśli szkoła korzysta z profili.", icon: GraduationCap },
];

export const Route = createFileRoute("/auth/register")({
  component: RegisterPanel,
  head: () => ({ meta: [{ title: "Rejestracja | EduNex" }] }),
});

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}{required && <span className="text-blue-800"> *</span>}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function RegisterPanel() {
  const navigate = useNavigate();
  const { signUpWithEmail } = useAuth();
  const [role, setRole] = useState<RoleId>("teacher");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [position, setPosition] = useState("");
  const [student, setStudent] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      return toast.error("Brakuje konfiguracji Supabase. Sprawdź VITE_SUPABASE_URL i VITE_SUPABASE_PUBLISHABLE_KEY.");
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !consent) {
      return toast.error("Uzupełnij wymagane pola i zgody");
    }
    if (password.length < 8) return toast.error("Hasło musi mieć minimum 8 znaków");
    if (password !== confirm) return toast.error("Hasła nie są takie same");

    setLoading(true);
    const { error } = await signUpWithEmail(email.trim(), password, role, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      school: school.trim(),
      position: position.trim(),
      student_name: student.trim(),
      student_class: studentClass.trim(),
    });
    setLoading(false);

    if (error) return toast.error(error);
    toast.success("Konto utworzone. Sprawdź e-mail.");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] px-5 py-8 text-slate-950">
      <Toaster position="top-center" theme="light" />
      <form onSubmit={submit} className="mx-auto grid max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.12)] lg:grid-cols-[0.85fr_1.15fr]">
        <motion.aside initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} className="hidden border-r border-slate-200 bg-slate-950 p-8 text-white lg:block">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white">
            <ShieldCheck className="h-4 w-4" />
            Portal EduNex
          </Link>
          <div className="mt-12 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold uppercase text-blue-100">
            Rejestracja
          </div>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02]">Utwórz konto w systemie szkoły.</h1>
          <p className="mt-5 text-sm leading-7 text-white/70">
            Formularz zbiera dane potrzebne do właściwego przypisania roli. Uprawnienia nauczyciela i administratora mogą wymagać zatwierdzenia przez placówkę.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/75">
            {["Role użytkowników", "Zgody i dokumenty", "Supabase Auth", "Przygotowane pod SSO"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-200" />
                {item}
              </div>
            ))}
          </div>
        </motion.aside>

        <main className="p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-blue-800">Rejestracja</div>
              <h2 className="mt-2 text-2xl font-semibold">Dane konta</h2>
            </div>
            <Link to="/auth" className="text-sm font-semibold text-blue-800 hover:text-blue-950">Mam konto</Link>
          </div>
          {!isSupabaseConfigured && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Lokalna konfiguracja Supabase nie jest aktywna. Rejestracja wymaga pliku `.env.local` albo zmiennych Vercel.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((item) => {
              const Icon = item.icon;
              const selected = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`rounded-lg border p-4 text-left transition ${selected ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  <Icon className={`mb-3 h-5 w-5 ${selected ? "text-blue-900" : "text-slate-600"}`} />
                  <div className="text-sm font-semibold text-slate-950">{item.label}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{item.description}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-7 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Imię" value={firstName} onChange={setFirstName} placeholder="Anna" required />
              <Input label="Nazwisko" value={lastName} onChange={setLastName} placeholder="Nowak" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Adres e-mail" type="email" value={email} onChange={setEmail} placeholder="anna.nowak@szkola.pl" required />
              <Input label="Telefon" value={phone} onChange={setPhone} placeholder="+48 000 000 000" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Szkoła / placówka" value={school} onChange={setSchool} placeholder="Nazwa placówki" />
              <Input label="Stanowisko / klasa" value={position} onChange={setPosition} placeholder="Nauczyciel, dyrektor, klasa 2A" />
            </div>
            {(role === "parent" || role === "student") && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Dane dziecka / ucznia" value={student} onChange={setStudent} placeholder="Imię i nazwisko ucznia" />
                <Input label="Klasa ucznia" value={studentClass} onChange={setStudentClass} placeholder="np. 2A" />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Hasło" type="password" value={password} onChange={setPassword} placeholder="Minimum 8 znaków" required />
              <Input label="Powtórz hasło" type="password" value={confirm} onChange={setConfirm} placeholder="Powtórz hasło" required />
            </div>
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-800" />
              <span>
                Akceptuję regulamin, politykę prywatności i zasady przetwarzania danych osobowych w EduNex.
              </span>
            </label>
            <button disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Utwórz konto"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </main>
      </form>
    </div>
  );
}
