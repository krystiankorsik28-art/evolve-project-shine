import test from "node:test";
import assert from "node:assert/strict";
import {
  digitsOnly,
  requiresManualInstitutionReview,
  validateNip,
  validateRegon,
  validateRspo,
} from "./institution-validation.ts";

test("normalizuje identyfikatory instytucji", () => {
  assert.equal(digitsOnly("123-456 78"), "12345678");
  assert.equal(validateRspo("123456"), true);
  assert.equal(validateRspo("12"), false);
});

test("sprawdza sumy kontrolne NIP i REGON", () => {
  assert.equal(validateNip("526-025-09-95"), true);
  assert.equal(validateNip("1234567890"), false);
  assert.equal(validateRegon("000331501"), true);
  assert.equal(validateRegon("123456789"), false);
});

test("oznacza skrzynki konsumenckie do dodatkowej weryfikacji", () => {
  assert.equal(requiresManualInstitutionReview("dyrektor@gmail.com"), true);
  assert.equal(requiresManualInstitutionReview("sekretariat@szkola.edu.pl"), false);
});
