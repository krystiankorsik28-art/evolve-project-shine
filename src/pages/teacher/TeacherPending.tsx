import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ShieldCheck, ShieldX, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export default function TeacherPending() {
  const { user, approvalStatus, rejectionReason, signOut, refreshRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Konto oczekuje na akceptację — EduNex.pl";
    if (approvalStatus === "approved") navigate("/teacher", { replace: true });
  }, [approvalStatus, navigate]);

  const isRejected = approvalStatus === "rejected";

  return (
    <div className="min-h-screen bg-hero relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-mesh opacity-60" />
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />

      <Card className="relative z-10 max-w-xl w-full shadow-elegant border-border/40 bg-card/95 backdrop-blur">
        <CardContent className="p-8 sm:p-10 space-y-6 text-center">
          <div className="flex justify-center"><Logo size="md" /></div>
          <div className={`mx-auto inline-flex p-4 rounded-2xl ${isRejected ? "bg-destructive/10 text-destructive" : "bg-accent-soft text-primary-deep"}`}>
            {isRejected ? <ShieldX className="h-10 w-10" /> : <Clock className="h-10 w-10 animate-pulse" />}
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              {isRejected ? "Wniosek odrzucony" : "Konto oczekuje na akceptację"}
            </h1>
            <p className="text-muted-foreground text-balance">
              {isRejected
                ? "Twoja rejestracja jako nauczyciel została odrzucona przez administratora. Skontaktuj się z administracją w celu wyjaśnienia."
                : "Dziękujemy za rejestrację! Twoje konto nauczyciela zostało utworzone i oczekuje na zatwierdzenie przez administratora platformy. Otrzymasz dostęp do panelu w ciągu 24 godzin."}
            </p>
          </div>

          {isRejected && rejectionReason && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-left">
              <div className="text-xs uppercase tracking-wider text-destructive font-bold mb-1">Powód odrzucenia</div>
              <div className="text-sm">{rejectionReason}</div>
            </div>
          )}

          <div className="bg-secondary/50 rounded-xl p-4 text-left text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span className="font-medium">{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status:</span>
              <span className={`font-bold ${isRejected ? "text-destructive" : "text-warning"}`}>
                {isRejected ? "ODRZUCONY" : "OCZEKUJE"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => refreshRole()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Sprawdź status
            </Button>
            <Button variant="ghost" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4 mr-2" /> Wyloguj
            </Button>
          </div>

          {!isRejected && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Twoje dane są bezpieczne i szyfrowane
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
