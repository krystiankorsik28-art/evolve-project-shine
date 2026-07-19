import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  Globe,
  Info,
  Link2,
  Loader2,
  LockKeyhole,
  Megaphone,
  MessageCircle,
  Pencil,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { confirmDialog } from "@/components/ConfirmDialog";
import { Eksport } from "../Eksport";
import { classLabel, formatDateTime, type JournalSnapshot } from "./journal-types";
import type { JournalActions } from "./use-journal-data";
import {
  JournalEmpty,
  JournalField,
  JournalModal,
  JournalSectionHeader,
  PrimaryButton,
  SecondaryButton,
  journalCard,
  journalInput,
} from "./journal-ui";

type Props = {
  snapshot: JournalSnapshot;
  selectedClassId: string;
  actions: JournalActions;
};

const CUSTOM_URL_KEY = "edunex-edziennik-custom-url";

const providers = [
  {
    name: "Vulcan UONET+",
    short: "V",
    url: "https://uonetplus.vulcan.net.pl/",
    description: "Oceny, frekwencja, wiadomości i organizacja szkoły.",
    color: "bg-emerald-600",
    featured: true,
  },
  {
    name: "Librus Synergia",
    short: "L",
    url: "https://synergia.librus.pl/",
    description: "Bezpośrednie logowanie do panelu nauczyciela Librus.",
    color: "bg-blue-700",
    featured: true,
  },
  {
    name: "mobiDziennik",
    short: "M",
    url: "https://mobidziennik.pl/",
    description: "Dziennik elektroniczny i komunikacja z rodzicami.",
    color: "bg-orange-600",
    featured: false,
  },
  {
    name: "EduPage",
    short: "E",
    url: "https://www.edupage.org/",
    description: "Plan, zastępstwa, oceny i materiały szkolne.",
    color: "bg-amber-600",
    featured: false,
  },
  {
    name: "Google Classroom",
    short: "G",
    url: "https://classroom.google.com/",
    description: "Klasy, zadania i materiały Google Workspace.",
    color: "bg-emerald-700",
    featured: false,
  },
  {
    name: "Microsoft Teams",
    short: "T",
    url: "https://teams.microsoft.com/",
    description: "Zajęcia, spotkania i pliki Microsoft 365 Education.",
    color: "bg-violet-700",
    featured: false,
  },
] as const;

function openSafeExternal(value: string) {
  const candidate = value.trim();
  if (!candidate) return false;
  try {
    const url = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
    if (url.protocol !== "https:") throw new Error("Adres musi używać HTTPS.");
    window.open(url.toString(), "_blank", "noopener,noreferrer");
    return true;
  } catch {
    toast.error("Wpisz poprawny, bezpieczny adres HTTPS.");
    return false;
  }
}

export function JournalCommunicationPanel({ snapshot, selectedClassId, actions }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    classId: selectedClassId,
    title: "",
    body: "",
    priority: "info" as "info" | "important" | "urgent",
  });

  const submit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Uzupełnij tytuł i treść ogłoszenia.");
      return;
    }
    setBusy(true);
    try {
      if (editingAnnouncementId) {
        await actions.updateAnnouncement(editingAnnouncementId, form);
        toast.success("Ogłoszenie zostało zaktualizowane.");
      } else {
        await actions.createAnnouncement(form);
        toast.success("Ogłoszenie zostało opublikowane.");
      }
      setForm({ ...form, title: "", body: "" });
      setEditingAnnouncementId(null);
      setModalOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const openAnnouncementEditor = (announcementId: string) => {
    const announcement = snapshot.announcements.find((item) => item.id === announcementId);
    if (!announcement) return;
    setEditingAnnouncementId(announcement.id);
    setForm({
      classId: announcement.class_id || "",
      title: announcement.title,
      body: announcement.body,
      priority: announcement.priority as typeof form.priority,
    });
    setModalOpen(true);
  };

  const removeAnnouncement = async (announcementId: string, title: string) => {
    const confirmed = await confirmDialog({
      title: "Usunąć ogłoszenie?",
      description: `„${title}” zniknie z paneli odbiorców. Operacja zostanie zapisana w historii.`,
      confirmText: "Usuń ogłoszenie",
    });
    if (!confirmed) return;
    try {
      await actions.deleteAnnouncement(announcementId);
      toast.success("Ogłoszenie zostało usunięte.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <article className={`${journalCard} p-5 md:col-span-2`}>
          <JournalSectionHeader
            eyebrow="Komunikacja klasowa"
            title="Ogłoszenia"
            description="Wiadomości dla wybranej klasy lub wszystkich uczniów."
            action={
              <PrimaryButton
                onClick={() => {
                  setEditingAnnouncementId(null);
                  setForm((current) => ({ ...current, classId: selectedClassId }));
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Nowe ogłoszenie
              </PrimaryButton>
            }
          />
        </article>
        <article className="rounded-2xl border border-slate-900 bg-slate-950 p-5 text-white shadow-sm dark:border-white/10">
          <MessageCircle className="h-5 w-5 text-blue-300" />
          <div className="mt-4 text-3xl font-semibold tracking-tight">
            {snapshot.unreadMessages}
          </div>
          <div className="mt-1 text-sm text-slate-300">nieprzeczytanych wiadomości</div>
          <Link
            to="/teacher"
            search={{ tab: "wiadomosci" }}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-200"
          >
            Otwórz skrzynkę <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </section>

      {snapshot.announcements.length === 0 ? (
        <JournalEmpty
          icon={Megaphone}
          title="Brak ogłoszeń"
          description="Opublikuj pierwszy komunikat dla uczniów lub całej klasy."
          action={
            <PrimaryButton onClick={() => setModalOpen(true)}>Napisz ogłoszenie</PrimaryButton>
          }
        />
      ) : (
        <section className="grid gap-3 lg:grid-cols-2">
          {snapshot.announcements.map((announcement) => {
            const target = snapshot.classes.find((item) => item.id === announcement.class_id);
            const priority =
              announcement.priority === "urgent"
                ? "Pilne"
                : announcement.priority === "important"
                  ? "Ważne"
                  : "Informacja";
            const tone =
              announcement.priority === "urgent"
                ? "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
                : announcement.priority === "important"
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300";
            return (
              <article key={announcement.id} className={`${journalCard} p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${tone}`}
                      >
                        {priority}
                      </span>
                      <span className="text-xs text-slate-400">
                        {target ? target.name : "Wszyscy"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-slate-950 dark:text-slate-100">
                      {announcement.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {announcement.body}
                    </p>
                    <div className="mt-4 text-xs text-slate-400">
                      {formatDateTime(announcement.created_at)}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openAnnouncementEditor(announcement.id)}
                      aria-label={`Edytuj ogłoszenie ${announcement.title}`}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-blue-400/10 dark:hover:text-blue-300"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAnnouncement(announcement.id, announcement.title)}
                      aria-label={`Usuń ogłoszenie ${announcement.title}`}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {modalOpen && (
        <JournalModal
          title={editingAnnouncementId ? "Edytuj ogłoszenie" : "Nowe ogłoszenie"}
          description={
            editingAnnouncementId
              ? "Zaktualizuj treść i grupę odbiorców."
              : "Opublikuj komunikat widoczny dla uczniów."
          }
          onClose={() => {
            setEditingAnnouncementId(null);
            setModalOpen(false);
          }}
          wide
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <JournalField label="Odbiorcy">
              <select
                value={form.classId}
                onChange={(event) => setForm({ ...form, classId: event.target.value })}
                className={journalInput}
              >
                <option value="">Wszyscy uczniowie</option>
                {snapshot.classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {classLabel(schoolClass)}
                  </option>
                ))}
              </select>
            </JournalField>
            <JournalField label="Priorytet">
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value as typeof form.priority })
                }
                className={journalInput}
              >
                <option value="info">Informacja</option>
                <option value="important">Ważne</option>
                <option value="urgent">Pilne</option>
              </select>
            </JournalField>
            <div className="sm:col-span-2">
              <JournalField label="Tytuł">
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className={journalInput}
                  placeholder="np. Zebranie z rodzicami"
                />
              </JournalField>
            </div>
            <div className="sm:col-span-2">
              <JournalField label="Treść">
                <textarea
                  rows={6}
                  value={form.body}
                  onChange={(event) => setForm({ ...form, body: event.target.value })}
                  className={`${journalInput} h-auto py-3`}
                  placeholder="Wpisz pełną treść komunikatu..."
                />
              </JournalField>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <SecondaryButton onClick={() => setModalOpen(false)}>Anuluj</SecondaryButton>
            <PrimaryButton disabled={busy} onClick={submit}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingAnnouncementId ? "Zapisz zmiany" : "Opublikuj"}
            </PrimaryButton>
          </div>
        </JournalModal>
      )}
    </div>
  );
}

export function JournalIntegrationsPanel() {
  const [customUrl, setCustomUrl] = useState(() => {
    try {
      return window.localStorage.getItem(CUSTOM_URL_KEY) || "";
    } catch {
      return "";
    }
  });

  const openCustom = () => {
    if (!openSafeExternal(customUrl)) return;
    try {
      window.localStorage.setItem(CUSTOM_URL_KEY, customUrl.trim());
    } catch {
      /* dostęp nadal działa */
    }
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#17181b]">
        <div className="grid gap-px bg-slate-200 dark:bg-white/10 lg:grid-cols-[1fr_360px]">
          <div className="bg-slate-950 p-6 text-white sm:p-7">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-slate-950">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/75">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Bezpieczne integracje
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Portale i eksport ocen
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Przechodź do oficjalnych systemów szkoły i generuj pliki zgodne z popularnymi
                  dziennikami.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-slate-200 dark:bg-white/10">
            <IntegrationStatus
              icon={ShieldCheck}
              label="Bezpieczeństwo"
              value="HTTPS + nowa karta"
            />
            <IntegrationStatus icon={FileSpreadsheet} label="Eksport" value="CSV i PDF" />
          </div>
        </div>
      </section>

      <section className={`${journalCard} p-5 sm:p-6`}>
        <JournalSectionHeader
          eyebrow="System szkoły"
          title="Oficjalne portale"
          description="Logowanie odbywa się wyłącznie po stronie wybranego dostawcy — EduNex nie przechwytuje haseł."
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => (
            <article
              key={provider.name}
              className="group relative flex min-h-48 flex-col rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-white/10 dark:hover:border-white/20"
            >
              {provider.featured && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
                  <Star className="h-3 w-3" />
                  Popularny
                </span>
              )}
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white shadow-sm ${provider.color}`}
              >
                {provider.short}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-slate-100">
                {provider.name}
              </h3>
              <p className="mt-1 flex-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {provider.description}
              </p>
              <button
                type="button"
                onClick={() => openSafeExternal(provider.url)}
                className="mt-4 inline-flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 transition group-hover:border-slate-950 group-hover:bg-slate-950 group-hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:group-hover:border-white dark:group-hover:bg-white dark:group-hover:text-slate-950"
              >
                Otwórz portal <ExternalLink className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            openCustom();
          }}
          className={`${journalCard} p-5 sm:p-6`}
        >
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-950 dark:text-slate-100">
                Inny system dziennika
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Wklej oficjalny adres HTTPS udostępniony przez szkołę.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input
              value={customUrl}
              onChange={(event) => setCustomUrl(event.target.value)}
              inputMode="url"
              autoComplete="url"
              placeholder="https://dziennik.twoja-szkola.pl"
              aria-label="Adres innego systemu dziennika"
              className={journalInput}
            />
            <PrimaryButton disabled={!customUrl.trim()} type="submit">
              Otwórz <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </form>
        <aside className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950 shadow-sm dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-100 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4" />
            Dlaczego osobna karta?
          </div>
          <p className="mt-3 text-sm leading-6 text-blue-900/80 dark:text-blue-200/80">
            Systemy dziennikowe blokują osadzanie logowania. Bezpośrednie przejście eliminuje
            problemy z cookies, CSP i niezabezpieczonym proxy.
          </p>
        </aside>
      </section>

      <Eksport />
    </div>
  );
}

function IntegrationStatus({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col justify-center bg-white p-4 dark:bg-[#202123]">
      <Icon className="h-4 w-4 text-blue-700 dark:text-blue-300" />
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">{value}</div>
    </div>
  );
}
