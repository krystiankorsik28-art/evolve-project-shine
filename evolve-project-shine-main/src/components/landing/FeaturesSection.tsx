import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit, FileText, Sparkles, BarChart3, Shield, Bot, Activity,
  TrendingUp, ShieldCheck, Monitor, KeyRound, Library, Award, Zap,
  BookOpen, MessageSquare, Video, Headphones, Globe, Smartphone,
  Laptop, Cloud, Database, Lock, Fingerprint, ScanFace, Building2,
  Radio, Users, GraduationCap, School, Target, Medal, Star,
  Puzzle, Code2, Workflow, Cable, GitBranch, GripVertical,
  Lightbulb, Bell, Calendar, Clock, Download, Upload, Search,
  Filter, LayoutDashboard, Share2, Paintbrush, Palette,
  Computer, Notebook, Infinity, Cpu, Server, Binary,
  Mail, Flame, BookMarked, DollarSign, Wifi, Trophy,
} from "lucide-react";
import { Terminal } from "lucide-react";

const CATEGORIES = [
  {
    id: "egzaminy", label: "Egzaminy", icon: FileText,
    items: [
      { title: "Tworzenie egzaminów", desc: "Pytania zamknięte, otwarte, kod, dopasowania. Szablony z banku 200+ zestawów.", icon: FileText },
      { title: "Sprawdziany błyskawiczne", desc: "Kartkówki z 3-5 pytaniami w 2 minuty. Wyniki widoczne natychmiast.", icon: Zap },
      { title: "Bank pytań", desc: "200+ pytań gotowych do użycia. Import z Worda, PDF, Excel.", icon: Library },
      { title: "Generator AI", desc: "Generuj pytania z 3 słów. Wczytaj zdjęcie — AI odczytuje i tworzy test.", icon: BrainCircuit },
      { title: "Certyfikacja", desc: "Certyfikat PDF z unikalnym numerem i kodem QR. Weryfikacja online.", icon: Award },
      { title: "Tryb egzaminacyjny", desc: "Pełny ekran, blokada skrótów, zapis co 5s, monitoring aktywności.", icon: Monitor },
      { title: "Losowanie pytań", desc: "Każdy uczeń dostaje unikalny zestaw. Wymieszane odpowiedzi.", icon: Puzzle },
      { title: "Czasomierz", desc: "Automatyczne zakończenie po czasie. Widoczny pasek postępu.", icon: Clock },
      { title: "Import zdjęć", desc: "Wczytaj zdjęcie kartkówki — AI odczytuje i tworzy test cyfrowy.", icon: Upload },
      { title: "Eksport wyników", desc: "PDF, Excel, CSV. Zbiorcze zestawienia klas i indywidualne raporty.", icon: Download },
      { title: "Wersja audio", desc: "Pytania odtwarzane dla uczniów z dysleksją. Dostosowanie tempa.", icon: Headphones },
      { title: "Tryb offline", desc: "Uczeń może odpowiadać bez internetu. Synchronizacja po połączeniu.", icon: Wifi },
    ],
  },
  {
    id: "ai", label: "AI", icon: BrainCircuit,
    items: [
      { title: "Auto-ocena odpowiedzi", desc: "AI ocenia otwarte odpowiedzi, rozumie kontekst. Korekta pisowni nie wpływa na ocenę.", icon: Bot },
      { title: "Asystent AI nauczyciela", desc: "Rozmowa głosowa z asystentem. Podpowiedzi przy układaniu pytań.", icon: Sparkles },
      { title: "Wykrywanie ściągania", desc: "AI analizuje ruchy myszy, wykrywa opuszczanie okna, alerty na żywo.", icon: Shield },
      { title: "Inteligentne rekomendacje", desc: "AI sugeruje pytania na podstawie wyników. Personalizowane zestawy.", icon: BarChart3 },
      { title: "AI Tutor", desc: "24/7 asystent do nauki z wyjaśnieniami, przykładami i zadaniami.", icon: BrainCircuit },
      { title: "Plagiarism Detector", desc: "Wykrywanie plagiatów i treści generowanych przez AI.", icon: ShieldCheck },
      { title: "Code Mentor", desc: "Nauka programowania z interaktywnym asystentem kodu.", icon: Code2 },
      { title: "Course Generator", desc: "Automatyczne tworzenie kursów z dowolnego tematu.", icon: BookOpen },
      { title: "Presentation Maker", desc: "Generowanie prezentacji z AI w kilka sekund z szablonów.", icon: Monitor },
      { title: "Voice Assistant", desc: "Komendy głosowe dla nauczyciela. Dyktowanie pytań i poleceń.", icon: Headphones },
      { title: "AI Analysis", desc: "Analiza wyników z predykcją przyszłych osiągnięć ucznia.", icon: TrendingUp },
      { title: "Smart Suggestions", desc: "AI podpowiada treści i materiały podczas układania lekcji.", icon: Lightbulb },
    ],
  },
  {
    id: "analityka", label: "Analityka", icon: BarChart3,
    items: [
      { title: "Panel nauczyciela", desc: "KPI: egzaminy, średnia, alerty. Wykresy wyników w czasie.", icon: BarChart3 },
      { title: "Monitoring na żywo", desc: "Postęp ucznia w czasie rzeczywistym. Aktywni/ryzyko podział.", icon: Activity },
      { title: "Raporty dla dyrekcji", desc: "Zbiorcze zestawienie klas. Wskaźniki zdawalności. Eksport PDF/Excel.", icon: FileText },
      { title: "Prognozy i trendy", desc: "Wykresy predykcyjne. Alerty przy spadku wyników. Rekomendacje AI.", icon: TrendingUp },
      { title: "Heatmapy klas", desc: "Wizualizacja wyników na mapie ciepła. Szybkie wychwycenie słabych obszarów.", icon: LayoutDashboard },
      { title: "Statystyki szczegółowe", desc: "Średnia, mediana, odchylenie. Porównanie klas i lat.", icon: BarChart3 },
      { title: "Analiza odpowiedzi", desc: "Które pytania sprawiły trudność? AI grupuje błędy według tematu.", icon: Search },
      { title: "Filtrowanie danych", desc: "Filtruj według klasy, przedmiotu, ucznia, zakresu dat.", icon: Filter },
      { title: "Export zaawansowany", desc: "Raport do arkusza kalkulacyjnego. Niestandardowe zestawienia.", icon: Download },
      { title: "Cele i KPI", desc: "Ustaw cele edukacyjne. Monitoruj osiągnięcia względem założeń.", icon: Target },
    ],
  },
  {
    id: "bezpieczenstwo", label: "Bezpieczeństwo", icon: Shield,
    items: [
      { title: "Ochrona danych", desc: "Szyfrowanie TLS 1.3, AES-256 w spoczynku, serwery w UE.", icon: Shield },
      { title: "Zgodność z RODO", desc: "Umowa powierzenia danych. Dziennik audytu. Eksport na żądanie.", icon: ShieldCheck },
      { title: "Tryb egzaminacyjny", desc: "Pełny ekran, blokada skrótów, zapis co 5s, monitoring aktywności.", icon: Monitor },
      { title: "Kontrola dostępu", desc: "Role: admin, nauczyciel, uczeń. 2FA. Sesja wygasa po 15 min.", icon: KeyRound },
      { title: "Backupy automatyczne", desc: "Kopia zapasowa co 6h na 3 niezależnych serwerach w UE.", icon: Database },
      { title: "Ochrona DDoS", desc: "WAF, Cloudflare, rate limiting. Monitoring 24/7.", icon: Shield },
      { title: "SOC i audyty", desc: "Testy penetracyjne co kwartał. Całodobowy zespół bezpieczeństwa.", icon: Radio },
      { title: "Dziennik zdarzeń", desc: "Logowanie wszystkich akcji. Audit trail dla administratora.", icon: FileText },
      { title: "Szyfrowanie E2E", desc: "Wiadomości między nauczycielami szyfrowane end-to-end.", icon: Lock },
      { title: "Bezpieczeństwo fizyczne", desc: "Serwery w fizycznie chronionych data center w Warszawie i Krakowie.", icon: Building2 },
    ],
  },
  {
    id: "nauka", label: "Nauka", icon: BookOpen,
    items: [
      { title: "Kursy online", desc: "Twórz kursy z lekcjami, quizami i zadaniami. AI pomaga w układaniu.", icon: BookOpen },
      { title: "AI Tutor 24/7", desc: "Uczeń zadaje pytania, AI tłumaczy, podaje przykłady i ćwiczenia.", icon: BrainCircuit },
      { title: "Fiszki inteligentne", desc: "AI tworzy fiszki z notatek. System powtórek z algorytmem krzywej zapominania.", icon: Notebook },
      { title: "Nauka przez zabawę", desc: "Quizy na czas, rankingi, osiągnięcia. Motywacja przez gamifikację.", icon: Star },
      { title: "Ścieżki personalizowane", desc: "AI dopasowuje poziom trudności do postępów ucznia.", icon: GitBranch },
      { title: "Zadania domowe", desc: "Ustawiaj, zbieraj i oceniaj zadania. AI sprawdza automatycznie.", icon: Upload },
      { title: "Grupy uczniowskie", desc: "Dziel klasę na grupy. Różne zadania dla różnych poziomów.", icon: Users },
      { title: "Materiały multimedialne", desc: "Wideo, audio, interaktywne diagramy. Osadzaj z YouTube i innych.", icon: Video },
      { title: "Słownik pojęć", desc: "Automatycznie generowany słownik dla każdego przedmiotu.", icon: BookMarked },
      { title: "Plany nauki", desc: "AI tworzy plan nauki na podstawie egzaminów i zaległości.", icon: Calendar },
      { title: "Korepetycje online", desc: "Uczniowie mogą umawiać się na konsultacje z nauczycielem.", icon: Video },
    ],
  },
  {
    id: "komunikacja", label: "Komunikacja", icon: MessageSquare,
    items: [
      { title: "Wiadomości", desc: "Chat między nauczycielem a uczniem/rodzicem. Załączniki, powiadomienia.", icon: MessageSquare },
      { title: "Ogłoszenia", desc: "Wysyłaj ogłoszenia do całej klasy, grupy lub pojedynczych uczniów.", icon: Bell },
      { title: "Powiadomienia email", desc: "Automatyczne emaile o wynikach, terminach, nowych materiałach.", icon: Mail },
      { title: "Konsultacje online", desc: "Wideo rozmowy z nauczycielem. Integracja z kalendarzem.", icon: Video },
      { title: "Dziennik kontaktów", desc: "Historia komunikacji z rodzicami. Notatki ze spotkań.", icon: FileText },
      { title: "Ankiety i głosowania", desc: "Szybkie ankiety dla uczniów i rodziców. Wyniki na żywo.", icon: BarChart3 },
      { title: "Masowe powiadomienia", desc: "SMS i email dla całej szkoły. Alerty o zagrożeniach.", icon: Radio },
      { title: "Czat AI", desc: "Automatyczne odpowiedzi na najczęstsze pytania rodziców i uczniów.", icon: Bot },
      { title: "Newsletter szkolny", desc: "Twórz i wysyłaj newslettery. Szablony i statystyki otwarć.", icon: Mail },
      { title: "Integracja z e-dziennikiem", desc: "Synchronizacja z popularnymi dziennikami elektronicznymi.", icon: Share2 },
    ],
  },
  {
    id: "integracje", label: "Integracje", icon: Puzzle,
    items: [
      { title: "API REST", desc: "Pełne API REST do integracji z systemem dziennika, LMS i innymi.", icon: Code2 },
      { title: "Microsoft 365", desc: "Logowanie przez Microsoft. Synchronizacja kalendarza i kontaktów.", icon: Monitor },
      { title: "Google Workspace", desc: "SSO przez Google. Classroom, Drive, Calendar integracja.", icon: Globe },
      { title: "Webhooki", desc: "Wysyłaj zdarzenia do własnych systemów przez webhooki.", icon: Cable },
      { title: "Zapier / Make", desc: "Łącz z 3000+ aplikacji przez Zapier. Automatyzacja powiadomień.", icon: Puzzle },
      { title: "Import danych", desc: "Importuj uczniów, klasy, oceny z CSV, Excel, e-dziennika.", icon: Upload },
      { title: "LDAP / Active Directory", desc: "Integracja z AD dla szkół. Automatyczne tworzenie kont.", icon: Server },
      { title: "LTI Standard", desc: "Zgodność z LTI 1.3. Podłącz do Moodle, Teams, Classroom.", icon: GitBranch },
      { title: "SAML / SSO", desc: "Logowanie przez SAML. Własny IdP dla szkoły.", icon: Lock },
      { title: "NexaPay", desc: "Płatności kartą, przelewem i kryptowalutami bez prowizji.", icon: DollarSign },
    ],
  },
  {
    id: "gamifikacja", label: "Gamifikacja", icon: Medal,
    items: [
      { title: "Punkty i rankingi", desc: "Uczniowie zdobywają punkty za wyniki. Rankingi klas i szkół.", icon: Trophy },
      { title: "Osiągnięcia i odznaki", desc: "Odznaki za wyniki, serie, pomoc innym. Kolekcjonowanie.", icon: Medal },
      { title: "Serie i streak", desc: "Codzienne logowanie i nauka. Seria dni utrzymuje motywację.", icon: Flame },
      { title: "Poziomy i progresja", desc: "Uczeń awansuje na wyższe poziomy. Otwiera nowe możliwości.", icon: TrendingUp },
      { title: "Wyzwania", desc: "Cotygodniowe wyzwania. Rywalizacja między klasami.", icon: Target },
      { title: "Sklep z nagrodami", desc: "Wymieniaj punkty na nagrody. Konfigurowalny przez nauczyciela.", icon: Star },
      { title: "Certyfikaty cyfrowe", desc: "Automatyczne certyfikaty za ukończenie kursu z QR + PDF.", icon: Award },
      { title: "Leaderboard", desc: "Tablica liderów dla klasy, szkoły, regionu. Filtrowanie.", icon: LayoutDashboard },
      { title: "Grupy rywalizacyjne", desc: "Podział na drużyny. Wspólna nauka i rywalizacja.", icon: Users },
      { title: "Wirtualne awatary", desc: "Personalizacja profilu. Awatary i motywy do odblokowania.", icon: Paintbrush },
    ],
  },
  {
    id: "zarzadzanie", label: "Zarządzanie", icon: LayoutDashboard,
    items: [
      { title: "Panel administratora", desc: "Pełna kontrola nad użytkownikami, licencjami i ustawieniami.", icon: LayoutDashboard },
      { title: "Zarządzanie klasami", desc: "Twórz, edytuj, archiwizuj klasy. Przypisuj nauczycieli.", icon: School },
      { title: "Raporty zbiorcze", desc: "Zestawienia dla dyrekcji. Analiza porównawcza klas i lat.", icon: BarChart3 },
      { title: "Licencje i subskrypcje", desc: "Zarządzaj planami. Przypisuj licencje nauczycielom i uczniom.", icon: KeyRound },
      { title: "Audyt systemowy", desc: "Pełna historia zmian. Kto, co i kiedy zmienił w systemie.", icon: Search },
      { title: "Bezpieczeństwo kont", desc: "Blokada konta po próbach. Reset hasła. Logowanie 2FA.", icon: Lock },
      { title: "Kopie zapasowe", desc: "Automatyczny backup. Przywracanie jednym kliknięciem.", icon: Database },
      { title: "Wielojęzyczność", desc: "Interfejs w 5 językach. Dostosowanie do uczniów z Ukrainy.", icon: Globe },
      { title: "Dostosowanie wyglądu", desc: "Własne logo, kolory, motywy. Branding szkoły.", icon: Paintbrush },
      { title: "API zarządzania", desc: "Zarządzaj wszystkim przez API. Automatyzacja administracji.", icon: Code2 },
    ],
  },
  {
    id: "developer", label: "Dla Developerów", icon: Code2,
    items: [
      { title: "REST API", desc: "Pełne REST API z dokumentacją Swagger/OpenAPI.", icon: Code2 },
      { title: "GraphQL", desc: "Zapytaj dokładnie o to czego potrzebujesz. Elastyczne zapytania.", icon: GitBranch },
      { title: "Webhooki", desc: "Event-driven webhooks. Wysyłaj zdarzenia w czasie rzeczywistym.", icon: Cable },
      { title: "SDK", desc: "SDK dla JavaScript, Python, PHP. Łatwa integracja.", icon: Puzzle },
      { title: "Sandbox", desc: "Środowisko testowe z własną bazą. Bez wpływu na produkcję.", icon: Computer },
      { title: "Rate limiting", desc: "Kontroluj użycie API. Plany z różnymi limitami.", icon: Activity },
      { title: "Logi API", desc: "Pełne logowanie zapytań. Debugowanie integracji.", icon: FileText },
      { title: "CLI", desc: "Narzędzie CLI do zarządzania. Automatyzacja z skryptów.", icon: Terminal },
      { title: "MCP Server", desc: "Model Context Protocol. Łącz z narzędziami AI.", icon: Cable },
      { title: "Pluginy", desc: "Wtyczki do WordPress, Moodle, Teams. Rozszerzaj funkcjonalność.", icon: Puzzle },
    ],
  },
];

export default function FeaturesSection() {
  const [active, setActive] = useState(CATEGORIES[0].id);
  const [key, setKey] = useState(0);
  const cat = CATEGORIES.find((c) => c.id === active) ?? CATEGORIES[0];
  const total = CATEGORIES.reduce((a, c) => a + c.items.length, 0);

  return (
    <section id="funkcje" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-6"
            style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)", color: "oklch(1 0 0 / 0.5)" }}>
            Funkcje
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Ponad{" "}
            <span style={{
              background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>{total}+</span>{" "}
            możliwości
          </h2>
          <p className="mt-3 text-sm" style={{ color: "oklch(1 0 0 / 0.4)" }}>
            Wszystko, czego potrzebuje nowoczesna szkoła — w jednej, spójnej platformie.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((c) => {
            const isActive = active === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setActive(c.id); setKey((k) => k + 1); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  background: isActive ? "oklch(1 0 0 / 0.9)" : "oklch(1 0 0 / 0.04)",
                  color: isActive ? "oklch(0.06 0.03 270)" : "oklch(1 0 0 / 0.4)",
                  boxShadow: isActive ? "0 0 20px oklch(1 0 0 / 0.15)" : "none",
                }}
              >
                <c.icon className="w-4 h-4" />
                {c.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active + key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {cat.items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: "oklch(0.08 0.03 270 / 0.3)",
                  border: "1px solid oklch(1 0 0 / 0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 30px oklch(0 0 0 / 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                    style={{ background: "oklch(0.7 0.15 200 / 0.1)", border: "1px solid oklch(0.7 0.15 200 / 0.15)" }}>
                    <item.icon className="w-4 h-4" style={{ color: "oklch(0.7 0.15 200 / 0.8)" }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white/90">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: "oklch(1 0 0 / 0.45)" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
