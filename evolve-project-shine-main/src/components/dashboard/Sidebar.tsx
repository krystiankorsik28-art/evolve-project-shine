"use client";
import { useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Bot, Trophy, BookOpen, Settings, HelpCircle, Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface SidebarProps {
  open: boolean;
  role: string;
}

const ROLE_NAV: Record<string, { id: string; label: string; icon: any; href: string }[]> = {
  student: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/student/dashboard" },
    { id: "exams", label: "Exams", icon: FileText, href: "/student/dashboard" },
    { id: "ai-tutor", label: "AI Tutor", icon: Bot, href: "/student/dashboard" },
    { id: "rankings", label: "Rankings", icon: Trophy, href: "/student/dashboard" },
  ],
  teacher: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/teacher" },
    { id: "exams", label: "Exams", icon: FileText, href: "/teacher" },
    { id: "classes", label: "Classes", icon: BookOpen, href: "/teacher" },
    { id: "ai-tutor", label: "AI Tools", icon: Bot, href: "/teacher" },
  ],
  admin: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { id: "analytics", label: "Analytics", icon: FileText, href: "/admin" },
    { id: "billing", label: "Billing", icon: Settings, href: "/admin" },
  ],
  parent: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/parent/dashboard" },
    { id: "progress", label: "Progress", icon: Trophy, href: "/parent/dashboard" },
  ],
};

const BOTTOM_NAV = [
  { id: "settings", label: "Settings", icon: Settings, href: "/student/dashboard" },
  { id: "help", label: "Help", icon: HelpCircle, href: "/student/dashboard" },
];

export function Sidebar({ open, role }: SidebarProps) {
  const location = useLocation();
  const items = ROLE_NAV[role] || ROLE_NAV.student;

  return (
    <motion.aside
      animate={{ width: open ? 220 : 60 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full border-r border-white/[0.06] bg-black/40 backdrop-blur-2xl flex flex-col shrink-0 overflow-hidden"
    >
      <div className="flex-1 py-3 px-2 space-y-1">
        {items.map((item) => {
          const active = location.pathname === item.href;
          return (
            <Link key={item.id} to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap ${
                active
                  ? "bg-neon/10 text-neon border border-neon/20"
                  : "text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {open && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {open && <div className="border-t border-white/[0.06] mx-2" />}

      <div className="py-2 px-2 space-y-1">
        {BOTTOM_NAV.map((item) => (
          <Link key={item.id} to={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-all whitespace-nowrap"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {open && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </div>
    </motion.aside>
  );
}
