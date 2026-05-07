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
import { logAudit } from "@/lib/audit";

const schema = z.object({
  email: z.string().trim().email("Nieprawidłowy email").max(255),
  password: z.string().min(8, "Hasło musi mieć min. 8 znaków").max(128),
});

// Stałe konto demo nauczyciela – zaszyte na trwałe
const DEMO_TEACHER = { email: "zpgda122n2@gmail.com", password: "Oliva2026" } as const;

export default function LoginTeacher() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>(DEMO_TEACHER.email);
  const [password, setPassword] = useState<string>(DEMO_TEACHER.password);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
      if (error) throw error;
      const { data: roleData } = await supabase.rpc("get_primary_role", { _user_id: data.user.id });
      if (roleData !== "teacher" && roleData !== "admin") {
        await supabase.auth.signOut();
        toast.error("To konto nie jest kontem nauczyciela.");
        return;
      }
      await logAudit("teacher_login_success", { resource_type: "auth" });
      toast.success("Zalogowano");
      navigate(roleData === "admin" ? "/admin" : "/teacher");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd logowania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Panel nauczyciela"
      subtitle="Twórz egzaminy, zarządzaj bankiem pytań, korzystaj z AI do oceniania prac."
      icon={Users}
      accent="gold"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold mb-1">Logowanie nauczyciela</h2>
          <p className="text-sm text-muted-foreground">Witaj ponownie w EduNex.pl</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Nie masz konta?{" "}
          <Link to="/auth/register-teacher" className="text-primary font-semibold hover:underline">
            Zarejestruj się
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
