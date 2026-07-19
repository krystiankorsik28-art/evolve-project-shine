import assert from "node:assert/strict";
import test from "node:test";
import { passwordRequirementState, validateNewPassword } from "./password-policy.ts";

test("accepts a strong matching password", () => {
  assert.equal(validateNewPassword("EduNex!2026Secure", "EduNex!2026Secure"), null);
  assert.equal(
    passwordRequirementState("EduNex!2026Secure").every(({ passed }) => passed),
    true,
  );
});

test("rejects a weak password", () => {
  assert.match(validateNewPassword("password", "password") || "", /wymagań bezpieczeństwa/);
});

test("rejects a confirmation mismatch", () => {
  assert.match(
    validateNewPassword("EduNex!2026Secure", "EduNex!2026Different") || "",
    /nie są identyczne/,
  );
});
