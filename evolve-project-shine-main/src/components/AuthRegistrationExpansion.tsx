import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, School, ShieldCheck, UserRound } from "lucide-react";

function visibleRegister() {
  return Array.from(document.querySelectorAll("h1")).some((node) => node.textContent?.includes("Utwórz konto"));
}

function getMount() {
  const form = document.querySelector("form");
  if (!form || !visibleRegister()) return null;
  let mount = document.querySelector<HTMLElement>("[data-auth-register-more]");
  if (!mount) {
    mount = document.createElement("div");
    mount.setAttribute("data-auth-register-more", "true");
    const target = form.querySelector("button[type='submit']")?.parentElement;
    form.insertBefore(mount, target ?? null);
  }
  return mount;
}

function currentRole() {
  const text = document.body.innerText;
  if (text.includes("Dyrektor / Admin")) return "admin";
  if (text.includes("Rodzic")) return "parent";
  if (text.includes("Nauczyciel")) return "teacher";
  return "student";
}

export function AuthRegistrationExpansion() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [role, setRole] = useState("student");

  useEffect(() => {
    const tick = () => {
      setMount(getMount());
      setRole(currentRole());
      if (!visibleRegister()) document.querySelector("[data-auth-register-more]")?.remove();
    };
    const timer = window.setInterval(tick, 350);
    const observer = new MutationObserver(tick);
    observer.observe(document.body, { childList: true, subtree: true });
    tick();
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      document.querySelector("[data-auth-register-more]")?.remove();
    };
  }, []);

  if (!mount) return null;

  const Icon = role === "admin" ? Building2 : role === "teacher" ? School : role === "parent" ? UserRound : ShieldCheck;
  const title = role === "admin" ? "Rozszerzony wniosek administratora" : role === "teacher" ? "Rozszerzony wniosek nauczyciela" : role === "parent" ? "Rozszerzona rejestracja rodzica" : "Rozszerzona rejestracja ucznia";

  return createPortal(
    <section className="my-4 rounded-[18px] border border-[#50e6ff]/25 bg-[#0078d4]/10 p-4 text-inherit">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#0078d4] text-white shadow-[0_0_32px_rgba(0,120,212,0.35)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-[-0.02em]">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">Ten blok zostanie rozbudowany o pola kontaktowe, szkolne oraz zgody wymagane przy rejestracji.</p>
        </div>
      </div>
    </section>,
    mount,
  );
}
