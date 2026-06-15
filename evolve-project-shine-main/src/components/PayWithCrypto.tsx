import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

type PayWithCryptoProps = {
  amountUsd: string;
  planName: string;
  integrationId: string;
  children?: React.ReactNode;
};

export function PayWithCrypto({ amountUsd, planName, integrationId, children }: PayWithCryptoProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { DCP } = await import("@directcryptopay/sdk");
      DCP.Payment({
        integrationId,
        amount_usd: amountUsd,
        callbacks: {
          onSuccess: (data) => {
            toast.success(`Płatność za ${planName} potwierdzona!`);
            setLoading(false);
          },
          onError: (error) => {
            toast.error("Płatność nieudana: " + error.message);
            setLoading(false);
          },
          onCancel: () => {
            toast.error("Anulowano płatność");
            setLoading(false);
          },
          onTxSubmitted: () => {
            toast.info("Transakcja wysłana — oczekiwanie na potwierdzenie...");
          },
        },
      });
    } catch (err) {
      toast.error("Błąd ładowania portfela krypto");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="relative w-full py-3 rounded-xl text-sm font-medium transition bg-gradient-to-br from-accent/80 via-white to-accent/40 text-black hover:shadow-[0_8px_32px_-8px_rgba(34,211,238,0.6)] disabled:opacity-50 inline-flex items-center justify-center gap-2 overflow-hidden group"
    >
      <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.3)_50%,transparent_70%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
      {loading ? "Łączenie z portfelem..." : (children || `Zapłać ${amountUsd}$`)}
    </button>
  );
}
