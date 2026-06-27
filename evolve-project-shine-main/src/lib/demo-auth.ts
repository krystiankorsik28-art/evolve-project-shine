export type DemoRole = "admin" | "student" | "parent";

export type DemoAccount = {
  email: string;
  role: DemoRole;
  name: string;
  target: string;
};

const DEMO_STORAGE_KEY = "edunex_demo_session";
const DEMO_PASSWORD = ["test", "123"].join("");

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "admin@test.pl", role: "admin", name: "Administrator Demo", target: "/admin" },
  { email: "student@test.pl", role: "student", name: "Uczeń Demo", target: "/student/dashboard" },
  { email: "parent@test.pl", role: "parent", name: "Rodzic Demo", target: "/parent" },
];

export function findDemoAccount(email: string, password: string, role?: string) {
  const normalized = email.trim().toLowerCase();
  if (password !== DEMO_PASSWORD) return null;
  return DEMO_ACCOUNTS.find((account) => {
    const roleMatches = !role || account.role === role;
    return account.email === normalized && roleMatches;
  }) ?? null;
}

export function startDemoSession(account: DemoAccount) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({
    email: account.email,
    role: account.role,
    name: account.name,
    startedAt: new Date().toISOString(),
  }));
}

export function getDemoSession(): { email: string; role: DemoRole; name: string; startedAt: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.email || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isDemoSessionActive(role?: DemoRole) {
  const session = getDemoSession();
  if (!session) return false;
  return role ? session.role === role : true;
}

export function clearDemoSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_STORAGE_KEY);
}
