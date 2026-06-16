import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import type { AuthProvider } from "@/lib/auth/auth-types";
import { toast } from "sonner";

const PROVIDERS: { id: AuthProvider; label: string; icon: string }[] = [
  { id: "google", label: "Google", icon: "G" },
  { id: "apple", label: "Apple", icon: "A" },
  { id: "microsoft", label: "Microsoft", icon: "MS" },
];

export function SocialLogin({ mode = "login" }: { mode?: "login" | "register" }) {
  const { signInWithProvider } = useAuth();
  const [busy, setBusy] = useState<AuthProvider | null>(null);

  const handleProvider = async (provider: AuthProvider) => {
    setBusy(provider);
    try {
      await signInWithProvider(provider);
    } catch (e: any) {
      toast.error(e.message || `Failed to ${mode} with ${provider}`);
    } finally {
      setBusy(null);
    }
  };

  const getProviderStyle = (id: AuthProvider) => {
    const styles: Record<string, string> = {
      google: "hover:bg-white/5",
      microsoft: "hover:bg-white/5",
    };
    return styles[id] ?? "";
  };

  return (
    <div>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-white/30">lub kontynuuj przez</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {PROVIDERS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => handleProvider(id)}
            disabled={busy !== null}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 transition-all duration-200 text-sm font-medium
              bg-white/[0.02] backdrop-blur-sm
              ${getProviderStyle(id)}
              ${busy === id ? 'opacity-50 cursor-wait' : 'hover:-translate-y-0.5'}
              disabled:cursor-not-allowed`}
          >
            {busy === id ? (
              <svg className="animate-spin w-4 h-4 text-white/50" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <span className="text-white/80">{label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
