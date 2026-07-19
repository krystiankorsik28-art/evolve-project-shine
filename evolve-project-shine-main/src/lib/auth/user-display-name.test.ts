import assert from "node:assert/strict";
import test from "node:test";
import { resolveUserDisplayName, userGreeting } from "./user-display-name.ts";

test("łączy imię i nazwisko z profilu i nadaje mu najwyższy priorytet", () => {
  assert.equal(
    resolveUserDisplayName({
      profile: { first_name: " Anna ", last_name: " Kowalska " },
      metadata: { full_name: "Starsza Nazwa" },
      role: "teacher",
    }),
    "Anna Kowalska",
  );
});

test("obsługuje starsze konto z samym full_name", () => {
  assert.equal(
    resolveUserDisplayName({ metadata: { full_name: "Jan Nowak" }, role: "student" }),
    "Jan Nowak",
  );
});

test("obsługuje starsze konto z samym display_name", () => {
  assert.equal(
    resolveUserDisplayName({ profile: { display_name: "Maria Wiśniewska" }, role: "parent" }),
    "Maria Wiśniewska",
  );
});

test("konto bez danych osobowych dostaje neutralny fallback zależny od roli", () => {
  assert.equal(userGreeting({ role: "teacher" }), "Dzień dobry, Nauczycielu");
  assert.equal(userGreeting({ role: "student" }), "Dzień dobry, Uczniu");
  assert.equal(userGreeting({}), "Dzień dobry, Użytkowniku");
});

test("adres e-mail nigdy nie jest używany jako nazwa", () => {
  assert.equal(
    resolveUserDisplayName({ metadata: { display_name: "anna@example.com" }, role: "parent" }),
    "Rodzicu",
  );
});
