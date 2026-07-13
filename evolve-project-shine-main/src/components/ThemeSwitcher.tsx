import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "@/lib/theme";

const options: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  { value: "light", label: "Jasny", description: "Zawsze jasny interfejs", icon: Sun },
  { value: "dark", label: "Ciemny", description: "Mniej światła i wysoki kontrast", icon: Moon },
  {
    value: "system",
    label: "Systemowy",
    description: "Zgodny z ustawieniem urządzenia",
    icon: Monitor,
  },
];

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const selected = options.find((option) => option.value === theme) ?? options[2];
  const TriggerIcon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10a37f]/35 dark:border-white/10 dark:bg-[#202123] dark:text-slate-200 dark:hover:bg-[#2a2b32]"
          aria-label={`Motyw: ${selected.label}`}
          title={`Motyw: ${selected.label}`}
        >
          <TriggerIcon className="h-4 w-4" />
          {!compact && <span>{selected.label}</span>}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[100] w-64 rounded-xl border border-slate-200 bg-white p-1.5 text-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-[#202123] dark:text-slate-100 dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
        >
          <div className="px-2.5 pb-2 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Wygląd interfejsu
          </div>
          {options.map((option) => {
            const Icon = option.icon;
            const active = option.value === theme;

            return (
              <DropdownMenu.Item
                key={option.value}
                onSelect={() => setTheme(option.value)}
                className="flex cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2.5 outline-none transition data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-[#2a2b32]"
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-[#17181b] dark:text-slate-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {option.description}
                  </span>
                </span>
                {active && <Check className="mt-1 h-4 w-4 shrink-0 text-[#10a37f]" />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
