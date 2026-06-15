import { useEffect, useCallback, useRef } from "react";
import { CreditCard } from "lucide-react";

declare global {
  interface Window {
    DCP?: {
      onReady: (cb: () => void) => void;
      Payment: (opts: {
        integrationId: string;
        amount_usd: string;
        metadata?: Record<string, string>;
        onStatus?: (status: { type: string }) => void;
        onCancel?: () => void;
        onError?: (error: Error) => void;
      }) => void;
      cleanup: () => void;
      classifyError: (err: Error) => { code: string; message: string };
    };
  }
}

type Props = {
  amount: string;
  planName: string;
  /** Kwota w USD dla widgetu */
  amountUsd?: string;
};

export function NexaPayCheckout({ amount, planName, amountUsd }: Props) {
  const ready = useRef(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://api.directcryptopay.com/widget/dcp-widget.umd.js";
    script.async = true;
    script.onload = () => {
      window.DCP?.onReady(() => { ready.current = true; });
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const handlePay = useCallback(() => {
    if (!ready.current) return alert("Widget jeszcze nie gotowy...");
    window.DCP?.Payment({
      integrationId: "int_kqqi2y8cfym5",
      amount_usd: amountUsd || amount,
      metadata: { plan: planName },
      onStatus: (status) => {
        if (status.type === "confirmed") {
          window.DCP?.cleanup();
        }
      },
      onCancel: () => console.log("Anulowano"),
      onError: (err) => {
        const { message } = window.DCP?.classifyError(err) || { message: err.message };
        console.error("Błąd płatności:", message);
      },
    });
  }, [amount, planName]);

  return (
    <button
      onClick={handlePay}
      className="w-full py-3 rounded-xl text-sm font-medium transition bg-gradient-to-br from-accent to-blue-500 text-black hover:shadow-[0_8px_32px_-8px_rgba(34,211,238,0.6)] inline-flex items-center justify-center gap-2 overflow-hidden group"
    >
      <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.3)_50%,transparent_70%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      <CreditCard className="w-4 h-4 shrink-0" />
      <span>Zapłać <span className="font-bold">{amount}</span></span>
    </button>
  );
}
