export type DisplayRole =
  | "student"
  | "teacher"
  | "admin"
  | "parent"
  | "organization_admin"
  | "super_admin"
  | string
  | null
  | undefined;

export type NameRecord = {
  first_name?: unknown;
  last_name?: unknown;
  full_name?: unknown;
  display_name?: unknown;
} | null;

type ResolveNameInput = {
  profile?: NameRecord;
  metadata?: NameRecord;
  role?: DisplayRole;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function isPersonalName(value: string) {
  return value.length > 0 && !value.includes("@") && !/^https?:\/\//i.test(value);
}

function fullNameFromParts(source?: NameRecord) {
  if (!source) return "";
  const firstName = clean(source.first_name);
  const lastName = clean(source.last_name);
  return firstName && lastName ? `${firstName} ${lastName}` : "";
}

function firstSafe(...values: unknown[]) {
  for (const value of values) {
    const candidate = clean(value);
    if (isPersonalName(candidate)) return candidate;
  }
  return "";
}

export function roleNameFallback(role?: DisplayRole) {
  if (role === "teacher") return "Nauczycielu";
  if (role === "student") return "Uczniu";
  if (role === "parent") return "Rodzicu";
  if (role === "admin" || role === "organization_admin" || role === "super_admin") {
    return "Administratorze";
  }
  return "Użytkowniku";
}

/**
 * Zwraca nazwę przeznaczoną do nagłówków i powitań.
 * Adres e-mail celowo nie jest przyjmowany jako źródło nazwy użytkownika.
 */
export function resolveUserDisplayName({ profile, metadata, role }: ResolveNameInput) {
  return (
    firstSafe(
      fullNameFromParts(profile),
      fullNameFromParts(metadata),
      profile?.full_name,
      metadata?.full_name,
      profile?.display_name,
      metadata?.display_name,
    ) || roleNameFallback(role)
  );
}

export function userGreeting(input: ResolveNameInput) {
  return `Dzień dobry, ${resolveUserDisplayName(input)}`;
}
