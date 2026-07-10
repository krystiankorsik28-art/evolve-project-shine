import { useMemo, useState, type ComponentType } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Lock,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/dokumenty")({
  component: Documents,
  head: () => ({
    meta: [
      { title: "Dokumenty prawne | EduNex" },
      {
        name: "description",
        content: "Regulamin, polityka prywatności, RODO, umowa powierzenia danych i status systemu EduNex.",
      },
    ],
  }),
});

type DocKey = "regulamin" | "polityka" | "rodo" | "powierzenie" | "status";

type LegalDoc = {
  key: DocKey;
  title: string;
  short: string;
  updated: string;
  icon: ComponentType<{ className?: string }>;
  sections: Array<{ heading: string; body: string[] }>;
};

const docs: LegalDoc[] = [
  {
    key: "regulamin",
    title: "Regulamin platformy EduNex",
    short: "Zasady korzystania z kont, egzaminów, certyfikatów i paneli szkolnych.",
    updated: "3 lipca 2026",
    icon: FileText,
    sections: [
      {
        heading: "1. Postanowienia ogólne",
        body: [
          "EduNex jest platformą edukacyjną wspierającą tworzenie egzaminów, obsługę kodów PIN, analizę wyników i komunikację szkolną.",
          "Z platformy korzystają nauczyciele, uczniowie, administratorzy szkoły oraz uprawnieni opiekunowie.",
          "Korzystanie z systemu wymaga akceptacji regulaminu oraz przestrzegania zasad bezpieczeństwa danych.",
        ],
      },
      {
        heading: "2. Konta i dostęp",
        body: [
          "Konto nauczyciela może wymagać zatwierdzenia przez administratora szkoły.",
          "Uczeń może wejść do egzaminu przez konto lub jednorazowy PIN przekazany przez nauczyciela.",
          "Użytkownik nie może udostępniać danych logowania innym osobom.",
        ],
      },
      {
        heading: "3. Egzaminy i wyniki",
        body: [
          "Nauczyciel odpowiada za treść egzaminów, kryteria oceniania i publikację wyników.",
          "Uczeń zobowiązuje się do samodzielnej pracy, chyba że nauczyciel określi inaczej.",
          "Wyniki, certyfikaty i eksporty są przechowywane zgodnie z zasadami retencji danych szkoły.",
        ],
      },
      {
        heading: "4. Odpowiedzialność i dostępność",
        body: [
          "EduNex utrzymuje system z należytą starannością i monitoruje podstawowe parametry bezpieczeństwa.",
          "Planowane prace techniczne mogą czasowo ograniczyć dostęp do wybranych modułów.",
          "Zgłoszenia techniczne należy kierować do administratora szkoły lub kontaktu wskazanego w umowie.",
        ],
      },
    ],
  },
  {
    key: "polityka",
    title: "Polityka prywatności",
    short: "Jakie dane przetwarzamy, w jakim celu i przez jaki czas.",
    updated: "3 lipca 2026",
    icon: Shield,
    sections: [
      {
        heading: "1. Administrator danych",
        body: [
          "Administratorem danych w ramach wdrożenia szkolnego jest właściwa placówka lub podmiot wskazany w umowie.",
          "EduNex może pełnić rolę podmiotu przetwarzającego dane na podstawie umowy powierzenia.",
        ],
      },
      {
        heading: "2. Kategorie danych",
        body: [
          "Przetwarzane mogą być dane identyfikacyjne, kontaktowe, edukacyjne, wyniki egzaminów oraz techniczne logi bezpieczeństwa.",
          "Zakres danych ucznia powinien być ograniczony do minimum niezbędnego do przeprowadzenia egzaminu i wystawienia wyniku.",
        ],
      },
      {
        heading: "3. Cele przetwarzania",
        body: [
          "Dane są wykorzystywane do obsługi kont, egzaminów, raportów, certyfikatów, eksportu ocen oraz zapewnienia bezpieczeństwa systemu.",
          "Komunikacja marketingowa lub dodatkowe integracje wymagają odrębnej podstawy prawnej albo zgody.",
        ],
      },
      {
        heading: "4. Retencja i prawa użytkownika",
        body: [
          "Okres przechowywania danych zależy od ustawień szkoły, umowy i obowiązków prawnych.",
          "Osoba, której dane dotyczą, może żądać dostępu, sprostowania, ograniczenia, usunięcia lub przeniesienia danych zgodnie z RODO.",
        ],
      },
    ],
  },
  {
    key: "rodo",
    title: "Informacja RODO",
    short: "Podstawowe informacje o przetwarzaniu danych osobowych w EduNex.",
    updated: "3 lipca 2026",
    icon: Lock,
    sections: [
      {
        heading: "1. Podstawy prawne",
        body: [
          "Przetwarzanie danych może opierać się na wykonaniu umowy, obowiązku prawnym, uzasadnionym interesie administratora lub zgodzie.",
          "Dla danych szkolnych podstawę i zakres przetwarzania określa placówka oraz właściwe przepisy prawa.",
        ],
      },
      {
        heading: "2. Bezpieczeństwo",
        body: [
          "System wykorzystuje szyfrowane połączenia, kontrolę dostępu opartą o role oraz rozdzielenie paneli użytkowników.",
          "Dostęp administracyjny powinien być ograniczony do uprawnionych osób i regularnie weryfikowany.",
        ],
      },
      {
        heading: "3. Odbiorcy danych",
        body: [
          "Dane mogą być powierzane dostawcom hostingu, poczty, baz danych i narzędzi bezpieczeństwa wyłącznie w zakresie niezbędnym do działania usługi.",
          "Lista podmiotów przetwarzających powinna być utrzymywana w dokumentacji wdrożenia szkoły.",
        ],
      },
      {
        heading: "4. Kontakt",
        body: [
          "W sprawach ochrony danych należy kontaktować się z administratorem szkoły albo inspektorem ochrony danych wskazanym przez placówkę.",
          "Zgłoszenia techniczne dotyczące kont i dostępu można kierować przez kanał wsparcia EduNex.",
        ],
      },
    ],
  },
  {
    key: "powierzenie",
    title: "Umowa powierzenia danych",
    short: "Zakres i obowiązki podmiotu przetwarzającego dane dla szkoły.",
    updated: "3 lipca 2026",
    icon: Scale,
    sections: [
      {
        heading: "1. Przedmiot powierzenia",
        body: [
          "Szkoła powierza przetwarzanie danych w celu obsługi platformy edukacyjnej, egzaminów, raportów i certyfikatów.",
          "Powierzenie obejmuje wyłącznie dane niezbędne do świadczenia usługi.",
        ],
      },
      {
        heading: "2. Obowiązki przetwarzającego",
        body: [
          "Podmiot przetwarzający stosuje środki organizacyjne i techniczne adekwatne do ryzyka.",
          "Dane nie mogą być wykorzystywane do celów innych niż wskazane przez administratora.",
        ],
      },
      {
        heading: "3. Podpowierzenie",
        body: [
          "Korzystanie z dostawców infrastruktury wymaga zachowania standardów bezpieczeństwa i umów zgodnych z RODO.",
          "Administrator powinien mieć dostęp do aktualnej listy kategorii podwykonawców.",
        ],
      },
      {
        heading: "4. Zakończenie współpracy",
        body: [
          "Po zakończeniu umowy dane powinny zostać zwrócone, wyeksportowane lub usunięte zgodnie z dyspozycją administratora.",
          "Potwierdzenie usunięcia danych może zostać przekazane w formie raportu technicznego.",
        ],
      },
    ],
  },
  {
    key: "status",
    title: "Status systemu",
    short: "Publiczny opis dostępności i podstawowych komponentów EduNex.",
    updated: "3 lipca 2026",
    icon: Activity,
    sections: [
      {
        heading: "Aktualny status",
        body: [
          "Platforma główna: operacyjna.",
          "Logowanie i role: operacyjne.",
          "Egzaminy PIN: operacyjne.",
          "Dokumenty prawne: operacyjne.",
        ],
      },
      {
        heading: "Planowane prace",
        body: [
          "Brak zaplanowanych prac serwisowych w tym środowisku.",
          "Wdrożenia produkcyjne powinny być komunikowane szkole z wyprzedzeniem.",
        ],
      },
      {
        heading: "Zgłaszanie incydentów",
        body: [
          "Incydenty bezpieczeństwa i niedostępność systemu należy zgłaszać kanałem wsparcia wskazanym w umowie.",
          "Zgłoszenie powinno zawierać czas zdarzenia, nazwę szkoły, rolę użytkownika i opis problemu.",
        ],
      },
    ],
  },
];

const docMap = new Map(docs.map((doc) => [doc.key, doc]));

function Documents() {
  const [selectedKey, setSelectedKey] = useState<DocKey>("regulamin");
  const selected = docMap.get(selectedKey) ?? docs[0];

  const documentText = useMemo(() => {
    return [
      selected.title,
      `Aktualizacja: ${selected.updated}`,
      "",
      ...selected.sections.flatMap((section) => [
        section.heading,
        ...section.body.map((line) => `- ${line}`),
        "",
      ]),
    ].join("\n");
  }, [selected]);

  const downloadDocument = () => {
    const blob = new Blob([documentText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selected.key}-edunex.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" />
            Strona główna
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Dokumenty aktywne
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-950 px-6 py-8 text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/75">
              <Sparkles className="h-3.5 w-3.5" />
              Dokumenty EduNex
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold sm:text-4xl">Dokumenty prawne i bezpieczeństwo</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              Regulamin, polityka prywatności, RODO, powierzenie danych i status systemu w jednym miejscu. Każdy dokument można otworzyć i pobrać jako plik tekstowy.
            </p>
          </div>

          <div className="grid gap-px bg-slate-200 md:grid-cols-5">
            {docs.map((doc) => (
              <button
                key={doc.key}
                onClick={() => setSelectedKey(doc.key)}
                className={`bg-white p-4 text-left transition hover:bg-slate-50 ${
                  selected.key === doc.key ? "ring-2 ring-inset ring-blue-600" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`grid h-9 w-9 place-items-center rounded-lg ${
                    selected.key === doc.key ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    <doc.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-950">{doc.title}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{doc.updated}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700">
                  <selected.icon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-950">{selected.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selected.short}</p>
                </div>
              </div>

              <button
                onClick={downloadDocument}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                Pobierz plik TXT
              </button>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                Standard wdrożeniowy
              </div>
              Dokumenty są przygotowane jako baza operacyjna dla szkoły. Finalne brzmienie powinno być zatwierdzone przez administratora danych lub prawnika placówki.
            </div>
          </aside>

          <article className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dokument</div>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">{selected.title}</h2>
                <p className="mt-2 text-sm text-slate-500">Ostatnia aktualizacja: {selected.updated}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                <Shield className="h-3.5 w-3.5 text-blue-700" />
                EduNex Legal
              </div>
            </div>

            <div className="space-y-8 px-6 py-6">
              {selected.sections.map((section) => (
                <section key={section.heading}>
                  <h3 className="text-base font-semibold text-slate-950">{section.heading}</h3>
                  <div className="mt-3 space-y-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-slate-700">{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
