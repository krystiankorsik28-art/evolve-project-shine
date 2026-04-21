import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  first_name: z.string().trim().min(2, "Imię musi mieć min. 2 znaki").max(50, "Imię max 50 znaków"),
  last_name: z.string().trim().min(2, "Nazwisko musi mieć min. 2 znaki").max(50, "Nazwisko max 50 znaków"),
  email: z.string().trim().email("Nieprawidłowy email").max(255),
  password: z.string().min(8, "Hasło min. 8 znaków").max(128),
  school: z.string().trim().max(150).optional(),
  subject: z.string().trim().max(100).optional(),
  terms: z.literal(true, { errorMap: () => ({ message: "Musisz zaakceptować regulamin" }) }),
});

export default function RegisterTeacher() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "",
    school: "", subject: "",
  });
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, terms });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/teacher/pending`,
          data: {
            first_name: parsed.data.first_name,
            last_name: parsed.data.last_name,
            display_name: `${parsed.data.first_name} ${parsed.data.last_name}`,
            role: "teacher",
            school: parsed.data.school ?? "",
            subject: parsed.data.subject ?? "",
          },
        },
      });
      if (error) throw error;
      await logAudit("teacher_registration_pending", { resource_type: "auth", metadata: { email: parsed.data.email } });
      toast.success("Konto utworzone! Oczekuje na akceptację administratora.");
      navigate("/auth/teacher");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Błąd rejestracji";
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("user already")) {
        toast.error("Konto z tym emailem już istnieje. Zaloguj się.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Dołącz do społeczności nauczycieli"
      subtitle="Załóż konto i twórz nowoczesne egzaminy z pomocą sztucznej inteligencji. Po rejestracji administrator zatwierdzi Twoje konto w ciągu 24 godzin."
      icon={Users}
      accent="gold"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold mb-1">Rejestracja nauczyciela</h2>
          <p className="text-sm text-muted-foreground">Wypełnij formularz, aby założyć konto</p>
        </div>

        <div className="bg-accent-soft/40 border border-accent/20 rounded-lg p-3 flex gap-2">
          <ShieldCheck className="h-4 w-4 text-primary-deep flex-shrink-0 mt-0.5" />
          <p className="text-xs text-accent-on-soft">
            <strong>Weryfikacja administratora:</strong> Po rejestracji Twoje konto będzie miało status „oczekuje". Po zatwierdzeniu otrzymasz pełny dostęp do platformy.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">Imię *</Label>
              <Input id="first_name" required maxLength={50} value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nazwisko *</Label>
              <Input id="last_name" required maxLength={50} value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email służbowy *</Label>
            <Input id="email" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="school">Szkoła</Label>
              <Input id="school" maxLength={150} placeholder="np. ZSP Warszawa"
                value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Główny przedmiot</Label>
              <Input id="subject" maxLength={100} placeholder="np. Matematyka"
                value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło (min. 8 znaków) *</Label>
            <Input id="password" type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox checked={terms} onCheckedChange={(v) => setTerms(v === true)} className="mt-0.5" />
            <span className="text-xs text-muted-foreground">
              Akceptuję regulamin platformy oraz politykę prywatności i wyrażam zgodę na przetwarzanie danych osobowych w celu prowadzenia konta.
            </span>
          </label>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Tworzenie konta..." : "Załóż konto i wyślij do akceptacji"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Masz już konto?{" "}
          <Link to="/auth/teacher" className="text-primary font-semibold hover:underline">Zaloguj się</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
