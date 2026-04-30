import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
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
  pin: z.string().trim().regex(/^[0-9]{6}$/, "PIN musi składać się z 6 cyfr"),
});

export default function LoginStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", pin: "" });
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
      const { data, error } = await supabase.functions.invoke("student-pin-login", {
        body: parsed.data,
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "Nieprawidłowy PIN");

      // Zaloguj anonimowo + zachowaj sesję ucznia w sessionStorage
      sessionStorage.setItem("edunex_student", JSON.stringify({
        attempt_id: data.attempt_id,
        exam_id: data.exam_id,
        student_name: `${parsed.data.first_name} ${parsed.data.last_name}`,
      }));

      // Zaloguj się jako anonimowy user (Supabase wspiera anonymous)
      const { data: anon, error: anonErr } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            first_name: parsed.data.first_name,
            last_name: parsed.data.last_name,
            display_name: `${parsed.data.first_name} ${parsed.data.last_name}`,
            role: "student",
          },
        },
      });
      if (anonErr) throw anonErr;

      toast.success(`Witaj, ${parsed.data.first_name}!`);
      navigate(`/student/exam/${data.attempt_id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Błąd logowania";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Panel ucznia" subtitle="Wprowadź swoje dane oraz kod PIN egzaminu otrzymany od nauczyciela." icon={GraduationCap} accent="cyber">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold mb-1">Wejście do egzaminu</h2>
          <p className="text-sm text-muted-foreground">Twoje imię i nazwisko + 6-cyfrowy PIN egzaminu</p>
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
            <Label htmlFor="pin">Kod PIN egzaminu (6 cyfr)</Label>
            <Input
              id="pin"
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              required
              inputMode="numeric"
              pattern="[0-9]*"
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
              maxLength={6}
              autoComplete="off"
              placeholder="••••••"
            />
          </div>
          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? "Sprawdzanie PIN..." : "Rozpocznij egzamin"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
