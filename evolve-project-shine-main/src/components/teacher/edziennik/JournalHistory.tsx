import {
  BookOpenCheck,
  ClipboardCheck,
  FileClock,
  GraduationCap,
  Megaphone,
  MessageSquareText,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import { classLabel, type JournalSnapshot } from "./journal-types";
import { JournalEmpty, JournalSectionHeader, journalCard } from "./journal-ui";

type Props = {
  snapshot: JournalSnapshot;
  selectedClassId: string;
};

const entityMeta = {
  class: { label: "Klasa", icon: GraduationCap },
  student: { label: "Uczeń", icon: UserRound },
  lesson: { label: "Lekcja", icon: BookOpenCheck },
  attendance: { label: "Frekwencja", icon: ClipboardCheck },
  grade: { label: "Ocena", icon: Star },
  note: { label: "Uwaga / pochwała", icon: MessageSquareText },
  announcement: { label: "Ogłoszenie", icon: Megaphone },
} as const;

const actionMeta = {
  created: {
    label: "Utworzono",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  },
  updated: {
    label: "Zmieniono",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
  },
  deleted: {
    label: "Usunięto",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
  },
} as const;

export function JournalHistory({ snapshot, selectedClassId }: Props) {
  const entries = snapshot.activity.filter(
    (entry) => !selectedClassId || !entry.class_id || entry.class_id === selectedClassId,
  );

  return (
    <div className="space-y-5">
      <section className={`${journalCard} p-5 sm:p-6`}>
        <JournalSectionHeader
          eyebrow="Bezpieczeństwo danych"
          title="Historia operacji"
          description="Niezależny rejestr utworzeń, zmian i usunięć. Pomaga odtworzyć przebieg pracy w dzienniku."
          action={
            <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Rejestr chroniony RLS
            </span>
          }
        />
      </section>

      {entries.length === 0 ? (
        <JournalEmpty
          icon={FileClock}
          title="Brak operacji w wybranym zakresie"
          description="Nowe działania w klasach, lekcjach, ocenach i komunikacji pojawią się tutaj automatycznie."
        />
      ) : (
        <section className={`${journalCard} overflow-hidden`}>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {entries.map((entry) => {
              const entity =
                entityMeta[entry.entity_type as keyof typeof entityMeta] ?? entityMeta.lesson;
              const action =
                actionMeta[entry.action as keyof typeof actionMeta] ?? actionMeta.updated;
              const Icon = entity.icon;
              const schoolClass = snapshot.classes.find((item) => item.id === entry.class_id);
              return (
                <article
                  key={entry.id}
                  className="grid gap-3 p-4 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center sm:px-5"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${action.className}`}
                      >
                        {action.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {entity.label}
                      </span>
                      {schoolClass && (
                        <span className="text-xs text-slate-400">{classLabel(schoolClass)}</span>
                      )}
                    </div>
                    <h3 className="mt-2 truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                      {entry.summary}
                    </h3>
                  </div>
                  <time
                    dateTime={entry.created_at}
                    className="text-xs text-slate-400 sm:text-right"
                  >
                    {new Intl.DateTimeFormat("pl-PL", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(entry.created_at))}
                  </time>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
