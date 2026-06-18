"use client";
import { useState } from "react";
import { Search, Bell, Sparkles, PanelLeft, PanelLeftClose, LogOut, User, Settings } from "lucide-react";
import { OrgSwitcher } from "./OrgSwitcher";
import { useAuth } from "@/lib/auth/auth-context";
import { useNavigate } from "@tanstack/react-router";

interface TopBarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function TopBar({ onToggleSidebar, sidebarOpen }: TopBarProps) {
  const { state, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-14 border-b border-white/[0.06] bg-black/60 backdrop-blur-2xl flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.04] transition-all text-white/40 hover:text-white">
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
        <OrgSwitcher />
      </div>

      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.04] transition-all text-white/40 hover:text-white">
          <Search className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.04] transition-all text-white/40 hover:text-white relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon shadow-[0_0_6px_oklch(0.85_0.18_160_/_0.6)]" />
        </button>
        <div className="relative">
          <button onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.04] transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-neon to-neon-blue flex items-center justify-center">
              <span className="text-[10px] font-bold text-black">
                {state.user?.firstName?.[0] || state.user?.email?.[0] || "?"}
              </span>
            </div>
          </button>
          {showProfile && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-surface border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 backdrop-blur-2xl overflow-hidden z-50">
              <div className="p-3 border-b border-white/[0.06]">
                <div className="text-sm font-medium text-white truncate">{state.user?.displayName || state.user?.email}</div>
                <div className="text-[10px] text-fg-muted">{state.user?.email}</div>
              </div>
              <div className="p-1">
                <button onClick={() => { setShowProfile(false); navigate({ to: "/student/dashboard" }); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all">
                  <User className="w-3.5 h-3.5" /> Profile
                </button>
                <button onClick={() => { setShowProfile(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all">
                  <Settings className="w-3.5 h-3.5" /> Settings
                </button>
              </div>
              <div className="border-t border-white/[0.06] p-1">
                <button onClick={() => { signOut(); setShowProfile(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-white/[0.04] rounded-lg transition-all">
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
