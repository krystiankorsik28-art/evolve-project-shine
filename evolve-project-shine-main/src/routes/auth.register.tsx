import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Building2, GraduationCap, School, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/auth/register")({ component: RegisterPanel });

const roles = [
  ["student", "Uczeń", GraduationCap],
  ["parent", "Rodzic", School],
  ["teacher", "Nauczyciel", Users],
  ["admin", "Administrator", Building2],
] as const;

function RegisterPanel() {
  const navigate = useNavigate();
  const { signUpWithEmail } = useAuth();
  const [role, setRole] = useState("parent");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [student, setStudent] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!firstName || !lastName || !email || !password || !consent) return toast.error("Uzupełnij wymagane pola i zgody");
    if (password.length < 8) return toast.error("Hasło musi mieć minimum 8 znaków");
    if (password !== confirm) return toast.error("Hasła nie są takie same");
    setLoading(true);
    const { error } = await signUpWithEmail(email, password, role, { first_name: firstName, last_name: lastName, phone, school, student_name: student, student_class: studentClass });
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Konto utworzone. Sprawdź e-mail.");
    navigate({ to: "/auth", replace: true });
  };

  return <div className="min-h-screen bg-[#030712] px-4 py-8 text-white"><Toaster position="top-center" theme="dark" /><form onSubmit={submit} className="mx-auto grid max-w-6xl overflow-hidden rounded-[30px] border border-white/12 bg-[#07111f]/90 shadow-[0_32px_110px_rgba(0,0,0,.55)] backdrop-blur-xl lg:grid-cols-[.85fr_1.15fr]"><aside className="hidden bg-[#0f172a] p-10 lg:block"><Link to="/" className="text-sm font-semibold text-white/70">← Strona główna</Link><div className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-[#bfe7ff]"><ShieldCheck className="h-3.5 w-3.5" /> Pełna rejestracja</div><h1 className="mt-5 text-5xl font-semibold tracking-[-.055em]">Utwórz konto EduNex.</h1><p className="mt-5 text-base leading-7 text-white/65">Wybierz rolę i wypełnij pełny formularz. Ten panel jest częścią systemu logowania, nie osobną prostą stroną.</p></aside><main className="p-6 sm:p-10"><div className="mb-6 flex items-center justify-between"><Link to="/auth" className="text-sm font-semibold text-white/65">Masz konto? Logowanie</Link></div><div className="grid gap-3 sm:grid-cols-4">{roles.map(([id,label,Icon]) => <button key={id} type="button" onClick={() => setRole(id)} className={`rounded-2xl border p-4 text-left text-sm font-semibold transition ${role === id ? "border-[#50e6ff]/60 bg-[#0078d4]/20 text-white" : "border-white/12 bg-white/[.05] text-white/60 hover:text-white"}`}><Icon className="mb-3 h-5 w-5" />{label}</button>)}</div><div className="mt-7 grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><Input label="Imię" value={firstName} onChange={setFirstName} /><Input label="Nazwisko" value={lastName} onChange={setLastName} /></div><div className="grid gap-4 sm:grid-cols-2"><Input label="Adres e-mail" type="email" value={email} onChange={setEmail} /><Input label="Telefon" value={phone} onChange={setPhone} /></div><div className="grid gap-4 sm:grid-cols-2"><Input label="Szkoła / placówka" value={school} onChange={setSchool} /><Input label="Klasa / stanowisko" value={studentClass} onChange={setStudentClass} /></div><Input label="Dane dziecka / ucznia" value={student} onChange={setStudent} /><div className="grid gap-4 sm:grid-cols-2"><Input label="Hasło" type="password" value={password} onChange={setPassword} /><Input label="Powtórz hasło" type="password" value={confirm} onChange={setConfirm} /></div><label className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/[.05] p-4 text-sm text-white/65"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" /> Akceptuję regulamin, politykę prywatności i zasady przetwarzania danych.</label><button disabled={loading} className="inline-flex items-center justify-center rounded-full bg-[#0078d4] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Tworzenie konta..." : "Utwórz konto"}<ArrowRight className="ml-2 h-4 w-4" /></button></div></main></form></div>;
}

function Input({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-sm font-semibold text-white/75"><span>{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-12 rounded-2xl border border-white/12 bg-white/[.055] px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#50e6ff]/70" /></label>;
}
