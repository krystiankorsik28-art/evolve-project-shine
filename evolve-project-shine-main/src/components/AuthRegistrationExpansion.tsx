import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Building2, CheckCircle2, School, ShieldCheck, UserRound } from "lucide-react";

type Role = "student" | "teacher" | "parent" | "admin";
type Values = Record<string, string>;

const blank: Values = {
  phone: "",
  city: "",
  school: "",
  position: "",
  subject: "",
  schoolCode: "",
  childFirstName: "",
  childLastName: "",
  childClass: "",
  childSchool: "",
  childPhone: "",
  inviteCode: "",
};

function visibleRegister() {
  return Array.from(document.querySelectorAll("h1")).some((node) =>
    node.textContent?.includes("Utwórz konto"),
  );
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

function currentRole(): Role {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));

  const active = buttons.find((button) => {
    const text = button.textContent ?? "";
    const cls = String(button.className ?? "");

    const hasRole =
      text.includes("Uczeń") ||
      text.includes("Nauczyciel") ||
      text.includes("Rodzic") ||
      text.includes("Admin");

    const looksActive =
      cls.includes("border-[#50e6ff]") ||
      cls.includes("bg-[#0078d4]") ||
      cls.includes("border-[#0078d4]") ||
      cls.includes("bg-[#eef6fd]");

    return hasRole && looksActive;
  });

  const text = active?.textContent ?? "";

  if (text.includes("Admin")) return "admin";
  if (text.includes("Rodzic")) return "parent";
  if (text.includes("Nauczyciel")) return "teacher";
  return "student";
}

function requiredFor(role: Role) {
  const base = ["phone", "city"];

  if (role === "teacher") {
    return [...base, "school", "position"];
  }

  if (role === "admin") {
    return [...base, "school", "position", "inviteCode"];
  }

  if (role === "parent") {
    return [
      ...base,
      "childFirstName",
      "childLastName",
      "childClass",
      "childSchool",
    ];
  }

  return base;
}

export function AuthRegistrationExpansion() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [role, setRole] = useState<Role>("student");
  const [values, setValues] = useState<Values>(blank);

  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [truth, setTruth] = useState(false);

  useEffect(() => {
    const tick = () => {
      if (location.pathname !== "/auth") return;

      const nextMount = getMount();
      setMount(nextMount);

      if (visibleRegister()) {
        setRole(currentRole());
      } else {
        document.querySelector("[data-auth-register-more]")?.remove();
      }
    };

    const timer = window.setInterval(tick, 300);
    const observer = new MutationObserver(tick);

    observer.observe(document.body, { childList: true, subtree: true });
    tick();

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      document.querySelector("[data-auth-register-more]")?.remove();
    };
  }, []);

  const required = useMemo(() => requiredFor(role), [role]);

  useEffect(() => {
    const validate = (event: Event) => {
      if (!mount || !visibleRegister()) return;

      const missing = required.find((key) => !values[key]?.trim());

      if (missing) {
        event.preventDefault();
        event.stopPropagation();
        alert("Uzupełnij wymagane pola rozszerzonej rejestracji.");
        return;
      }

      if (!terms || !privacy || !truth) {
        event.preventDefault();
        event.stopPropagation();
        alert("Zaakceptuj wymagane zgody rejestracyjne.");
        return;
      }

      sessionStorage.setItem(
        "edunex_register_extra",
        JSON.stringify({
          role,
          values,
          consents: { terms, privacy, truth },
          savedAt: new Date().toISOString(),
        }),
      );
    };

    document.addEventListener("submit", validate, true);
    return () => document.removeEventListener("submit", validate, true);
  }, [mount, required, role, values, terms, privacy, truth]);

  if (!mount) return null;

  const Icon =
    role === "admin"
      ? Building2
      : role === "teacher"
        ? School
        : role === "parent"
          ? UserRound
          : ShieldCheck;

  const title =
    role === "admin"
      ? "Rozszerzony wniosek administratora"
      : role === "teacher"
        ? "Rozszerzony wniosek nauczyciela"
        : role === "parent"
          ? "Rozszerzona rejestracja rodzica"
          : "Rozszerzona rejestracja ucznia";

  const subtitle =
    role === "parent"
      ? "Podaj dane kontaktowe rodzica oraz podstawowe dane dziecka."
      : role === "admin"
        ? "Podaj dane placówki, stanowisko i kod zaproszenia administratora."
        : role === "teacher"
          ? "Podaj dane szkoły, stanowisko i przedmiot."
          : "Podaj podstawowe dane kontaktowe konta ucznia.";

  return createPortal(
    <section className="my-4 rounded-[18px] border border-[#50e6ff]/25 bg-[#0078d4]/10 p-4 text-inherit">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#0078d4] text-white shadow-[0_0_32px_rgba(0,120,212,0.35)]">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-[-0.02em]">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">{subtitle}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MiniField
          label="Numer telefonu"
          name="phone"
          value={values.phone}
          required={required.includes("phone")}
          setValues={setValues}
        />

        <MiniField
          label="Miasto"
          name="city"
          value={values.city}
          required={required.includes("city")}
          setValues={setValues}
        />

        {(role === "teacher" || role === "admin") && (
          <>
            <MiniField
              label="Nazwa szkoły / placówki"
              name="school"
              value={values.school}
              required={required.includes("school")}
              setValues={setValues}
            />

            <MiniField
              label="Stanowisko"
              name="position"
              value={values.position}
              required={required.includes("position")}
              setValues={setValues}
            />

            <MiniField
              label="Przedmiot lub dział"
              name="subject"
              value={values.subject}
              setValues={setValues}
            />

            <MiniField
              label="Kod placówki"
              name="schoolCode"
              value={values.schoolCode}
              setValues={setValues}
            />
          </>
        )}

        {role === "parent" && (
          <>
            <MiniField
              label="Imię dziecka"
              name="childFirstName"
              value={values.childFirstName}
              required={required.includes("childFirstName")}
              setValues={setValues}
            />

            <MiniField
              label="Nazwisko dziecka"
              name="childLastName"
              value={values.childLastName}
              required={required.includes("childLastName")}
              setValues={setValues}
            />

            <MiniField
              label="Klasa dziecka"
              name="childClass"
              value={values.childClass}
              required={required.includes("childClass")}
              setValues={setValues}
            />

            <MiniField
              label="Szkoła dziecka"
              name="childSchool"
              value={values.childSchool}
              required={required.includes("childSchool")}
              setValues={setValues}
            />

            <MiniField
              label="Telefon awaryjny dziecka"
              name="childPhone"
              value={values.childPhone}
              setValues={setValues}
            />
          </>
        )}

        {role === "admin" && (
          <MiniField
            label="Kod zaproszenia administratora"
            name="inviteCode"
            value={values.inviteCode}
            required={required.includes("inviteCode")}
            setValues={setValues}
          />
        )}
      </div>

      <div className="mt-4 grid gap-2 text-[11px] leading-5 text-slate-300">
        <Check checked={terms} onChange={setTerms}>
          Akceptuję regulamin EduNex.
        </Check>

        <Check checked={privacy} onChange={setPrivacy}>
          Akceptuję politykę prywatności i przetwarzanie danych w celu obsługi konta.
        </Check>

        <Check checked={truth} onChange={setTruth}>
          Potwierdzam, że podane dane są prawdziwe.
        </Check>
      </div>
    </section>,
    mount,
  );
}

function MiniField({
  label,
  name,
  value,
  required,
  setValues,
}: {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  setValues: React.Dispatch<React.SetStateAction<Values>>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-sky-200/90">
        {label}
        {required && <span className="text-cyan-300"> *</span>}
      </span>

      <input
        value={value}
        onChange={(event) =>
          setValues((current) => ({ ...current, [name]: event.target.value }))
        }
        className="h-10 w-full rounded-xl border border-white/15 bg-white/[0.055] px-3 text-sm outline-none transition focus:border-[#50e6ff]/70 focus:shadow-[0_0_0_3px_rgba(80,230,255,0.12)]"
      />
    </label>
  );
}

function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#0078d4]"
      />

      <span>{children}</span>

      {checked && (
        <CheckCircle2 className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-300" />
      )}
    </label>
  );
}
