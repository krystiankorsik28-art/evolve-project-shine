import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Megaphone, Plus, Pin, PinOff, Trash2, AlertTriangle, Info, Bell, Loader2 } from "lucide-react";
import { Modal, Field, inputCls } from "./Egzaminy";
import { confirmDialog } from "@/components/ConfirmDialog";

type Announcement = {
  id: string;
  title: string;
  body: string;
  priority: string;
  pinned: boolean;
  class_id: string | null;
  created_at: string;
  created_by: string;
};
type Klasa = { id: string; name: string };

const PRIORITY_META: Record<string, { label: string; color: string; icon: typeof Info }> = {
  info: { label: "Informacja", color: "text-cyan-300 bg-cyan-500/10 border-cyan-400/30", icon: Info },
  important: { label: "Ważne", color: "text-amber-300 bg-amber-500/10 border-amber-400/30", icon: Bell },
  urgent: { label: "Pilne", color: "text-rose-300 bg-rose-500/10 border-rose-400/30", icon: AlertTriangle },
};

export function Ogloszenia() {
  const [list, setList] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Klasa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", priority: "info", class_id: "", pinned: false });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: a }, { data: c }] = await Promise.all([
      supabase.from("announcements").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(200),
      supabase.from("classes").select("id,name").order("name"),
    ]);
    setList((a as Announcement[]) ?? []);
    setClasses((c as Klasa[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const submit = async () => {
    if (!form.title.trim() || !form.body.trim()) { toast.error("Wpisz tytuł i treść"); return; }
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); toast.error("Brak sesji"); return; }
    const { error } = await supabase.from("announcements").insert({
      created_by: user.id,
      title: form.title.trim(),
      body: form.body.trim(),
      priority: form.priority,
      class_id: form.class_id || null,
      pinned: form.pinned,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Opublikowano ogłoszenie");
    setModalOpen(false);
    setForm({ title: "", body: "", priority: "info", class_id: "", pinned: false });
    void load();
  };

  const togglePin = async (a: Announcement) => {
    await supabase.from("announcements").update({ pinned: !a.pinned }).eq("id", a.id);
    void load();
  };
  const remove = async (a: Announcement) => {
    if (!(await confirmDialog({ title: "Usunąć ogłoszenie?", description: a.title }))) return;
    await supabase.from("announcements").delete().eq("id", a.id);
    toast.success("Usunięto");
    void load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white inline-flex items-center gap-2"><Megaphone className="w-5 h-5 text-cyan-300"/>Ogłoszenia</h2>
          <p className="text-sm text-white/50 mt-1">Publikuj wiadomości do całej klasy lub wszystkich uczniów.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-semibold text-sm hover:brightness-110 transition">
          <Plus className="w-4 h-4"/>Nowe ogłoszenie
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin inline"/></div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-white/40">Brak ogłoszeń. Opublikuj pierwsze, by powiadomić uczniów.</div>
      ) : (
        <div className="grid gap-3">
          {list.map((a) => {
            const meta = PRIORITY_META[a.priority] ?? PRIORITY_META.info;
            const Icon = meta.icon;
            const klasa = classes.find(c => c.id === a.class_id)?.name ?? "Wszyscy";
            return (
              <div key={a.id} className={`rounded-2xl border bg-white/[0.03] p-5 transition ${a.pinned ? "border-accent/30 shadow-[0_0_0_1px_rgba(34,211,238,0.1)]" : "border-white/10"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded border ${meta.color} inline-flex items-center gap-1`}><Icon className="w-3 h-3"/>{meta.label}</span>
                      <span className="text-[10px] text-white/40 font-mono">{klasa}</span>
                      {a.pinned && <span className="text-[10px] text-cyan-300 font-mono inline-flex items-center gap-1"><Pin className="w-3 h-3"/>PRZYPIĘTE</span>}
                      <span className="text-[10px] text-white/30 font-mono ml-auto">{new Date(a.created_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                    <h3 className="font-display font-bold text-white text-lg">{a.title}</h3>
                    <p className="text-sm text-white/70 mt-1 whitespace-pre-wrap">{a.body}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => togglePin(a)} className="w-8 h-8 grid place-items-center rounded-lg text-white/40 hover:text-white hover:bg-white/5" title={a.pinned ? "Odepnij" : "Przypnij"}>
                      {a.pinned ? <PinOff className="w-4 h-4"/> : <Pin className="w-4 h-4"/>}
                    </button>
                    <button onClick={() => remove(a)} className="w-8 h-8 grid place-items-center rounded-lg text-white/40 hover:text-rose-300 hover:bg-rose-500/10" title="Usuń">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (<Modal onClose={() => setModalOpen(false)} title="Nowe ogłoszenie">
        <div className="space-y-3">
          <Field label="Tytuł">
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="np. Sprawdzian z fizyki w piątek"/>
          </Field>
          <Field label="Treść">
            <textarea className={`${inputCls} min-h-32`} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Opisz szczegóły..."/>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Priorytet">
              <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="info">Informacja</option>
                <option value="important">Ważne</option>
                <option value="urgent">Pilne</option>
              </select>
            </Field>
            <Field label="Klasa (puste = wszyscy)">
              <select className={inputCls} value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
                <option value="">Wszyscy uczniowie</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })}/>
            Przypnij na górze listy
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5">Anuluj</button>
            <button onClick={submit} disabled={busy} className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-semibold text-sm disabled:opacity-50 inline-flex items-center gap-2">
              {busy && <Loader2 className="w-4 h-4 animate-spin"/>}Opublikuj
            </button>
          </div>
        </div>
      </Modal>)}
    </div>
  );
}
