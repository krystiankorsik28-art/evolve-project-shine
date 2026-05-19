import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, Users, FileText, BookOpen, ShieldAlert, ShieldCheck, Library, Activity, BarChart3, Trophy, GraduationCap, Calendar, Sparkles, Radio, FileCheck2, MessageSquare, Settings as SettingsIcon, Award, Menu, X, Search, Bell } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth, AppRole } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem { to: string; icon: typeof LayoutDashboard; label: string; }

const navByRole: Record<AppRole, NavItem[]> = {
  admin: [
    { to: "/admin", icon: LayoutDashboard, label: "Pulpit" },
    { to: "/admin/approvals", icon: ShieldCheck, label: "Akceptacje" },
    { to: "/admin/users", icon: Users, label: "Użytkownicy" },
    { to: "/admin/audit", icon: ShieldAlert, label: "Logi audytu" },
    { to: "/forum", icon: MessageSquare, label: "Forum" },
    { to: "/settings", icon: SettingsIcon, label: "Ustawienia" },
  ],
  teacher: [
    { to: "/teacher", icon: LayoutDashboard, label: "Pulpit" },
    { to: "/teacher/exams", icon: FileText, label: "Egzaminy" },
    { to: "/teacher/ai", icon: Sparkles, label: "AI Generator" },
    { to: "/teacher/bank", icon: Library, label: "Bank pytań" },
    { to: "/teacher/classes", icon: GraduationCap, label: "Klasy" },
    { to: "/teacher/homework", icon: FileCheck2, label: "Zadania" },
    { to: "/teacher/calendar", icon: Calendar, label: "Kalendarz" },
    { to: "/teacher/live-lobby", icon: Radio, label: "Live Quiz" },
    { to: "/teacher/live", icon: Activity, label: "Monitoring" },
    { to: "/teacher/analytics", icon: BarChart3, label: "Analityka" },
    { to: "/teacher/leaderboard", icon: Trophy, label: "Ranking" },
    { to: "/teacher/materials", icon: BookOpen, label: "Materiały" },
    { to: "/forum", icon: MessageSquare, label: "Forum" },
    { to: "/settings", icon: SettingsIcon, label: "Ustawienia" },
  ],
  student: [
    { to: "/student", icon: LayoutDashboard, label: "Moje egzaminy" },
    { to: "/student/achievements", icon: Award, label: "Osiągnięcia" },
    { to: "/forum", icon: MessageSquare, label: "Forum" },
    { to: "/settings", icon: SettingsIcon, label: "Ustawienia" },
  ],
};

export function AppShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const { role, signOut, user } = useAuth();
  const location = useLocation();
  const items = role ? navByRole[role] : [];
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabel = role === "admin" ? "Administrator" : role === "teacher" ? "Nauczyciel" : "Uczeń";
  const roleColor = role === "admin" ? "from-violet-600 to-indigo-700" : role === "teacher" ? "from-blue-600 to-cyan-500" : "from-cyan-500 to-emerald-500";

  const Sidebar = (
    <aside className="flex flex-col w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-full">
      <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
        <Logo size="sm" variant="light" />
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Status row */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400">System online</span>
          <span className="text-sidebar-foreground/40 ml-auto">v3.0</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-sidebar-foreground/40 px-3 mb-2 mt-1">Nawigacja</div>
        {items.map((item) => {
          const active = location.pathname === item.to || (item.to !== "/" + role && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth text-sm font-medium ${
                active
                  ? "bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-white border-l-2 border-cyan-400 shadow-cyber"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground border-l-2 border-transparent"
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-cyan-400" : ""}`} />
              <span className="truncate">{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className="px-3 py-3 rounded-lg bg-gradient-to-br from-sidebar-accent to-sidebar-accent/40 border border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-8 w-8 rounded-md bg-gradient-to-br ${roleColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
              {(user?.email || "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider font-semibold">{roleLabel}</div>
              <div className="text-xs font-medium text-sidebar-foreground truncate" title={user?.email ?? ""}>
                {user?.email ?? "—"}
              </div>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" /> Wyloguj się
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">{Sidebar}</div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25 }} className="md:hidden fixed inset-y-0 left-0 z-50">
              {Sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="md:hidden"><Logo size="sm" /></div>
              <div className="hidden md:block min-w-0">
                {title && <h1 className="text-xl font-display font-bold truncate">{title}</h1>}
                {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
              </div>
            </div>

            {/* Header utils */}
            <div className="flex items-center gap-1.5">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">All systems nominal</span>
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                <Search className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={signOut} className="md:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <motion.div
          key={location.pathname}
          className="flex-1 p-4 md:p-6 lg:p-8"
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
