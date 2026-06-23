import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { submitStudentAttempt } from "@/lib/student-exam.functions";
import { checkAttemptStatus } from "@/lib/student-auth.functions";
import {
  Loader2, Clock, Send, AlertTriangle, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Maximize, Trophy, MonitorUp, ScreenShare,
  Flag, Save, Eye, EyeOff, FileText, HelpCircle, ListChecks,
  CheckSquare, ListOrdered, AlignLeft, Hash, Code, Shuffle, Type,
  Gauge, GraduationCap, Lightbulb, Zap, ArrowRight,
  Layers, ClipboardCheck, Hourglass, Award, Download, ExternalLink, Timer,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { confirmDialog } from "@/components/ConfirmDialog";
import { StudentTools } from "@/components/student/StudentTools";
import { generateSerial, getQrUrl, downloadCertPdf, CertData } from "@/lib/certificate";

export const Route = createFileRoute("/student/exam/$attemptId")({
  component: ExamRunner,
});

type QuestionType =
  | "single_choice" | "multiple_choice" | "true_false" | "short_answer" | "essay"
  | "matching" | "drag_drop" | "fill_in_blank" | "ordering" | "numeric" | "code" | "hotspot";

type Question = {
  id: string;
  prompt: string;
  question_type: QuestionType;
  options: unknown;
  points: number;
  media_url: string | null;
  order_index: number;
};

type Session = { exam_id: string; exam_title: string; duration_minutes: number; student_name: string; attempt_id: string };

const timeWarnings = [
  { at: 0.5, label: "50% czasu minęło", icon: Hourglass, color: "amber" },
  { at: 0.25, label: "Zostało 25% czasu", icon: Timer, color: "orange" },
  { at: 0.15, label: "Zostało 15% czasu", icon: Gauge, color: "red" },
  { at: 5 * 60, label: "Zostało 5 minut!", icon: AlertTriangle, color: "red" },
] as const;

function ExamRunner() {
  const { attemptId } = Route.useParams();
  const navigate = useNavigate();
  const submitFn = useServerFn(submitStudentAttempt);
  const checkStatusFn = useServerFn(checkAttemptStatus);

  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [idx, setIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; max_score: number; percent: number; passed: boolean } | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenRequesting, setScreenRequesting] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [framesSent, setFramesSent] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);
  const [transitionDir, setTransitionDir] = useState<"left" | "right">("right");
  const [showResultDetails, setShowResultDetails] = useState(false);
  const [questionResults, setQuestionResults] = useState<Record<string, { is_correct: boolean | null; points_awarded: number | null; correct_answer: unknown }>>({});
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef<number>(Date.now());
  const submittedRef = useRef(false);
  const warnedRef = useRef<Set<string>>(new Set());

  // load session + data
  useEffect(() => {
    const stored = sessionStorage.getItem("edunex_student");
    if (!stored) { setError("Brak sesji egzaminu. Wróć i wpisz PIN ponownie."); return; }
    const s = JSON.parse(stored) as Session;
    if (s.attempt_id !== attemptId) { setError("Sesja nie pasuje do tego egzaminu."); return; }
    setSession(s);
    setSecondsLeft(s.duration_minutes * 60);
    (async () => {
      // Re-entry check: attempt already submitted?
      try {
        const { status } = await checkStatusFn({ data: { attempt_id: attemptId } });
        if (status !== "in_progress") {
          setError("Ten egzamin został już ukończony. Nie możesz do niego wrócić.");
          return;
        }
      } catch {
        // ignore – proceed
      }

      // Log device fingerprint for re-entry tracking
      try {
        const fp = [
          navigator.userAgent,
          navigator.language,
          screen.width,
          screen.height,
          screen.colorDepth,
          new Date().getTimezoneOffset(),
        ].join("||");
        await supabase.from("proctoring_events").insert({
          attempt_id: attemptId,
          event_type: "exam_entry",
          metadata: { device_fingerprint: fp, timestamp: Date.now() } as never,
        });
      } catch { /* ignore */ }

      const { data, error } = await supabase
        .from("questions")
        .select("id, prompt, question_type, options, points, media_url, order_index")
         .eq("exam_id", s.exam_id)
         .order("order_index", { ascending: true });
      if (error) { setError(error.message); return; }
      setQuestions((data ?? []) as Question[]);
      const { data: aData } = await supabase
        .from("answers")
        .select("question_id, response")
        .eq("attempt_id", attemptId);
      const map: Record<string, unknown> = {};
      for (const a of aData ?? []) map[a.question_id] = a.response;
      setAnswers(map);
    })();
  }, [attemptId]);

  // timer
  useEffect(() => {
    if (!session || result) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); doSubmit(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, result]);

  // time warnings
  useEffect(() => {
    if (!session || result || !questions) return;
    const total = session.duration_minutes * 60;
    const elapsed = total - secondsLeft;

    for (const w of timeWarnings) {
      const key = typeof w.at === "number" ? `sec_${w.at}` : `pct_${w.at}`;
      if (warnedRef.current.has(key)) continue;
      let trigger = false;
      if (typeof w.at === "number") {
        trigger = secondsLeft <= w.at && secondsLeft > 0;
      } else {
        const pct = elapsed / total;
        trigger = pct >= w.at && pct < w.at + 0.01;
      }
      if (trigger) {
        warnedRef.current.add(key);
        setActiveWarning(w.label);
        setTimeout(() => setActiveWarning(null), 5000);
      }
    }
  }, [secondsLeft, session, result, questions]);

  // proctoring helpers
  const logEvent = useCallback(async (event_type: string, metadata: Record<string, unknown> = {}) => {
    try {
      await supabase.from("proctoring_events").insert({ attempt_id: attemptId, event_type, metadata: metadata as never });
    } catch { /* ignore */ }
  }, [attemptId]);

  useEffect(() => {
    if (result) return;
    const onVis = () => { if (document.hidden) { logEvent("tab_hidden"); toast.warning("Wykryto opuszczenie karty"); } };
    const onBlur = () => { logEvent("window_blur"); };
    const onCopy = (e: ClipboardEvent) => { e.preventDefault(); logEvent("copy_attempt"); toast.error("Kopiowanie zablokowane"); };
    const onPaste = (e: ClipboardEvent) => { e.preventDefault(); logEvent("paste_attempt"); toast.error("Wklejanie zablokowane"); };
    const onCtx = (e: MouseEvent) => { e.preventDefault(); logEvent("right_click"); };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c","v","x","u","s","p"].includes(k)) { e.preventDefault(); logEvent("forbidden_key", { key: k }); }
      if (k === "f12") { e.preventDefault(); logEvent("devtools_open"); }
    };
    const onFs = () => {
      const isFs = !!document.fullscreenElement;
      setFullscreen(isFs);
      logEvent(isFs ? "fullscreen_enter" : "fullscreen_exit", { fullscreen: isFs });
      if (!isFs) toast.warning("Wyjście z trybu pełnoekranowego");
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onCtx);
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    const hb = setInterval(() => logEvent("heartbeat", { current_q: idx, fullscreen: !!document.fullscreenElement }), 30000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
      clearInterval(hb);
    };
  }, [logEvent, idx, result]);

  // autosave answers
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const saveAnswer = useCallback((qid: string, response: unknown) => {
    setAnswers((prev) => ({ ...prev, [qid]: response }));
    clearTimeout(saveTimers.current[qid]);
    saveTimers.current[qid] = setTimeout(async () => {
      const { data: existing } = await supabase.from("answers").select("id").eq("attempt_id", attemptId).eq("question_id", qid).maybeSingle();
      if (existing) {
        await supabase.from("answers").update({ response: response as never }).eq("id", existing.id);
      } else {
        await supabase.from("answers").insert({ attempt_id: attemptId, question_id: qid, response: response as never });
      }
      setSavedAt(Date.now());
    }, 500);
  }, [attemptId]);

  const doSubmit = async (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await Promise.all(Object.values(saveTimers.current).map((t) => new Promise<void>((r) => { clearTimeout(t); r(); })));
      const res = await submitFn({ data: { attempt_id: attemptId } });
      // load per-question results
      const { data: qResults } = await supabase
        .from("answers")
        .select("question_id, is_correct, points_awarded, response")
        .eq("attempt_id", attemptId);
      if (qResults) {
        const rMap: Record<string, { is_correct: boolean | null; points_awarded: number | null; correct_answer: unknown }> = {};
        for (const a of qResults) {
          rMap[a.question_id] = { is_correct: a.is_correct as boolean | null, points_awarded: a.points_awarded as number | null, correct_answer: null };
        }
        // load correct answers from questions table
        const { data: correctData } = await supabase
          .from("questions")
          .select("id, correct_answer")
          .eq("exam_id", session!.exam_id);
        if (correctData) {
          for (const q of correctData) {
            if (rMap[q.id]) rMap[q.id].correct_answer = q.correct_answer;
          }
        }
        setQuestionResults(rMap);
      }
      setResult(res);
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
      toast.success(auto ? "Czas minął — egzamin wysłany" : "Egzamin wysłany pomyślnie");
    } catch (e) {
      submittedRef.current = false;
      toast.error(e instanceof Error ? e.message : "Błąd wysyłania");
    } finally {
      setSubmitting(false);
    }
  };

  const tryFullscreen = async () => {
    try { await document.documentElement.requestFullscreen(); } catch { /* ignore */ }
  };

  const stopScreenStream = useCallback(() => {
    const s = screenStreamRef.current;
    if (s) { s.getTracks().forEach((t) => t.stop()); screenStreamRef.current = null; }
    if (frameTimerRef.current) { clearInterval(frameTimerRef.current); frameTimerRef.current = null; }
    setScreenSharing(false);
  }, []);

  const requestScreenShare = useCallback(async () => {
    setScreenError(null);
    setScreenRequesting(true);
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("Twoja przeglądarka nie obsługuje udostępniania ekranu. Użyj Chrome/Edge na komputerze.");
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 5 },
        audio: false,
      });
      const track = stream.getVideoTracks()[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const settings = track?.getSettings?.() as any;
      if (settings && settings.displaySurface && settings.displaySurface !== "monitor") {
        stream.getTracks().forEach((t) => t.stop());
        setScreenError("Musisz udostępnić CAŁY ekran (nie pojedyncze okno ani kartę). Spróbuj ponownie i wybierz 'Cały ekran'.");
        logEvent("screen_share_wrong_surface", { surface: settings.displaySurface });
        return;
      }
      screenStreamRef.current = stream;
      setScreenSharing(true);
      logEvent("screen_share_started", { surface: settings?.displaySurface ?? "monitor" });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      track.addEventListener("ended", () => {
        screenStreamRef.current = null;
        setScreenSharing(false);
        if (frameTimerRef.current) { clearInterval(frameTimerRef.current); frameTimerRef.current = null; }
        logEvent("screen_share_stopped");
        toast.error("Zatrzymano udostępnianie ekranu — wznów, aby kontynuować egzamin");
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nie udało się włączyć udostępniania ekranu";
      setScreenError(msg);
      logEvent("screen_share_denied", { reason: msg });
    } finally {
      setScreenRequesting(false);
    }
  }, [logEvent]);

  const captureAndUploadFrame = useCallback(async () => {
    const video = videoRef.current;
    const stream = screenStreamRef.current;
    if (!video || !stream || video.readyState < 2 || !session) return;
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    const maxW = 800;
    const scale = Math.min(1, maxW / vw);
    canvas.width = Math.round(vw * scale);
    canvas.height = Math.round(vh * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.55);
    try {
      const { error } = await supabase.from("attempt_screen_frames").insert({
        attempt_id: attemptId,
        exam_id: session.exam_id,
        image_data: dataUrl,
      });
      if (error) { console.warn("[frame upload]", error.message); return; }
      setFramesSent((n) => n + 1);
    } catch (e) {
      console.warn("[frame upload]", e);
    }
  }, [attemptId, session]);

  useEffect(() => {
    if (!screenSharing || result) return;
    const kickoff = setTimeout(() => { void captureAndUploadFrame(); }, 2000);
    frameTimerRef.current = setInterval(() => { void captureAndUploadFrame(); }, 10000);
    return () => {
      clearTimeout(kickoff);
      if (frameTimerRef.current) { clearInterval(frameTimerRef.current); frameTimerRef.current = null; }
    };
  }, [screenSharing, result, captureAndUploadFrame]);

  useEffect(() => {
    return () => { stopScreenStream(); };
  }, [stopScreenStream]);
  useEffect(() => {
    if (result) stopScreenStream();
  }, [result, stopScreenStream]);

  const mmss = useMemo(() => {
    const m = Math.floor(secondsLeft / 60); const s = secondsLeft % 60;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }, [secondsLeft]);

  const certData: CertData | null = useMemo(() => {
    if (!result || !session) return null;
    return {
      attempt_id: attemptId,
      exam_title: session.exam_title,
      student_name: session.student_name,
      score: result.score,
      max_score: result.max_score,
      percent: result.percent,
      passed: result.passed,
      completed_at: new Date().toISOString(),
    };
  }, [result, session, attemptId]);

  const certSerial = useMemo(() => certData ? generateSerial(certData) : null, [certData]);

  // error state
  if (error) {
    return (
      <div className="min-h-screen bg-aurora text-white flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-300 mb-3" />
          <p className="text-red-300 mb-4">{error}</p>
          <Link to="/auth/student" className="text-accent hover:underline">← Wróć do logowania</Link>
        </div>
      </div>
    );
  }

  if (!questions || !session) {
    return <div className="min-h-screen bg-aurora text-white flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  // results screen
  if (result) {
    return (
      <ResultsScreen
        result={result}
        session={session}
        questions={questions}
        answers={answers}
        questionResults={questionResults}
        showDetails={showResultDetails}
        setShowDetails={setShowResultDetails}
        certData={certData}
        certSerial={certSerial}
        onFinish={() => { sessionStorage.removeItem("edunex_student"); navigate({ to: "/" }); }}
      />
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-aurora text-white flex items-center justify-center p-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="mb-4">Ten egzamin nie ma jeszcze pytań.</p>
          <Link to="/" className="text-accent hover:underline">← Wróć</Link>
        </div>
      </div>
    );
  }

  // === WELCOME SCREEN ===
  if (showWelcome) {
    return (
      <WelcomeScreen
        session={session}
        questions={questions}
        onStart={() => setShowWelcome(false)}
      />
    );
  }

  // === SCREEN SHARE GATE ===
  if (!screenSharing) {
    return (
      <div className="min-h-screen bg-aurora text-white flex items-center justify-center p-6">
        <Toaster />
        <div className="max-w-lg w-full bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-24 h-28 opacity-[0.04] pointer-events-none">
            <svg viewBox="0 0 400 500" fill="white" className="w-full h-full">
              <path d="M200 20C180 20 160 35 155 55L150 70C145 80 140 85 130 90L120 95C110 100 105 110 105 120L105 135C105 145 110 150 120 150L125 150C130 150 135 145 140 140L145 135C150 130 155 130 160 135L165 140C170 145 175 145 180 140L185 135C190 130 195 130 200 135C205 130 210 130 215 135L220 140C225 145 230 145 235 140L240 135C245 130 250 130 255 135L260 140C265 145 270 150 275 150L280 150C290 150 295 145 295 135L295 120C295 110 290 100 280 95L270 90C260 85 255 80 250 70L245 55C240 35 220 20 200 20Z" />
              <rect x="160" y="30" width="80" height="8" rx="2" />
            </svg>
          </div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center">
            <MonitorUp className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Udostępnij ekran, aby rozpocząć</h1>
          <p className="text-white/60 mb-6 text-sm leading-relaxed">
            Egzamin <span className="font-semibold text-white">{session.exam_title}</span> wymaga udostępnienia <strong>całego ekranu</strong> przez cały czas trwania.
            Nauczyciel monitoruje udostępnienie w czasie rzeczywistym. Zatrzymanie udostępniania zostanie zarejestrowane.
          </p>
          {screenError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-sm flex items-start gap-2 text-left">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{screenError}</span>
            </div>
          )}
          <button
            onClick={requestScreenShare}
            disabled={screenRequesting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-semibold"
          >
            {screenRequesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScreenShare className="w-5 h-5" />}
            {screenRequesting ? "Czekam na zgodę..." : "Udostępnij ekran i rozpocznij"}
          </button>
          <p className="text-[11px] text-white/40 mt-4">W oknie przeglądarki wybierz opcję „Cały ekran".</p>
        </div>
      </div>
    );
  }

  // === REVIEW SCREEN ===
  if (showReview) {
    return (
      <ReviewScreen
        questions={questions}
        answers={answers}
        flagged={flagged}
        session={session}
        submitting={submitting}
        onBack={() => setShowReview(false)}
        onSubmit={() => doSubmit(false)}
      />
    );
  }

  // === MAIN EXAM VIEW ===
  const q = questions[idx];
  const answered = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const lowTime = secondsLeft < 60;
  const toggleFlag = () => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }));

  const goToQuestion = (i: number) => {
    setTransitionDir(i > idx ? "right" : "left");
    setIdx(i);
  };

  return (
    <div className="min-h-screen bg-aurora text-white select-none" style={{ userSelect: "none" }}>
      <Toaster />
      <StudentTools attemptId={attemptId} />
      <video ref={videoRef} muted playsInline className="hidden" />

      {/* Time warning toast */}
      {activeWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500/90 to-amber-500/90 backdrop-blur-xl border border-red-400/50 shadow-2xl shadow-red-500/20 flex items-center gap-3 text-sm font-semibold text-white">
            <AlertTriangle className="w-5 h-5" />
            {activeWarning}
          </div>
        </div>
      )}

      {/* sticky top bar */}
      <div className="sticky top-0 z-30 bg-[#070b1a]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{session.exam_title}</div>
            <div className="text-[11px] text-white/50 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2.5 rounded-sm bg-white" />
                <span className="inline-block w-2 h-2.5 rounded-sm bg-red-500" />
              </span>
              <span>{session.student_name}</span>
              <span>·</span>
              <span className={flaggedCount > 0 ? "text-amber-300" : ""}>{answered}/{questions.length} odpowiedzi</span>
              {flaggedCount > 0 && <><span>·</span><span className="text-amber-300">⚑ {flaggedCount} do przeglądu</span></>}
              {savedAt && <><span>·</span><span className="text-emerald-300 inline-flex items-center gap-1"><Save className="w-3 h-3"/>zapisano</span></>}
              <span>·</span>
              <span className="text-accent">{framesSent} klatek</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-200" title="Udostępnianie ekranu aktywne">
              <ScreenShare className="w-3.5 h-3.5" /> Ekran
            </div>
            {!fullscreen && (
              <button onClick={tryFullscreen} className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 hover:bg-amber-500/25">
                <Maximize className="w-3.5 h-3.5"/> Pełny ekran
              </button>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm border ${lowTime ? "bg-red-500/15 text-red-200 border-red-400/30 animate-pulse" : "bg-white/5 text-accent border-white/10"}`}>
              <Clock className="w-4 h-4"/> {mmss}
            </div>
            <button
              onClick={async () => {
                setShowReview(true);
              }}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:brightness-110 text-slate-900 text-sm font-semibold disabled:opacity-50 transition"
            >
              <ListChecks className="w-4 h-4"/>Przejrzyj i wyślij
            </button>
          </div>
        </div>
        <div className="h-1 bg-white/5">
          <div className="h-full bg-gradient-to-r from-accent to-blue-500 transition-all" style={{ width: `${(answered/questions.length)*100}%` }}/>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main column */}
        <div className="min-w-0">
          <div key={q.id} className="animate-fadeIn bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent font-mono px-2 py-1 rounded-md bg-accent/10 border border-accent/20">
                  {typeIcon(q.question_type)}{labelForType(q.question_type)}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-amber-300 font-mono">{q.points} pkt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {questions.map((qq, i) => (
                    <button
                      key={qq.id}
                      onClick={() => goToQuestion(i)}
                      className={`w-2 h-2 rounded-full transition ${
                        i === idx ? "bg-cyan-400 scale-125" :
                        answers[qq.id] !== undefined && answers[qq.id] !== "" ? "bg-emerald-400/60" :
                        "bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
                <button onClick={toggleFlag} className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded border transition ${flagged[q.id] ? "bg-amber-500/20 border-amber-400/50 text-amber-200" : "bg-white/5 border-white/15 text-white/60 hover:text-white"}`}>
                  <Flag className="w-3 h-3"/>{flagged[q.id] ? "Oznaczone" : "Oznacz"}
                </button>
              </div>
            </div>
            <h2 className="text-xl font-medium leading-relaxed mb-5 whitespace-pre-wrap">{q.prompt}</h2>
            {q.media_url && <img src={q.media_url} alt="" className="rounded-xl mb-5 max-h-96 mx-auto" />}
            <QuestionRenderer q={q} value={answers[q.id]} onChange={(v) => saveAnswer(q.id, v)} />
          </div>

          <div className="flex items-center justify-between mt-6">
            <button onClick={() => goToQuestion(Math.max(0, idx-1))} disabled={idx===0} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 text-sm transition">
              <ChevronLeft className="w-4 h-4"/>Poprzednie
            </button>
            <div className="text-xs text-white/40 font-mono">
              {idx+1}/{questions.length} · {answered} odp. {flaggedCount > 0 && `· ${flaggedCount}⚑`}
            </div>
            {idx < questions.length-1 ? (
              <button onClick={() => goToQuestion(Math.min(questions.length-1, idx+1))} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:brightness-110 text-white font-semibold text-sm transition">
                Następne<ChevronRight className="w-4 h-4"/>
              </button>
            ) : (
              <button
                onClick={() => setShowReview(true)}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:brightness-110 text-slate-900 font-semibold text-sm disabled:opacity-50 transition"
              >
                <ListChecks className="w-4 h-4"/>Przejrzyj i wyślij
              </button>
            )}
          </div>
        </div>

        {/* Side panel */}
        <aside className="lg:sticky lg:top-20 lg:self-start space-y-4">
          {/* Question palette */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-widest text-white/60 font-semibold">Pytania</h3>
              <span className="text-[10px] text-white/40 font-mono">{answered}/{questions.length}</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {questions.map((qq, i) => {
                const isCurrent = i === idx;
                const isAns = answers[qq.id] !== undefined && answers[qq.id] !== "" && !(Array.isArray(answers[qq.id]) && (answers[qq.id] as unknown[]).length === 0);
                const isFlagged = flagged[qq.id];
                return (
                  <button key={qq.id} onClick={() => goToQuestion(i)} title={`Pytanie ${i+1}${isFlagged ? " (oznaczone)" : ""}`}
                    className={`relative w-9 h-9 rounded-md text-xs font-mono border transition-all ${
                      isCurrent ? "bg-cyan-500 text-slate-900 border-accent ring-2 ring-accent/50 scale-110"
                      : isAns ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/30"
                      : "bg-white/5 text-white/50 border-white/10 hover:border-white/30"
                    }`}>
                    {i+1}
                    {isFlagged && <Flag className="absolute -top-1 -right-1 w-2.5 h-2.5 text-amber-400 fill-amber-400"/>}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] text-white/50">
              <Legend color="bg-cyan-500" label="Aktualne"/>
              <Legend color="bg-emerald-500/40" label="Odpowiedziane"/>
              <Legend color="bg-white/10" label="Bez odp."/>
              <Legend color="bg-amber-400" label="⚑ Do przeglądu"/>
            </div>
          </div>

          {/* Timer breakdown */}
          {session && (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
              <h3 className="text-xs uppercase tracking-widest text-white/60 font-semibold mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-accent"/>Czas
              </h3>
              <TimerBreakdown total={session.duration_minutes * 60} left={secondsLeft} />
            </div>
          )}

          {/* Live screen preview */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-widest text-white/60 font-semibold flex items-center gap-1.5">
                <ScreenShare className="w-3 h-3 text-emerald-300"/>Podgląd ekranu
              </h3>
              <button onClick={() => setShowPreview((v) => !v)} className="text-white/40 hover:text-white">
                {showPreview ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
              </button>
            </div>
            {showPreview ? (
              <ScreenPreview stream={screenStreamRef.current} active={screenSharing}/>
            ) : (
              <p className="text-[11px] text-white/40 text-center py-4">Podgląd ukryty</p>
            )}
            <p className="text-[10px] text-white/40 mt-2">Klatka co 10 s · wysłano: <span className="text-accent font-mono">{framesSent}</span></p>
          </div>

          {/* Quick status */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 text-[11px] text-white/60 space-y-1.5">
            <div className="flex justify-between"><span>Pełny ekran</span><span className={fullscreen ? "text-emerald-300" : "text-amber-300"}>{fullscreen ? "Tak" : "Nie"}</span></div>
            <div className="flex justify-between"><span>Udostępnianie</span><span className={screenSharing ? "text-emerald-300" : "text-red-300"}>{screenSharing ? "Aktywne" : "Zatrzymane"}</span></div>
            <div className="flex justify-between"><span>Autozapis</span><span className="text-emerald-300">Co 0,5 s</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================ WELCOME SCREEN ============================ */
function WelcomeScreen({ session, questions, onStart }: { session: Session; questions: Question[]; onStart: () => void }) {
  const totalPoints = questions.reduce((s, q) => s + q.points, 0);
  const typesCount = useMemo(() => {
    const m: Record<string, number> = {};
    for (const q of questions) m[q.question_type] = (m[q.question_type] || 0) + 1;
    return m;
  }, [questions]);

  return (
    <div className="min-h-screen bg-aurora text-white flex items-center justify-center p-4 md:p-6">
      <div className="max-w-2xl w-full bg-white/[0.03] backdrop-blur border border-white/10 rounded-3xl overflow-hidden relative animate-fadeIn">
        {/* Decorative gradient */}
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative p-8 md:p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center shadow-lg shadow-accent/20">
                <FileText className="w-7 h-7 text-slate-900" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono tracking-wider mb-1">
                  <GraduationCap className="w-3 h-3" />EduNex
                </div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">{session.exam_title}</h1>
              </div>
            </div>
          </div>

          {/* Student info */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-sm">
              <UserIcon className="w-4 h-4 text-accent" />
              <span className="text-white/90">{session.student_name}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-sm">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-white/90">{session.duration_minutes} min</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-400/20 text-sm">
              <Layers className="w-4 h-4 text-amber-300" />
              <span className="text-white/90">{questions.length} pytań · {totalPoints} pkt</span>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="text-xs uppercase tracking-widest text-accent font-semibold mb-3 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />Rodzaje pytań
              </h3>
              <div className="space-y-2">
                {Object.entries(typesCount).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-white/70">
                      {typeIcon(type as QuestionType)}
                      {labelForType(type as QuestionType)}
                    </span>
                    <span className="font-mono text-white/50">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />Zasady
              </h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex gap-2"><span className="text-emerald-300">•</span> Udostępnienie całego ekranu</li>
                <li className="flex gap-2"><span className="text-emerald-300">•</span> Tryb pełnoekranowy</li>
                <li className="flex gap-2"><span className="text-emerald-300">•</span> Klawisze Ctrl+C/V/F12 zablokowane</li>
                <li className="flex gap-2"><span className="text-emerald-300">•</span> Automatyczny zapis co 0,5 s</li>
                <li className="flex gap-2"><span className="text-emerald-300">•</span> Po czasie — automatyczne wysłanie</li>
              </ul>
            </div>
          </div>

          {/* Tips */}
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-accent/5 via-accent/5 to-accent/5 border border-white/[0.06]">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-white mb-1">Wskazówki</div>
                <ul className="text-xs text-white/60 space-y-1">
                  <li>⚑ Oznaczaj trudne pytania flagą — wrócisz do nich przed wysłaniem</li>
                  <li>Korzystaj z narzędzi: kalkulator, notatki, zmiana rozmiaru tekstu (prawy dolny róg)</li>
                  <li>Postęp zapisywany jest automatycznie — możesz bezpiecznie kontynuować</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button onClick={onStart} className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent to-blue-500 hover:brightness-110 text-slate-900 font-bold text-lg transition shadow-xl shadow-accent/20">
            <Zap className="w-5 h-5" />Rozpocznij egzamin
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ REVIEW SCREEN ============================ */
function ReviewScreen({
  questions, answers, flagged, session, submitting, onBack, onSubmit,
}: {
  questions: Question[]; answers: Record<string, unknown>; flagged: Record<string, boolean>;
  session: Session; submitting: boolean; onBack: () => void; onSubmit: () => void;
}) {
  const totalPts = questions.reduce((s, q) => s + q.points, 0);
  const answered = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unanswered = questions.filter((q) => answers[q.id] === undefined || answers[q.id] === "" || (Array.isArray(answers[q.id]) && (answers[q.id] as unknown[]).length === 0));

  return (
    <div className="min-h-screen bg-aurora text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 border border-white/10 rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[10px] font-mono tracking-wider mb-2">
                <ClipboardCheck className="w-3 h-3" />PRZEGLĄD
              </div>
              <h1 className="text-2xl font-display font-bold">{session.exam_title}</h1>
              <p className="text-sm text-white/60 mt-1">Przejrzyj odpowiedzi przed wysłaniem</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onBack} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition">
                <ChevronLeft className="w-4 h-4" />Wróć
              </button>
              <button
                onClick={async () => {
                  if (await confirmDialog({ title: "Potwierdź wysłanie", description: unanswered.length > 0 ? `${unanswered.length} pytań bez odpowiedzi. Wysłać mimo to?` : "Wysłać egzamin?" })) onSubmit();
                }}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:brightness-110 text-slate-900 font-semibold text-sm disabled:opacity-50 transition"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Wysyłanie..." : "Potwierdź i wyślij"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <ReviewStat icon={CheckCircle2} label="Odpowiedziane" value={`${answered}/${questions.length}`} color="text-emerald-300" />
          <ReviewStat icon={HelpCircle} label="Bez odpowiedzi" value={String(unanswered.length)} color={unanswered.length > 0 ? "text-amber-300" : "text-emerald-300"} />
          <ReviewStat icon={Flag} label="Oznaczone" value={String(flaggedCount)} color={flaggedCount > 0 ? "text-amber-300" : "text-white/50"} />
          <ReviewStat icon={Layers} label="Punkty" value={`${totalPts} max`} color="text-cyan-300" />
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-white/50 mb-1.5">
            <span>Postęp odpowiedzi</span>
            <span>{Math.round((answered/questions.length)*100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-blue-500 transition-all" style={{ width: `${(answered/questions.length)*100}%` }} />
          </div>
        </div>

        {/* Question list */}
        <div className="space-y-3">
          {questions.map((q, i) => {
            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "" && !(Array.isArray(answers[q.id]) && (answers[q.id] as unknown[]).length === 0);
            const isFlagged = flagged[q.id];
            return (
              <div key={q.id} className={`rounded-2xl border p-5 transition ${
                isAnswered ? "bg-white/[0.02] border-white/10" : "bg-amber-500/5 border-amber-400/20"
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-mono text-accent">#{i+1}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-white/50 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                        {typeIcon(q.question_type)}{labelForType(q.question_type)}
                      </span>
                      <span className="text-[10px] text-amber-300/70">{q.points} pkt</span>
                    </div>
                    <p className="text-sm text-white/80 line-clamp-2">{q.prompt}</p>
                    {isAnswered && (
                      <p className="text-xs text-emerald-300/70 mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />Odpowiedź udzielona
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {isFlagged && <span className="text-amber-300 text-xs flex items-center gap-1"><Flag className="w-3 h-3 fill-amber-300"/>Do przeglądu</span>}
                    {!isAnswered && <span className="text-amber-400 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>Brak odpowiedzi</span>}
                    {isAnswered && <span className="text-emerald-300 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/>Odpowiedziano</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={onBack} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition">
            <ChevronLeft className="w-4 h-4" />Wróć do egzaminu
          </button>
          <button
            onClick={async () => {
              if (await confirmDialog({ title: "Potwierdź wysłanie", description: unanswered.length > 0 ? `${unanswered.length} pytań bez odpowiedzi. Wysłać mimo to?` : "Wysłać egzamin?" })) onSubmit();
            }}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:brightness-110 text-slate-900 font-semibold text-sm disabled:opacity-50 transition shadow-lg shadow-accent/20"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Wysyłanie..." : "Potwierdź i wyślij egzamin"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ RESULTS SCREEN ============================ */
function ResultsScreen({
  result, session, questions, answers, questionResults, showDetails, setShowDetails, certData, certSerial, onFinish,
}: {
  result: { score: number; max_score: number; percent: number; passed: boolean };
  session: Session; questions: Question[]; answers: Record<string, unknown>;
  questionResults: Record<string, { is_correct: boolean | null; points_awarded: number | null; correct_answer: unknown }>;
  showDetails: boolean; setShowDetails: (v: boolean) => void; certData: CertData | null; certSerial: string | null; onFinish: () => void;
}) {
  const gradeColor = result.passed ? "from-emerald-400 to-green-600" : "from-red-400 to-pink-600";
  const gradeEmoji = result.passed ? "✨" : "💪";
  const correctCount = Object.values(questionResults).filter((r) => r.is_correct === true).length;
  const wrongCount = Object.values(questionResults).filter((r) => r.is_correct === false).length;
  const ungradedCount = Object.values(questionResults).filter((r) => r.is_correct === null).length;

  return (
    <div className="min-h-screen bg-aurora text-white p-4 md:p-6 flex items-center justify-center">
      <Toaster />
      <div className="max-w-2xl w-full animate-fadeIn">
        {/* Trophy card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur p-8 text-center mb-6">
          {/* Decorative glow */}
          <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${gradeColor} opacity-20 blur-3xl`} />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-br from-accent to-blue-500 opacity-10 blur-3xl" />

          <div className="relative">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${gradeColor} grid place-items-center shadow-xl`}>
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-1">
              {result.passed ? "Zaliczone!" : "Niezaliczone"}
            </h1>
            <p className="text-white/60 mb-2">{session.exam_title}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
              {session.student_name} · {gradeEmoji}
            </div>

            {/* Score circle */}
            <div className="flex justify-center my-8">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGrad)" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={`${(result.percent/100) * 327} 327`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={result.passed ? "#34d399" : "#f87171"} />
                      <stop offset="100%" stopColor={result.passed ? "#06b6d4" : "#ec4899"} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-display">{result.percent}%</span>
                  <span className="text-xs text-white/50">{result.score}/{result.max_score}</span>
                </div>
              </div>
            </div>

            {/* Mini stat row */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
              <MiniStat icon={CheckCircle2} label="Poprawne" value={String(correctCount)} color="text-emerald-300" />
              <MiniStat icon={XCircle} label="Błędne" value={String(wrongCount)} color="text-pink-300" />
              <MiniStat icon={Clock} label="Do oceny" value={String(ungradedCount)} color="text-amber-300" />
            </div>

            {/* Certificate for passed exams */}
            {certData && certSerial && result.passed && (
              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-emerald-500/10 border border-emerald-400/20">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-5 h-5 text-emerald-300" />
                  <span className="text-sm font-semibold text-emerald-200">Certyfikat ukończenia</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={getQrUrl(certSerial, 100)}
                    alt="QR"
                    className="rounded-xl border border-white/10 bg-white"
                    width={100}
                    height={100}
                  />
                  <div className="text-left flex-1">
                    <p className="text-xs text-white/50 mb-1">Nr seryjny</p>
                    <p className="text-sm font-mono text-accent">{certSerial}</p>
                    <p className="text-[10px] text-white/40 mt-1">Zweryfikuj online lub pobierz PDF</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => downloadCertPdf(certData, certSerial)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold transition"
                      >
                        <Download className="w-3.5 h-3.5" />Pobierz PDF
                      </button>
                      <a
                        href={`/verify/${certSerial}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />Zweryfikuj
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={onFinish} className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold transition shadow-lg shadow-red-500/20">
              Zakończ
            </button>
          </div>
        </div>

        {/* Per-question details toggle */}
        {questions.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <ListChecks className="w-4 h-4 text-accent" />
                Szczegółowe wyniki
              </span>
              <ChevronRight className={`w-4 h-4 text-white/40 transition ${showDetails ? "rotate-90" : ""}`} />
            </button>
            {showDetails && (
              <div className="border-t border-white/10 divide-y divide-white/5 animate-fadeIn">
                {questions.map((q, i) => {
                  const r = questionResults[q.id];
                  const isCorrect = r?.is_correct;
                  const isUngraded = r?.is_correct === null;
                  return (
                    <div key={q.id} className="p-4 hover:bg-white/[0.01] transition">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full grid place-items-center shrink-0 ${
                          isCorrect === true ? "bg-emerald-500/20 text-emerald-300" :
                          isCorrect === false ? "bg-pink-500/20 text-pink-300" :
                          "bg-amber-500/20 text-amber-300"
                        }`}>
                          {isCorrect === true ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                           isCorrect === false ? <XCircle className="w-3.5 h-3.5" /> :
                           <Clock className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-accent">#{i+1}</span>
                            <span className="text-[10px] text-white/50 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                              {labelForType(q.question_type)}
                            </span>
                            <span className="text-[10px] text-amber-300/70">{q.points} pkt</span>
                            {r?.points_awarded != null && (
                              <span className="text-[10px] text-emerald-300/70">{r.points_awarded}/{q.points} pkt</span>
                            )}
                          </div>
                          <p className="text-sm text-white/80 line-clamp-2">{q.prompt}</p>
                          {isCorrect === false && r?.correct_answer != null && (
                            <div className="mt-1.5 text-xs text-emerald-300/80 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              Poprawna odpowiedź: <span className="font-mono text-white/70">{String(r.correct_answer)}</span>
                            </div>
                          )}
                          {isUngraded && (
                            <p className="mt-1 text-xs text-amber-300/70">Oczekuje na ocenę nauczyciela</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ TIMER BREAKDOWN ============================ */
function TimerBreakdown({ total, left }: { total: number; left: number }) {
  const pct = Math.max(0, (left / total) * 100);
  const elapsed = total - left;
  const color = left < 60 ? "from-red-500 to-amber-500" : left < total * 0.15 ? "from-amber-500 to-orange-500" : "from-cyan-400 to-emerald-400";
  return (
    <div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-2">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-white/40 font-mono">
        <span>Pozostało: {Math.floor(left/60)}m {left%60}s</span>
        <span>Upłynęło: {Math.floor(elapsed/60)}m {elapsed%60}s</span>
      </div>
    </div>
  );
}

/* ============================ SHARED COMPONENTS ============================ */
function Legend({ color, label }: { color: string; label: string }) {
  return <div className="flex items-center gap-1.5"><span className={`inline-block w-2.5 h-2.5 rounded ${color}`}/>{label}</div>;
}

function ScreenPreview({ stream, active }: { stream: MediaStream | null; active: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
      ref.current.play().catch(() => undefined);
    }
  }, [stream]);
  if (!active || !stream) {
    return <div className="aspect-video rounded-lg bg-black/40 border border-white/10 grid place-items-center text-[11px] text-white/30">brak sygnału</div>;
  }
  return <video ref={ref} muted playsInline className="w-full aspect-video rounded-lg bg-black border border-white/10 object-contain"/>;
}

function MiniStat({ icon: Icon, label, value, color }: { icon: React.ComponentType<{className?:string}>; label: string; value: string; color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[10px] text-white/50">{label}</div>
    </div>
  );
}

function ReviewStat({ icon: Icon, label, value, color }: { icon: React.ComponentType<{className?:string}>; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
      <Icon className={`w-4 h-4 mb-1 ${color}`} />
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] text-white/50">{label}</div>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}

function typeIcon(t: QuestionType) {
  const size = "w-3 h-3";
  switch (t) {
    case "single_choice": return <CheckSquare className={size} />;
    case "multiple_choice": return <CheckSquare className={size} />;
    case "true_false": return <CheckCircle2 className={size} />;
    case "short_answer": return <Type className={size} />;
    case "essay": return <AlignLeft className={size} />;
    case "matching": return <Shuffle className={size} />;
    case "drag_drop": return <ListOrdered className={size} />;
    case "fill_in_blank": return <Hash className={size} />;
    case "ordering": return <ListOrdered className={size} />;
    case "numeric": return <Hash className={size} />;
    case "code": return <Code className={size} />;
    case "hotspot": return <HelpCircle className={size} />;
    default: return <HelpCircle className={size} />;
  }
}

function labelForType(t: QuestionType) {
  const m: Record<QuestionType, string> = {
    single_choice: "Jednokrotny wybór", multiple_choice: "Wielokrotny wybór", true_false: "Prawda/Fałsz",
    short_answer: "Krótka odpowiedź", essay: "Esej", matching: "Dopasowanie", drag_drop: "Przeciągnij i upuść",
    fill_in_blank: "Uzupełnij luki", ordering: "Uporządkuj", numeric: "Numeryczna", code: "Kod", hotspot: "Hotspot",
  };
  return m[t] ?? t;
}

/* ============================ QUESTION RENDERERS ============================ */
function QuestionRenderer({ q, value, onChange }: { q: Question; value: unknown; onChange: (v: unknown) => void }) {
  const opts = Array.isArray(q.options) ? (q.options as unknown[]) : [];
  switch (q.question_type) {
    case "single_choice": {
      const selected = value as string | undefined;
      return (
        <div className="space-y-2">
          {opts.map((o, i) => {
            const text = typeof o === "string" ? o : (o as { text?: string }).text ?? String(o);
            return (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${selected===text?"bg-cyan-500/15 border-cyan-400/50":"bg-white/5 border-white/10 hover:border-white/30"}`}>
                <input type="radio" name={q.id} checked={selected===text} onChange={() => onChange(text)} className="accent-cyan-400"/>
                <span>{text}</span>
              </label>
            );
          })}
        </div>
      );
    }
    case "multiple_choice": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-2">
          {opts.map((o, i) => {
            const text = typeof o === "string" ? o : (o as { text?: string }).text ?? String(o);
            const checked = arr.includes(text);
            return (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${checked?"bg-cyan-500/15 border-cyan-400/50":"bg-white/5 border-white/10 hover:border-white/30"}`}>
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked ? [...arr, text] : arr.filter((x) => x!==text))} className="accent-cyan-400"/>
                <span>{text}</span>
              </label>
            );
          })}
        </div>
      );
    }
    case "true_false": {
      const v = value as string | undefined;
      return (
        <div className="grid grid-cols-2 gap-3">
          {["Prawda","Fałsz"].map((lab) => (
            <button key={lab} onClick={() => onChange(lab === "Prawda" ? "true" : "false")}
              className={`p-4 rounded-xl border font-semibold transition ${ (v==="true"&&lab==="Prawda")||(v==="false"&&lab==="Fałsz") ? "bg-cyan-500/20 border-cyan-400/60" : "bg-white/5 border-white/10 hover:border-white/30"}`}>
              {lab === "Prawda" ? <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-300"/> : <XCircle className="w-6 h-6 mx-auto mb-1 text-pink-300"/>}
              {lab}
            </button>
          ))}
        </div>
      );
    }
    case "short_answer":
    case "numeric":
      return <input type={q.question_type==="numeric"?"number":"text"} value={(value as string) ?? ""} onChange={(e)=>onChange(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 outline-none"/>;
    case "essay":
    case "code":
      return <textarea value={(value as string) ?? ""} onChange={(e)=>onChange(e.target.value)} rows={q.question_type==="code"?10:6} spellCheck={q.question_type!=="code"} className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 outline-none ${q.question_type==="code"?"font-mono text-sm":""}`} placeholder={q.question_type==="code"?"// Twój kod...":"Twoja odpowiedź..."}/>;
    case "ordering":
    case "drag_drop": {
      const items = Array.isArray(value) && (value as unknown[]).length ? (value as string[]) : opts.map((o) => typeof o==="string"?o:(o as {text?:string}).text ?? String(o));
      const move = (i: number, dir: -1 | 1) => {
        const next = [...items]; const j = i+dir; if (j<0||j>=next.length) return;
        [next[i], next[j]] = [next[j], next[i]]; onChange(next);
      };
      return (
        <ol className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="font-mono text-xs text-cyan-300 w-6">{i+1}.</span>
              <span className="flex-1">{it}</span>
              <button onClick={()=>move(i,-1)} disabled={i===0} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"><ChevronLeft className="w-4 h-4 rotate-90"/></button>
              <button onClick={()=>move(i,1)} disabled={i===items.length-1} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"><ChevronRight className="w-4 h-4 rotate-90"/></button>
            </li>
          ))}
        </ol>
      );
    }
    case "fill_in_blank": {
      const v = (value as Record<string,string>) ?? {};
      const parts = q.prompt.split(/(_{2,})/g);
      let blankIdx = 0;
      return (
        <div className="leading-loose text-lg">
          {parts.map((p, i) => {
            if (/^_{2,}$/.test(p)) {
              const k = `b${blankIdx++}`;
              return <input key={i} value={v[k] ?? ""} onChange={(e)=>onChange({ ...v, [k]: e.target.value })} className="inline-block mx-1 px-2 py-1 w-32 bg-white/10 border-b-2 border-cyan-400 outline-none text-cyan-100 rounded-t"/>;
            }
            return <span key={i}>{p}</span>;
          })}
        </div>
      );
    }
    case "matching": {
      const v = (value as Record<string,string>) ?? {};
      const pairs = (opts as Array<{ left?: string; right?: string }>);
      const rights = pairs.map((p) => p.right ?? "").filter(Boolean);
      return (
        <div className="space-y-2">
          {pairs.map((p, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 items-center">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">{p.left}</div>
              <select value={v[p.left ?? ""] ?? ""} onChange={(e)=>onChange({ ...v, [p.left ?? ""]: e.target.value })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 outline-none">
                <option value="">— wybierz —</option>
                {rights.map((r,j)=><option key={j} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      );
    }
    case "hotspot":
      return (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-400/30 grid place-items-center mb-3">
            <HelpCircle className="w-5 h-5 text-amber-300" />
          </div>
          <p className="text-white/50 text-sm">Ten typ pytania (hotspot) nie jest jeszcze obsługiwany interaktywnie.</p>
        </div>
      );
    default:
      return <p className="text-white/50 text-sm">Nieznany typ pytania: {q.question_type}</p>;
  }
}
