import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X, Check, GripVertical } from "lucide-react";

export type QType =
  | "single_choice" | "multiple_choice" | "true_false" | "short_answer" | "essay"
  | "matching" | "drag_drop" | "fill_in_blank" | "ordering" | "numeric" | "code" | "hotspot";

export const QUESTION_TYPE_LABELS: Record<QType, string> = {
  single_choice: "Jednokrotny wybór",
  multiple_choice: "Wielokrotny wybór",
  true_false: "Prawda/Fałsz",
  short_answer: "Krótka odpowiedź",
  essay: "Esej",
  matching: "Dopasowanie",
  drag_drop: "Przeciągnij i upuść",
  fill_in_blank: "Uzupełnij luki",
  ordering: "Uporządkuj",
  numeric: "Numeryczna",
  code: "Kod",
  hotspot: "Hotspot (obraz)",
};

export const QUESTION_TYPE_ICONS: Record<QType, string> = {
  single_choice: "🔘", multiple_choice: "☑️", true_false: "✓✗",
  short_answer: "✏️", essay: "📝", matching: "🔗", drag_drop: "🖱️",
  fill_in_blank: "▭▭▭", ordering: "↕️", numeric: "🔢", code: "💻", hotspot: "🎯",
};

interface Props {
  type: QType;
  options: unknown;
  correctAnswer: unknown;
  onChange: (patch: { options?: unknown; correct_answer?: unknown }) => void;
  onBlur?: () => void;
}

export function QuestionTypeEditor({ type, options, correctAnswer, onChange, onBlur }: Props) {
  const opts = Array.isArray(options) ? (options as unknown[]) : [];

  // Choice types
  if (type === "single_choice" || type === "multiple_choice" || type === "true_false") {
    const stringOpts = opts as string[];
    const correctIdx = correctAnswer;
    const isCorrect = (i: number) =>
      type === "multiple_choice"
        ? Array.isArray(correctIdx) && (correctIdx as number[]).includes(i)
        : correctIdx === i;

    const toggleCorrect = (i: number) => {
      if (type === "multiple_choice") {
        const arr = Array.isArray(correctIdx) ? [...(correctIdx as number[])] : [];
        const next = arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i];
        onChange({ correct_answer: next });
      } else {
        onChange({ correct_answer: i });
      }
    };

    return (
      <div className="space-y-2">
        {stringOpts.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <Button type="button" variant={isCorrect(i) ? "default" : "outline"} size="icon"
              className="shrink-0" onClick={() => toggleCorrect(i)}>
              <Check className="h-4 w-4" />
            </Button>
            <Input value={opt} onChange={(e) => {
              const next = [...stringOpts]; next[i] = e.target.value;
              onChange({ options: next });
            }} onBlur={onBlur} placeholder={`Opcja ${String.fromCharCode(65 + i)}`} />
            {type !== "true_false" && (
              <Button type="button" variant="ghost" size="icon" onClick={() => {
                onChange({ options: stringOpts.filter((_, x) => x !== i) });
              }}><X className="h-4 w-4" /></Button>
            )}
          </div>
        ))}
        {type !== "true_false" && (
          <Button type="button" variant="outline" size="sm" onClick={() => {
            onChange({ options: [...stringOpts, `Opcja ${String.fromCharCode(65 + stringOpts.length)}`] });
          }}><Plus className="h-3.5 w-3.5 mr-1" /> Dodaj opcję</Button>
        )}
      </div>
    );
  }

  // Short / essay
  if (type === "short_answer" || type === "essay") {
    return (
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          {type === "essay" ? "Wzorcowa odpowiedź / kryteria oceny (dla AI):" : "Akceptowane odpowiedzi (oddziel | )"}
        </Label>
        <Textarea
          value={typeof correctAnswer === "string" ? correctAnswer : ""}
          onChange={(e) => onChange({ correct_answer: e.target.value })}
          onBlur={onBlur} rows={type === "essay" ? 4 : 2}
          placeholder={type === "short_answer" ? "Warszawa | Stolica Polski" : "Pełna odpowiedź wzorcowa..."}
        />
      </div>
    );
  }

  // Numeric
  if (type === "numeric") {
    const ca = (correctAnswer as { value?: number; tolerance?: number; unit?: string }) || {};
    return (
      <div className="grid grid-cols-3 gap-2">
        <div><Label className="text-xs">Wartość</Label>
          <Input type="number" value={ca.value ?? ""} onChange={(e) =>
            onChange({ correct_answer: { ...ca, value: parseFloat(e.target.value) } })} onBlur={onBlur} /></div>
        <div><Label className="text-xs">Tolerancja ±</Label>
          <Input type="number" value={ca.tolerance ?? 0} onChange={(e) =>
            onChange({ correct_answer: { ...ca, tolerance: parseFloat(e.target.value) || 0 } })} onBlur={onBlur} /></div>
        <div><Label className="text-xs">Jednostka</Label>
          <Input value={ca.unit ?? ""} onChange={(e) =>
            onChange({ correct_answer: { ...ca, unit: e.target.value } })} onBlur={onBlur} placeholder="kg, m/s..." /></div>
      </div>
    );
  }

  // Matching: options = [{left, right}]
  if (type === "matching") {
    const pairs = (opts as { left: string; right: string }[]) ?? [];
    return (
      <div className="space-y-2">
        {pairs.map((p, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input value={p.left} onChange={(e) => {
              const n = [...pairs]; n[i] = { ...p, left: e.target.value }; onChange({ options: n });
            }} onBlur={onBlur} placeholder="Pojęcie" />
            <span className="text-muted-foreground">↔</span>
            <Input value={p.right} onChange={(e) => {
              const n = [...pairs]; n[i] = { ...p, right: e.target.value }; onChange({ options: n });
            }} onBlur={onBlur} placeholder="Definicja" />
            <Button variant="ghost" size="icon" onClick={() => onChange({ options: pairs.filter((_, x) => x !== i) })}>
              <X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange({ options: [...pairs, { left: "", right: "" }] })}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj parę</Button>
      </div>
    );
  }

  // Drag & drop: options = [{item, target}]
  if (type === "drag_drop") {
    const items = (opts as { item: string; target: string }[]) ?? [];
    return (
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Element → docelowa kategoria</Label>
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <Input value={it.item} onChange={(e) => {
              const n = [...items]; n[i] = { ...it, item: e.target.value }; onChange({ options: n });
            }} onBlur={onBlur} placeholder="Element" />
            <Input value={it.target} onChange={(e) => {
              const n = [...items]; n[i] = { ...it, target: e.target.value }; onChange({ options: n });
            }} onBlur={onBlur} placeholder="Kategoria" />
            <Button variant="ghost" size="icon" onClick={() => onChange({ options: items.filter((_, x) => x !== i) })}>
              <X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange({ options: [...items, { item: "", target: "" }] })}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj element</Button>
      </div>
    );
  }

  // Fill in blank: prompt zawiera {{1}}, {{2}}, correct_answer = ["a","b"]
  if (type === "fill_in_blank") {
    const blanks = Array.isArray(correctAnswer) ? (correctAnswer as string[]) : [];
    return (
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          W treści pytania użyj <code className="bg-muted px-1 rounded">{`{{1}}`}</code>, <code className="bg-muted px-1 rounded">{`{{2}}`}</code>... dla luk.
        </Label>
        {blanks.map((b, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-xs w-10 self-center text-muted-foreground">{`{{${i + 1}}}`}</span>
            <Input value={b} onChange={(e) => {
              const n = [...blanks]; n[i] = e.target.value; onChange({ correct_answer: n });
            }} onBlur={onBlur} placeholder="Poprawna odpowiedź" />
            <Button variant="ghost" size="icon" onClick={() => onChange({ correct_answer: blanks.filter((_, x) => x !== i) })}>
              <X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange({ correct_answer: [...blanks, ""] })}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj lukę</Button>
      </div>
    );
  }

  // Ordering: options = items in correct order
  if (type === "ordering") {
    const items = opts as string[];
    return (
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Wpisz elementy w POPRAWNEJ kolejności (uczeń otrzyma je wymieszane).</Label>
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-center">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs w-6">{i + 1}.</span>
            <Input value={it} onChange={(e) => {
              const n = [...items]; n[i] = e.target.value; onChange({ options: n, correct_answer: n });
            }} onBlur={onBlur} />
            <Button variant="ghost" size="icon" onClick={() => {
              const n = items.filter((_, x) => x !== i); onChange({ options: n, correct_answer: n });
            }}><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => {
          const n = [...items, ""]; onChange({ options: n, correct_answer: n });
        }}><Plus className="h-3.5 w-3.5 mr-1" /> Dodaj element</Button>
      </div>
    );
  }

  // Code
  if (type === "code") {
    const ca = (correctAnswer as { language?: string; expected_output?: string; solution?: string }) || {};
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">Język</Label>
            <Input value={ca.language ?? "javascript"} onChange={(e) =>
              onChange({ correct_answer: { ...ca, language: e.target.value } })} onBlur={onBlur} /></div>
          <div><Label className="text-xs">Oczekiwany output</Label>
            <Input value={ca.expected_output ?? ""} onChange={(e) =>
              onChange({ correct_answer: { ...ca, expected_output: e.target.value } })} onBlur={onBlur} /></div>
        </div>
        <Label className="text-xs">Wzorcowe rozwiązanie (dla AI)</Label>
        <Textarea value={ca.solution ?? ""} onChange={(e) =>
          onChange({ correct_answer: { ...ca, solution: e.target.value } })} onBlur={onBlur}
          rows={5} className="font-mono text-xs" placeholder="function solve() { ... }" />
      </div>
    );
  }

  // Hotspot
  if (type === "hotspot") {
    const ca = (correctAnswer as { x?: number; y?: number; radius?: number; image_url?: string }) || {};
    return (
      <div className="space-y-2">
        <Label className="text-xs">URL obrazu</Label>
        <Input value={ca.image_url ?? ""} onChange={(e) =>
          onChange({ correct_answer: { ...ca, image_url: e.target.value } })} onBlur={onBlur} placeholder="https://..." />
        <div className="grid grid-cols-3 gap-2">
          <div><Label className="text-xs">X (%)</Label>
            <Input type="number" min={0} max={100} value={ca.x ?? 50} onChange={(e) =>
              onChange({ correct_answer: { ...ca, x: parseFloat(e.target.value) } })} onBlur={onBlur} /></div>
          <div><Label className="text-xs">Y (%)</Label>
            <Input type="number" min={0} max={100} value={ca.y ?? 50} onChange={(e) =>
              onChange({ correct_answer: { ...ca, y: parseFloat(e.target.value) } })} onBlur={onBlur} /></div>
          <div><Label className="text-xs">Promień (%)</Label>
            <Input type="number" min={1} max={50} value={ca.radius ?? 10} onChange={(e) =>
              onChange({ correct_answer: { ...ca, radius: parseFloat(e.target.value) } })} onBlur={onBlur} /></div>
        </div>
      </div>
    );
  }

  return null;
}
