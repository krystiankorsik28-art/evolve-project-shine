import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "teacher" | "student";
export type ApprovalStatus = "pending" | "approved" | "rejected";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  approvalStatus: ApprovalStatus | null;
  rejectionReason: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (uid: string | undefined) => {
    if (!uid) {
      setRole(null);
      setApprovalStatus(null);
      setRejectionReason(null);
      return;
    }
    const [{ data: roleData }, { data: rows }] = await Promise.all([
      supabase.rpc("get_primary_role", { _user_id: uid }),
      supabase.from("user_roles").select("role,approval_status,rejection_reason").eq("user_id", uid),
    ]);
    setRole((roleData as AppRole) ?? null);
    const r = (rows ?? []).find((x) => x.role === (roleData as AppRole)) ?? rows?.[0];
    setApprovalStatus(((r as { approval_status?: ApprovalStatus })?.approval_status) ?? null);
    setRejectionReason(((r as { rejection_reason?: string | null })?.rejection_reason) ?? null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) setTimeout(() => fetchRole(newSession.user!.id), 0);
      else { setRole(null); setApprovalStatus(null); }
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) fetchRole(existing.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setApprovalStatus(null);
  };

  const refreshRole = async () => { if (user) await fetchRole(user.id); };

  return (
    <AuthContext.Provider value={{ session, user, role, approvalStatus, rejectionReason, loading, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
