import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
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

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"creds" | "mfa">("creds");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
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

      // Sprawdź rolę
      const { data: roleData } = await supabase.rpc("get_primary_role", { _user_id: data.user.id });
      if (roleData !== "admin") {
        await supabase.auth.signOut();
        toast.error("To konto nie ma uprawnień administratora.");
        return;
      }

      // Sprawdź czy ma TOTP
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.totp?.find((f) => f.status === "verified");

      if (totpFactor) {
        const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
        if (chalErr) throw chalErr;
        setFactorId(totpFactor.id);
        setChallengeId(chal.id);
        setStep("mfa");
        setLoading(false);
        return;
      }

      // Brak 2FA — wymuś setup po wejściu (ale zaloguj)
      await logAudit("admin_login_no_mfa", { resource_type: "auth" });
      toast.warning("Zaloguj się, ale skonfiguruj 2FA jak najszybciej.");
      navigate("/admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Błąd logowania";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || !challengeId) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: otp });
      if (error) throw error;
      await logAudit("admin_login_success", { resource_type: "auth" });
      toast.success("Zalogowano");
      navigate("/admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Nieprawidłowy kod";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Panel administratora"
      subtitle="Pełne zarządzanie platformą EduNex.pl. Wymaga drugiego składnika uwierzytelniania (TOTP)."
      icon={Shield}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold mb-1">Logowanie administratora</h2>
          <p className="text-sm text-muted-foreground">Bezpieczny dostęp do systemu</p>
        </div>

        {step === "creds" ? (
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
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Kod z aplikacji uwierzytelniającej</Label>
              <Input id="otp" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required autoFocus />
              <p className="text-xs text-muted-foreground">Wprowadź 6-cyfrowy kod z Google Authenticator / 1Password / Authy.</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? "Weryfikacja..." : "Zweryfikuj kod"}
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
