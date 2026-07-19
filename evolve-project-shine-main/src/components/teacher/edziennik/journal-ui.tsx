import type { ComponentType, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const journalCard =
  "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#17181b]";

export const journalInput =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-white/10 dark:bg-[#202123] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-500/10 dark:disabled:bg-white/5";

export function JournalModal({
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`max-h-[92vh] w-[calc(100%-1.5rem)] gap-0 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl dark:border-white/10 dark:bg-[#17181b] dark:text-slate-100 ${wide ? "max-w-4xl" : "max-w-xl"}`}
      >
        <DialogHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 pr-14 text-left backdrop-blur dark:border-white/10 dark:bg-[#17181b]/95 sm:px-6">
          <DialogTitle className="text-lg font-semibold text-slate-950 dark:text-slate-100">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="p-5 sm:p-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export function JournalField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
      <span className="flex items-baseline justify-between gap-3">
        {label}
        {hint && <span className="text-xs font-normal text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function JournalEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-white/15 dark:bg-white/[0.025]">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-slate-100">{title}</h3>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

export function JournalSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
            {eyebrow}
          </div>
        )}
        <h2
          className={`${eyebrow ? "mt-1.5" : ""} text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100`}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  type = "button",
  disabled,
  onClick,
}: {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400 dark:focus-visible:ring-offset-[#17181b]"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
    >
      {children}
    </button>
  );
}
