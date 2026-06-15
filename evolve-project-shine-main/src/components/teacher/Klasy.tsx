import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Plus, Trash2, UserPlus, Loader2, Edit3 } from "lucide-react";
import { Modal, Field, inputCls } from "./Egzaminy";
import { confirmDialog } from "@/components/ConfirmDialog";

type Cls = { id: string; name: string; year: string; color: string; created_at: string };
type Student = { id: string; student_name: string | null; student_user_id: string | null; created_at: string };

const COLORS = [
  "from-accent to-blue-500",
  "from-accent to-blue-500",
  "from-accent to-blue-500",
  "from-accent to-blue-500",
  "from-accent to-blue-500",
  "from-accent to-blue-500",
];

export function Klasy() {
  const [classes, setClasses] = useState<Cls[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState<Cls | null>(null);
  const [editing, setEditing] = useState<Cls | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("classes").select("*").order("created_at", { ascending: false });
    setClasses((data ?? []) as Cls[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (c: Cls) => {
    if (!(await confirmDialog({ description: `Usunąć klasę "${c.name}"?` }))) return;
    const { error } = await supabase.from("classes").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Usunięto"); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Klasy</h2>
          <p className="text-xs text-white/50">Twórz klasy, dodawaj uczniów, przypisuj egzaminy.</p>
        </div>
        <button onClick={()=>setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold"><Plus className="w-4 h-4"/>Nowa klasa</button>
      </div>

      {loading ? <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin inline"/></div> :
       classes.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-white/40 text-sm">Brak klas</div> :
       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {classes.map(c => (
           <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-5 group hover:border-accent/30 transition">
             <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center mb-3 shadow-lg`}><Users className="w-6 h-6 text-white"/></div>
             <div className="text-lg font-display font-bold text-white">{c.name}</div>
             <div className="text-xs text-white/40 font-mono">{c.year}</div>
             <div className="flex gap-1 mt-4">
               <button onClick={()=>setOpened(c)} className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-sm text-white/80">Uczniowie</button>
               <button onClick={()=>setEditing(c)} className="p-2 rounded-lg hover:bg-white/10 text-white/70"><Edit3 className="w-4 h-4"/></button>
               <button onClick={()=>remove(c)} className="p-2 rounded-lg hover:bg-white/10 text-pink-400"><Trash2 className="w-4 h-4"/></button>
             </div>
           </div>
         ))}
       </div>}

      {(creating || editing) && <ClassForm cls={editing} onClose={() => { setCreating(false); setEditing(null); load(); }}/>}
      {opened && <StudentsModal cls={opened} onClose={()=>setOpened(null)}/>}
    </div>
  );
}

function ClassForm({ cls, onClose }: { cls: Cls | null; onClose: () => void }) {
  const [name, setName] = useState(cls?.name ?? "");
  const [year, setYear] = useState(cls?.year ?? "2025/26");
  const [color, setColor] = useState(cls?.color ?? COLORS[0]);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!name.trim()) return toast.error("Podaj nazwę");
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return toast.error("Brak sesji"); }
    if (cls) {
      const { error } = await supabase.from("classes").update({ name, year, color }).eq("id", cls.id);
      if (error) { setBusy(false); return toast.error(error.message); }
    } else {
      const { error } = await supabase.from("classes").insert({ name, year, color, created_by: user.id });
      if (error) { setBusy(false); return toast.error(error.message); }
    }
    toast.success("Zapisano"); setBusy(false); onClose();
  };
  return (
    <Modal title={cls?"Edytuj klasę":"Nowa klasa"} onClose={onClose}>
      <Field label="Nazwa"><input value={name} onChange={(e)=>setName(e.target.value)} className={inputCls}/></Field>
      <Field label="Rok"><input value={year} onChange={(e)=>setYear(e.target.value)} className={inputCls}/></Field>
      <Field label="Kolor">
        <div className="grid grid-cols-6 gap-2">
          {COLORS.map(c => <button key={c} onClick={()=>setColor(c)} className={`h-10 rounded-lg bg-gradient-to-br ${c} ${color===c?"ring-2 ring-cyan-300":""}`}/>)}
        </div>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">Anuluj</button>
        <button disabled={busy} onClick={save} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm disabled:opacity-50">{busy?"...":"Zapisz"}</button>
      </div>
    </Modal>
  );
}

function StudentsModal({ cls, onClose }: { cls: Cls; onClose: () => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("class_students").select("*").eq("class_id", cls.id).order("created_at", { ascending: false });
    setStudents((data ?? []) as Student[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [cls.id]);
  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("class_students").insert({ class_id: cls.id, student_name: name.trim() });
    if (error) return toast.error(error.message);
    setName(""); load();
  };
  const remove = async (id: string) => { await supabase.from("class_students").delete().eq("id", id); load(); };
  return (
    <Modal title={`Uczniowie: ${cls.name}`} onClose={onClose} wide>
      <div className="flex gap-2 pb-3 border-b border-white/10">
        <input value={name} onChange={(e)=>setName(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&add()} placeholder="Imię i nazwisko ucznia" className={inputCls}/>
        <button onClick={add} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm inline-flex items-center gap-2 whitespace-nowrap"><UserPlus className="w-4 h-4"/>Dodaj</button>
      </div>
      <div className="space-y-1 max-h-[400px] overflow-auto pt-3">
        {loading ? <div className="text-center text-white/40 py-6"><Loader2 className="w-5 h-5 animate-spin inline"/></div> :
         students.length === 0 ? <div className="text-center text-white/40 py-6 text-sm">Brak uczniów</div> :
         students.map(s => (
          <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06]">
            <div className="text-sm text-white/90">{s.student_name ?? s.student_user_id}</div>
            <button onClick={()=>remove(s.id)} className="p-1.5 rounded hover:bg-white/10 text-pink-400"><Trash2 className="w-3.5 h-3.5"/></button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
