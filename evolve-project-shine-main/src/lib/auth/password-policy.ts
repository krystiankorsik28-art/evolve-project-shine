export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "co najmniej 12 znaków", test: (value: string) => value.length >= 12 },
  {
    id: "case",
    label: "mała i wielka litera",
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { id: "number", label: "co najmniej jedna cyfra", test: (value: string) => /\d/.test(value) },
  {
    id: "special",
    label: "co najmniej jeden znak specjalny",
    test: (value: string) => /[^\w\s]/.test(value),
  },
] as const;

export function passwordRequirementState(password: string) {
  return PASSWORD_REQUIREMENTS.map((requirement) => ({
    id: requirement.id,
    label: requirement.label,
    passed: requirement.test(password),
  }));
}

export function validateNewPassword(password: string, confirmation: string) {
  if (PASSWORD_REQUIREMENTS.some((requirement) => !requirement.test(password))) {
    return "Hasło nie spełnia wszystkich wymagań bezpieczeństwa.";
  }

  if (password !== confirmation) return "Wpisane hasła nie są identyczne.";
  return null;
}
