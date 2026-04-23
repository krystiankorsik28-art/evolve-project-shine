import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, Users, FileText, BookOpen, ShieldAlert, ShieldCheck, Library } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth, AppRole } from "@/lib/auth";
import { motion } from "framer-motion";

interface NavItem { to: string; icon: typeof LayoutDashboard; label: string; }

const navByRole: Record<AppRole, NavItem[]> = {
  admin: [
    { to: "/admin", icon: LayoutDashboard, label: "Pulpit" },
    { to: "/admin/approvals", icon: ShieldCheck, label: "Akceptacje" },
    { to: "/admin/users", icon: Users, label: "Użytkownicy" },
    { to: "/admin/audit", icon: ShieldAlert, label: "Logi audytu" },
  ],
  teacher: [
    { to: "/teacher", icon: LayoutDashboard, label: "Pulpit" },
    { to: "/teacher/exams", icon: FileText, label: "Egzaminy" },
    { to: "/teacher/bank", icon: Library, label: "Bank pytań" },
    { to: "/teacher/materials", icon: BookOpen, label: "Materiały" },
  ],
  student: [
    { to: "/student", icon: LayoutDashboard, label: "Moje egzaminy" },
  ],
};

export function AppShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const { role, signOut, user } = useAuth();
  const location = useLocation();
  const items = role ? navByRole[role] : [];

  const roleLabel = role === "admin" ? "Administrator" : role === "teacher" ? "Nauczyciel" : "Uczeń";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <Logo size="sm" variant="light" />
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const active = location.pathname === item.to || (item.to !== "/" + role && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth text-sm font-medium ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-cyber"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="px-3 py-2.5 rounded-lg bg-sidebar-accent/40 border border-sidebar-border">
            <div className="text-[10px] text-sidebar-foreground/60 uppercase tracking-[0.18em] font-semibold mb-1">{roleLabel}</div>
            <div className="text-sm font-medium text-sidebar-foreground truncate" title={user?.email ?? ""}>
              {user?.email ?? user?.user_metadata?.display_name ?? "—"}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Wyloguj
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="md:hidden"><Logo size="sm" /></div>
            <div className="hidden md:block">
              {title && <h1 className="text-2xl font-display font-bold">{title}</h1>}
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={signOut} className="md:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <motion.div
          className="flex-1 p-6 lg:p-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
