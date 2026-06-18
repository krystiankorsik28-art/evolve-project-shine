"use client";
import { useState } from "react";
import { Building2, ChevronDown, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/auth-context";

export function OrgSwitcher() {
  const { organizations, currentOrganization, setCurrentOrganization, loadOrganizations } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => { loadOrganizations(); setOpen(!open); }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all text-sm"
      >
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-neon to-neon-blue flex items-center justify-center">
          <Building2 className="w-3 h-3 text-white" />
        </div>
        <span className="text-white/80 font-medium max-w-[120px] truncate">
          {currentOrganization?.name || "Select org"}
        </span>
        <ChevronDown className="w-3 h-3 text-white/40" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-72 bg-surface border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 backdrop-blur-2xl overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-[10px] text-fg-subtle uppercase tracking-wider font-medium">Organizations</div>
              {organizations.map((org) => (
                <button key={org.id} onClick={() => { setCurrentOrganization(org); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    currentOrganization?.id === org.id ? "bg-neon/10 text-neon" : "text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-neon to-neon-blue/50 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-sm truncate">{org.name}</div>
                    <div className="text-[10px] text-fg-muted">{org.memberCount} members · {org.plan}</div>
                  </div>
                  {currentOrganization?.id === org.id && <Check className="w-3.5 h-3.5 text-neon shrink-0" />}
                </button>
              ))}
            </div>
            <div className="border-t border-white/[0.06] p-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-fg-muted hover:text-white hover:bg-white/[0.04] rounded-lg transition-all">
                <Plus className="w-3.5 h-3.5" /> Create organization
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-fg-muted hover:text-white hover:bg-white/[0.04] rounded-lg transition-all">
                <Building2 className="w-3.5 h-3.5" /> Join with code
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
