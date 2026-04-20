import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { z } from "zod";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  first_name: z.string().trim().min(2, "Imię min. 2 znaki").max(50),
  last_name: z.string().trim().min(2, "Nazwisko min. 2 znaki").max(50),
  email: z.string().trim().email().max(255),
  password: z.string().min(8, "Hasło min. 8 znaków").max(128),
});

export default function RegisterTeacher() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
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
          emailRedirectTo: `${window.location.origin}/teacher`,
          data: {
            first_name: parsed.data.first_name,
            last_name: parsed.data.last_name,
            display_name: `${parsed.data.first_name} ${parsed.data.last_name}`,
            role: "teacher",
          },
        },
      });
      if (error) throw error;
      toast.success("Konto utworzone! Sprawdź email aby potwierdzić rejestrację.");
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
    <AuthLayout title="Dołącz jako nauczyciel" subtitle="Załóż konto i zacznij tworzyć nowoczesne egzaminy z pomocą AI." icon={Users}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold mb-1">Rejestracja nauczyciela</h2>
          <p className="text-sm text-muted-foreground">Wypełnij formularz, aby założyć konto</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">Imię</Label>
              <Input id="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nazwisko</Label>
              <Input id="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email służbowy</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Hasło (min. 8 znaków)</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Tworzenie konta..." : "Załóż konto"}
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
