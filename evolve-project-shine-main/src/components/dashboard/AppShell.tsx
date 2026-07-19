"use client";
import { useState, type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
  role?: string;
}

export function AppShell({ children, role = "student" }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="edunex-next-gen-panel h-screen flex flex-col bg-bg text-white overflow-hidden">
      <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar open={sidebarOpen} role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
