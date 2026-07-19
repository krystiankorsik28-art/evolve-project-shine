import assert from "node:assert/strict";
import test from "node:test";
import { lessonTimeError, requiredJournalText } from "./journal-validation.ts";

test("akceptuje lekcję bez opcjonalnego czasu zakończenia", () => {
  assert.equal(lessonTimeError("2026-09-01T08:00"), null);
});

test("odrzuca niepoprawny przedział lekcji", () => {
  assert.equal(
    lessonTimeError("2026-09-01T08:00", "2026-09-01T07:45"),
    "Koniec lekcji musi przypadać po jej rozpoczęciu.",
  );
  assert.equal(lessonTimeError("nie-data"), "Podaj poprawny termin rozpoczęcia.");
});

test("normalizuje obowiązkowe pola dziennika", () => {
  assert.equal(requiredJournalText("  Matematyka   rozszerzona  ", 80), "Matematyka rozszerzona");
  assert.equal(requiredJournalText("   ", 80), null);
  assert.equal(requiredJournalText("abcdef", 3), "abc");
});
