import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

export function Setup2FA({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"start" | "qr" | "verify">("start");
  const [qr, setQr] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "EduNex Admin" });
      if (error) throw error;
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setStep("qr");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd inicjacji 2FA");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!factorId) return;
    setLoading(true);
    try {
      const { data: chal, error: ce } = await supabase.auth.mfa.challenge({ factorId });
      if (ce) throw ce;
      const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: chal.id, code });
      if (error) throw error;
      await supabase.from("profiles").update({ two_factor_enabled: true }).eq("user_id", (await supabase.auth.getUser()).data.user!.id);
      await logAudit("admin_2fa_enabled");
      toast.success("2FA aktywowane");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nieprawidłowy kod");
    } finally {
      setLoading(false);
    }
  };

  if (step === "start") {
    return <Button onClick={start} disabled={loading}>{loading ? "..." : "Skonfiguruj 2FA"}</Button>;
  }
  if (step === "qr") {
    return (
      <div className="space-y-4">
        <p className="text-sm">Zeskanuj kod QR aplikacją uwierzytelniającą (Google Authenticator, 1Password, Authy):</p>
        {qr && <img src={qr} alt="2FA QR" className="border rounded-md w-48 h-48" />}
        <Button onClick={() => setStep("verify")} variant="default">Mam już kod →</Button>
      </div>
    );
  }
  return (
    <div className="space-y-3 max-w-xs">
      <Label htmlFor="totp">Wpisz 6-cyfrowy kod</Label>
      <Input id="totp" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} maxLength={6} className="font-mono text-center text-lg" />
      <Button onClick={verify} disabled={loading || code.length !== 6} className="w-full">
        {loading ? "Weryfikacja..." : "Aktywuj 2FA"}
      </Button>
    </div>
  );
}
