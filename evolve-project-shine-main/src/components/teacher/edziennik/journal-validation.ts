export function lessonTimeError(startsAt: string, endsAt?: string) {
  const start = new Date(startsAt);
  if (!startsAt || Number.isNaN(start.getTime())) return "Podaj poprawny termin rozpoczęcia.";
  if (!endsAt) return null;
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) return "Podaj poprawny termin zakończenia.";
  if (end <= start) return "Koniec lekcji musi przypadać po jej rozpoczęciu.";
  return null;
}

export function requiredJournalText(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}
