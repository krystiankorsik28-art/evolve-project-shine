import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageCircle, Send, Loader2, Search, User } from "lucide-react";

type Msg = { id: string; sender_id: string; recipient_id: string; body: string; read_at: string | null; created_at: string };
type Profile = { user_id: string; display_name: string | null; first_name: string | null; last_name: string | null; avatar_url: string | null };

export function Wiadomosci() {
  const [me, setMe] = useState<string>("");
  const [people, setPeople] = useState<Profile[]>([]);
  const [active, setActive] = useState<Profile | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMe(user.id);
      const { data: profs } = await supabase.from("profiles").select("user_id,display_name,first_name,last_name,avatar_url").neq("user_id", user.id).limit(500);
      setPeople((profs as Profile[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const loadConversation = async (other: Profile) => {
    setActive(other);
    const { data } = await supabase
      .from("direct_messages")
      .select("*")
      .or(`and(sender_id.eq.${me},recipient_id.eq.${other.user_id}),and(sender_id.eq.${other.user_id},recipient_id.eq.${me})`)
      .order("created_at", { ascending: true })
      .limit(500);
    setMsgs((data as Msg[]) ?? []);
    // mark received as read
    await supabase.from("direct_messages").update({ read_at: new Date().toISOString() }).eq("sender_id", other.user_id).eq("recipient_id", me).is("read_at", null);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // realtime subscription
  useEffect(() => {
    if (!me) return;
    const ch = supabase.channel(`dm_${me}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `recipient_id=eq.${me}` }, (payload) => {
        const m = payload.new as Msg;
        if (active && m.sender_id === active.user_id) {
          setMsgs((prev) => [...prev, m]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        } else {
          toast.info("Nowa wiadomość");
        }
      })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [me, active]);

  const send = async () => {
    if (!active || !text.trim()) return;
    const body = text.trim();
    setText("");
    const { data, error } = await supabase.from("direct_messages").insert({ sender_id: me, recipient_id: active.user_id, body }).select().single();
    if (error) { toast.error(error.message); return; }
    setMsgs((prev) => [...prev, data as Msg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const nameOf = (p: Profile) => p.display_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || "Użytkownik";
  const filtered = useMemo(() => people.filter(p => nameOf(p).toLowerCase().includes(search.toLowerCase())), [people, search]);

  if (loading) return <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin inline"/></div>;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-2xl font-bold text-white inline-flex items-center gap-2"><MessageCircle className="w-5 h-5 text-cyan-300"/>Wiadomości</h2>
        <p className="text-sm text-white/50 mt-1">Czat 1:1 z uczniami i kolegami z grona.</p>
      </div>
      <div className="grid lg:grid-cols-[280px,1fr] gap-3 h-[calc(100vh-16rem)] min-h-[480px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Szukaj osoby..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/40"/>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? <div className="p-6 text-center text-xs text-white/30">Brak osób</div> : filtered.map((p) => (
              <button key={p.user_id} onClick={() => loadConversation(p)} className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition border-l-2 ${active?.user_id === p.user_id ? "bg-white/5 border-cyan-400" : "border-transparent"}`}>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-blue-500 grid place-items-center text-slate-900 font-bold text-sm shrink-0">{nameOf(p)[0]?.toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white/90 truncate">{nameOf(p)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] flex flex-col overflow-hidden">
          {!active ? (
            <div className="flex-1 grid place-items-center text-white/40 text-sm">
              <div className="text-center"><User className="w-8 h-8 mx-auto mb-2 opacity-40"/>Wybierz osobę, by rozpocząć rozmowę</div>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-blue-500 grid place-items-center text-slate-900 font-bold text-sm">{nameOf(active)[0]?.toUpperCase()}</div>
                <div><div className="font-medium text-white">{nameOf(active)}</div></div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {msgs.length === 0 ? <div className="text-center text-xs text-white/30 py-12">Napisz pierwszą wiadomość</div> : msgs.map((m) => {
                  const mine = m.sender_id === me;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${mine ? "bg-gradient-to-br from-accent/30 to-accent/20 text-white rounded-br-sm" : "bg-white/5 text-white/90 rounded-bl-sm"}`}>
                        <div className="whitespace-pre-wrap">{m.body}</div>
                        <div className="text-[9px] text-white/40 mt-0.5 font-mono">{new Date(m.created_at).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>
              <div className="p-3 border-t border-white/5 flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder="Napisz wiadomość..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/40"/>
                <button onClick={send} disabled={!text.trim()} className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-semibold disabled:opacity-30 inline-flex items-center gap-2"><Send className="w-4 h-4"/></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
