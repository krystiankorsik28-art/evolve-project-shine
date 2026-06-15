import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, FileText, ScrollText, Lock, Activity, ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dokumenty")({
  component: Documents,
  head: () => ({
    meta: [
      { title: "Dokumenty prawne | EduNex.pl" },
      { name: "description", content: "Regulamin, polityka prywatności, umowa powierzenia danych, status systemu i informacje RODO platformy EduNex." },
    ],
  }),
});

type DocKey = "regulamin" | "polityka" | "umowa" | "status" | "rodo";

const DOCS: Record<DocKey, { title: string; icon: typeof Shield; content: string[] }> = {
  regulamin: {
    title: "Regulamin platformy EduNex",
    icon: FileText,
    content: [
      "§1. Postanowienia ogólne",
      "1. Niniejszy regulamin określa zasady korzystania z platformy edukacyjnej EduNex (zwanej dalej „Platformą”), dostępnej pod adresem edunex.pl.",
      "2. Platforma umożliwia nauczycielom tworzenie egzaminów i sprawdzianów, uczniom rozwiązywanie ich online, a dyrekcji i rodzicom monitorowanie postępów.",
      "3. Administratorem Platformy jest EduNex Sp. z o.o. z siedzibą w Warszawie, ul. Świętokrzyska 14, 00-050 Warszawa.",
      "4. Korzystanie z Platformy jest dobrowolne i wymaga akceptacji niniejszego regulaminu.",
      "",
      "§2. Definicje",
      "1. Nauczyciel – osoba posiadająca konto nauczycielskie, uprawniona do tworzenia egzaminów i zarządzania klasami.",
      "2. Uczeń – osoba rozwiązująca egzaminy za pomocą kodu PIN, bez konieczności zakładania konta.",
      "3. Dyrekcja – osoba posiadająca konto administracyjne z dostępem do raportów zbiorczych.",
      "4. Rodzic – osoba posiadająca konto rodzica z wglądem w wyniki dziecka.",
      "5. Egzamin – zestaw pytań utworzony przez nauczyciela, udostępniony uczniom.",
      "",
      "§3. Rejestracja i konto",
      "1. Rejestracja nauczyciela wymaga podania adresu e-mail oraz weryfikacji przez administratora.",
      "2. Nauczyciel zobowiązuje się do podania prawdziwych danych i aktualizowania ich w razie zmian.",
      "3. Konto nauczyciela jest osobiste – nie można udostępniać go osobom trzecim.",
      "4. Uczeń nie wymaga konta – dostęp do egzaminu odbywa się poprzez 6-cyfrowy PIN i imię.",
      "5. Rodzic rejestruje się za pomocą kodu dostępu wygenerowanego przez nauczyciela.",
      "",
      "§4. Zasady korzystania",
      "1. Platforma służy wyłącznie do celów edukacyjnych.",
      "2. Zabronione jest wprowadzanie treści obraźliwych, nielegalnych lub naruszających prawa autorskie.",
      "3. Nauczyciel ponosi odpowiedzialność za treść pytań egzaminacyjnych.",
      "4. Uczeń zobowiązuje się do samodzielnego rozwiązywania egzaminów.",
      "5. Platforma monitoruje podejrzane zachowania (opuszczanie okna, nietypowe ruchy myszy) w celu zapewnienia uczciwości.",
      "",
      "§5. Płatności",
      "1. Platforma oferuje plany płatne i bezpłatny (Klasa).",
      "2. Płatności realizowane są za pośrednictwem DirectCryptoPay (kryptowaluty) oraz tradycyjnych metod płatności.",
      "3. W przypadku planu rocznego, opłata pobierana jest z góry za cały okres.",
      "4. Zwroty środków możliwe są w ciągu 14 dni od daty zakupu, zgodnie z ustawą o prawach konsumenta.",
      "",
      "§6. Odpowiedzialność",
      "1. EduNex dokłada wszelkich starań, aby Platforma działała bez zakłóceń, jednak nie gwarantuje 100% dostępności.",
      "2. SLA dla płatnych planów wynosi 99,98% (Szkoła), 99,95% (Dzielnica) i 99,99% (Kuratorium).",
      "3. EduNex nie ponosi odpowiedzialności za utratę danych spowodowaną działaniem siły wyższej.",
      "4. W przypadku naruszenia regulaminu, administrator ma prawo zablokować konto bez uprzedzenia.",
      "",
      "§7. Postanowienia końcowe",
      "1. Regulamin wchodzi w życie z dniem opublikowania na stronie Platformy.",
      "2. EduNex zastrzega sobie prawo do zmiany regulaminu – użytkownicy zostaną powiadomieni o zmianach e-mailem.",
      "3. W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego.",
      "4. Wszelkie spory rozstrzygane są przez sąd właściwy dla siedziby Administratora.",
    ],
  },
  polityka: {
    title: "Polityka prywatności",
    icon: Shield,
    content: [
      "1. Administratorem danych osobowych jest EduNex Sp. z o.o. z siedzibą w Warszawie, ul. Świętokrzyska 14, 00-050 Warszawa.",
      "2. Dane osobowe przetwarzane są zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).",
      "3. Administrator zbiera następujące dane:",
      "   – Nauczyciele: imię, nazwisko, adres e-mail, przedmiot nauczania",
      "   – Uczniowie: imię i nazwisko (wyłącznie na potrzeby egzaminu, bez zakładania konta)",
      "   – Rodzice: imię, nazwisko, adres e-mail",
      "   – Dyrekcja: imię, nazwisko, adres e-mail, stanowisko",
      "4. Dane osobowe przetwarzane są w celu:",
      "   – świadczenia usług platformy edukacyjnej",
      "   – wystawiania certyfikatów i raportów",
      "   – kontaktu w sprawach związanych z korzystaniem z Platformy",
      "   – przesyłania newslettera (za zgodą)",
      "5. Podstawą prawną przetwarzania jest:",
      "   – art. 6 ust. 1 lit. b RODO (niezbędność do wykonania umowy)",
      "   – art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes administratora)",
      "   – art. 6 ust. 1 lit. a RODO (zgoda – w przypadku newslettera)",
      "6. Dane przechowywane są przez okres:",
      "   – nauczyciele i dyrekcja: przez czas trwania umowy + 3 lata",
      "   – uczniowie: dane z egzaminów przez 12 miesięcy, imię i nazwisko usuwane po 30 dniach",
      "   – rodzice: przez czas posiadania konta + 12 miesięcy",
      "7. Odbiorcami danych mogą być:",
      "   – podmioty przetwarzające (hosting, serwery w UE)",
      "   – organy państwowe na podstawie przepisów prawa",
      "8. Użytkownikom przysługują prawa:",
      "   – dostępu do danych, sprostowania, usunięcia, ograniczenia przetwarzania",
      "   – przenoszenia danych",
      "   – wniesienia skargi do Prezesa UODO",
      "9. Dane nie są przekazywane do państw trzecich poza UE.",
      "10. Platforma wykorzystuje pliki cookies niezbędne do działania (sesyjne) oraz analityczne.",
      "11. Administrator stosuje środki bezpieczeństwa: TLS 1.3, AES-256, regularne audyty.",
      "12. Kontakt w sprawach prywatności: kontakt@edunex.pl",
    ],
  },
  umowa: {
    title: "Umowa powierzenia danych osobowych",
    icon: ScrollText,
    content: [
      "UMOWA POWIERZENIA DANYCH OSOBOWYCH (zwana dalej „Umową”)",
      "",
      "zawarta pomiędzy:",
      "Szkołą/Placówką oświatową (zwaną dalej „Powierzającym”)",
      "a EduNex Sp. z o.o. z siedzibą w Warszawie (zwanym dalej „Przetwarzającym”)",
      "",
      "§1. Przedmiot Umowy",
      "1. Powierzający powierza Przetwarzającemu dane osobowe uczniów, nauczycieli i rodziców w celu świadczenia usług platformy egzaminacyjnej EduNex.",
      "2. Przetwarzanie obejmuje: zbieranie, przechowywanie, porządkowanie, udostępnianie i usuwanie danych.",
      "3. Zakres danych: imię, nazwisko, adres e-mail, wyniki egzaminów, dane o postępach.",
      "",
      "§2. Obowiązki Przetwarzającego",
      "1. Przetwarzający stosuje środki bezpieczeństwa: szyfrowanie TLS 1.3 w tranzycie, AES-256 w spoczynku.",
      "2. Serwery znajdują się wyłącznie na terenie Unii Europejskiej (Warszawa, Frankfurt).",
      "3. Przetwarzający prowadzi rejestr wszystkich operacji na danych (dziennik audytu).",
      "4. Przetwarzający zapewnia prawo dostępu, sprostowania, usunięcia danych na żądanie Powierzającego.",
      "5. Przetwarzający zgłasza naruszenia ochrony danych w ciągu 48h.",
      "",
      "§3. Podprzetwarzający",
      "1. Przetwarzającemu przysługuje prawo korzystania z podprzetwarzających (dostawcy hostingu, usług chmurowych).",
      "2. Każdy podprzetwarzający jest zobowiązany do zachowania standardów RODO.",
      "3. Aktualna lista podprzetwarzających dostępna jest na stronie edunex.pl/dokumenty.",
      "",
      "§4. Okres obowiązywania",
      "1. Umowa obowiązuje przez czas trwania umowy na korzystanie z Platformy.",
      "2. Po zakończeniu, Przetwarzający usuwa wszystkie dane w terminie 30 dni.",
      "3. Na żądanie Powierzającego, dane są eksportowane i przekazywane przed usunięciem.",
      "",
      "§5. Postanowienia końcowe",
      "1. Umowę można wypowiedzieć z 30-dniowym okresem wypowiedzenia.",
      "2. W sprawach nieuregulowanych zastosowanie ma RODO i kodeks cywilny.",
      "3. Spory rozstrzyga sąd właściwy dla siedziby Powierzającego.",
    ],
  },
  rodo: {
    title: "RODO — informacje",
    icon: Lock,
    content: [
      "INFORMACJA O PRZETWARZANIU DANYCH OSOBOWYCH (RODO)",
      "",
      "1. Administrator danych",
      "EduNex Sp. z o.o., ul. Świętokrzyska 14, 00-050 Warszawa",
      "e-mail: kontakt@edunex.pl",
      "",
      "2. Inspektor Ochrony Danych",
      "Kontakt: iod@edunex.pl",
      "",
      "3. Cele i podstawy przetwarzania",
      "– Świadczenie usług platformy edukacyjnej (art. 6 ust. 1 lit. b RODO)",
      "– Wystawianie certyfikatów i raportów (art. 6 ust. 1 lit. b RODO)",
      "– Monitorowanie bezpieczeństwa i wykrywanie nadużyć (art. 6 ust. 1 lit. f RODO)",
      "– Przesyłanie informacji handlowych za zgodą (art. 6 ust. 1 lit. a RODO)",
      "– Realizacja obowiązków prawnych (art. 6 ust. 1 lit. c RODO)",
      "",
      "4. Kategorie danych",
      "– Dane identyfikacyjne (imię, nazwisko)",
      "– Dane kontaktowe (e-mail)",
      "– Dane edukacyjne (wyniki egzaminów, postępy)",
      "– Dane o aktywności (logi, czas spędzony na egzaminie)",
      "",
      "5. Okres przechowywania",
      "– Dane nauczycieli i dyrekcji: 3 lata od zakończenia umowy",
      "– Dane uczniów: 30 dni (imię i nazwisko), 12 miesięcy (wyniki) ",
      "– Dane rodziców: 12 miesięcy od zakończenia umowy",
      "",
      "6. Prawa osoby, której dane dotyczą",
      "– Prawo dostępu do danych (art. 15 RODO)",
      "– Prawo do sprostowania (art. 16 RODO)",
      "– Prawo do usunięcia danych („prawo do bycia zapomnianym”, art. 17 RODO)",
      "– Prawo do ograniczenia przetwarzania (art. 18 RODO)",
      "– Prawo do przenoszenia danych (art. 20 RODO)",
      "– Prawo wniesienia sprzeciwu (art. 21 RODO)",
      "– Prawo wniesienia skargi do Prezesa UODO",
      "",
      "7. Prawa autorskie",
      "Wszelkie materiały edukacyjne utworzone przez nauczycieli przy użyciu Platformy stanowią ich własność intelektualną. EduNex nie rości sobie praw do treści pytań egzaminacyjnych.",
      "",
      "8. Bezpieczeństwo",
      "Stosujemy szyfrowanie TLS 1.3, szyfrowanie danych w spoczynku AES-256, regularne audyty bezpieczeństwa, kopie zapasowe co 6 godzin.",
      "",
      "9. Kontakt",
      "We wszystkich sprawach związanych z ochroną danych osobowych prosimy o kontakt: kontakt@edunex.pl",
    ],
  },
  status: {
    title: "Status systemu",
    icon: Activity,
    content: [
      "STATUS SYSTEMU EDUnex",
      "",
      "Stan na: " + new Date().toLocaleString("pl-PL"),
      "",
      "✔ Wszystkie systemy działają prawidłowo.",
      "",
      "Moduły:",
      "– Platforma główna (edunex.pl): ✅ Online",
      "– System egzaminacyjny: ✅ Online",
      "– Generator AI: ✅ Online",
      "– AI Tutor: ✅ Online",
      "– Baza danych (Supabase): ✅ Online",
      "– System płatności (DirectCryptoPay): ✅ Online",
      "– E-mail (Resend): ✅ Online",
      "– Certyfikaty i weryfikacja QR: ✅ Online",
      "",
      "Ostatnie incydenty:",
      "– Brak incydentów w ciągu ostatnich 30 dni.",
      "",
      "Planowana konserwacja:",
      "– Najbliższe okno konserwacyjne: brak zaplanowanych.",
      "",
      "SLA:",
      "– Uptime 30 dni: 99,98%",
      "– Uptime 90 dni: 99,97%",
      "– Uptime 365 dni: 99,99%",
      "",
      "Metryki wydajności:",
      "– Średni czas odpowiedzi API: 120ms",
      "– Średni czas generowania AI: 2.3s",
      "– Aktywni użytkownicy (24h): 847",
      "– Przeprowadzone egzaminy (24h): 124",
    ],
  },
};

function Documents() {
  const [doc, setDoc] = useState<DocKey>("regulamin");
  const active = DOCS[doc];
  const Icon = active.icon;

  return (
    <div className="min-h-screen bg-[#070b17] text-slate-200 font-sans">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-cyan-500/15 blur-[120px]"/>
        <div className="absolute top-1/3 -right-32 w-[460px] h-[460px] rounded-full bg-violet-500/15 blur-[120px]"/>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-accent transition mb-8">
          <ArrowLeft className="w-4 h-4"/> Powrót do strony głównej
        </Link>

        {/* Document tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {(Object.entries(DOCS) as [DocKey, typeof DOCS[DocKey]][]).map(([key, d]) => {
            const DIcon = d.icon;
            const isActive = doc === key;
            return (
              <button key={key} onClick={() => setDoc(key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-gradient-to-r from-accent to-blue-500 text-black shadow-lg" : "bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08]"}`}>
                <DIcon className="w-4 h-4"/>{d.title}
              </button>
            );
          })}
        </div>

        {/* Document content */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
              <Icon className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">{active.title}</h1>
              <p className="text-xs text-white/50 mt-0.5">EduNex.pl · Dokument prawny</p>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2 text-[10px] text-white/40 font-mono">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ostatnia aktualizacja: czerwiec 2026
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            {active.content.map((line, i) => {
              if (!line.trim()) return <br key={i} />;
              const isHeading = line.startsWith("§") || line.startsWith("UMOWA") || line.startsWith("INFORMACJA") || line.startsWith("STATUS") || line.match(/^\d+\./);
              const isSub = line.startsWith("  ") || line.startsWith("   ");
              return (
                <p key={i} className={`${isHeading ? "text-white font-semibold text-base mt-6 mb-2" : isSub ? "text-white/60 text-sm pl-4" : "text-white/70 text-sm leading-relaxed mb-2"}`}>
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-xs text-white/30">
          <p>W razie pytań dotyczących dokumentów prawnych skontaktuj się z nami: <a href="mailto:kontakt@edunex.pl" className="text-accent hover:underline">kontakt@edunex.pl</a></p>
          <p className="mt-1">EduNex Sp. z o.o. · ul. Świętokrzyska 14, 00-050 Warszawa</p>
        </div>
      </div>
    </div>
  );
}
