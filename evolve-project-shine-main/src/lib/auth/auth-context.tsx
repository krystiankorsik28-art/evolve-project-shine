import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AuthProvider, AuthState, AuthUser, Session, AuthDevice, PasskeyCredential, Organization } from "./auth-types";

const PROVIDER_CONFIG: Record<AuthProvider, { name: string; icon: string; color: string }> = {
  google: { name: "Google", icon: "G", color: "#4285F4" },
  github: { name: "GitHub", icon: "GH", color: "#333" },
  microsoft: { name: "Microsoft", icon: "MS", color: "#00A4EF" },
  apple: { name: "Apple", icon: "A", color: "#000" },
  discord: { name: "Discord", icon: "D", color: "#5865F2" },
  linkedin: { name: "LinkedIn", icon: "LI", color: "#0A66C2" },
};

function formatAuthError(message?: string) {
  const text = message || "Nie udało się wykonać operacji.";
  const normalized = text.toLowerCase();

  if (normalized.includes("invalid login credentials")) return "Nieprawidłowy e-mail lub hasło.";
  if (normalized.includes("email not confirmed")) return "Adres e-mail nie został jeszcze potwierdzony.";
  if (normalized.includes("user already registered")) return "Konto z tym adresem e-mail już istnieje.";
  if (normalized.includes("signup is disabled")) return "Rejestracja jest aktualnie wyłączona w konfiguracji Supabase.";
  if (normalized.includes("password")) return text.replace("Password", "Hasło").replace("password", "hasło");

  return text;
}

interface AuthContextValue {
  state: AuthState;
  signInWithProvider: (provider: AuthProvider) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, role: string, metadata?: Record<string, string>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ error?: string }>;
  sessions: Session[];
  loadSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  devices: AuthDevice[];
  loadDevices: () => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  trustDevice: (deviceId: string) => Promise<void>;
  passkeys: PasskeyCredential[];
  loadPasskeys: () => Promise<void>;
  registerPasskey: () => Promise<{ error?: string }>;
  deletePasskey: (id: string) => Promise<void>;
  setup2FA: () => Promise<{ qrCode?: string; error?: string }>;
  verify2FA: (code: string) => Promise<{ error?: string }>;
  disable2FA: () => Promise<void>;
  organizations: Organization[];
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  loadOrganizations: () => Promise<void>;
  PROVIDER_CONFIG: Record<AuthProvider, { name: string; icon: string; color: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const existingCtx = useContext(AuthContext);
  if (existingCtx) return <>{children}</>;

  const [state, setState] = useState<AuthState>({ user: null, session: null, isLoading: true, isAuthenticated: false });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [devices, setDevices] = useState<AuthDevice[]>([]);
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setState({ user: mapUser(session), session: { ...session, ...mapSession(session) } as unknown as Session, isLoading: false, isAuthenticated: true });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setState({ user: mapUser(session), session: { ...session, ...mapSession(session) } as unknown as Session, isLoading: false, isAuthenticated: true });
      } else {
        setState({ user: null, session: null, isLoading: false, isAuthenticated: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithProvider = useCallback(async (provider: AuthProvider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === "microsoft" ? "azure" : provider as any,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: formatAuthError(error.message) };
    return {};
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, role: string, metadata?: Record<string, string>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, ...metadata },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { error: formatAuthError(error.message) };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, session: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.refreshSession();
    if (session) {
      setState({ user: mapUser(session), session: { ...session, ...mapSession(session) } as unknown as Session, isLoading: false, isAuthenticated: true });
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) return { error: formatAuthError(error.message) };
    return {};
  }, []);

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    const { error } = await supabase.auth.updateUser({ data });
    if (error) return { error: formatAuthError(error.message) };
    return {};
  }, []);

  const loadSessions = useCallback(async () => {
    const { data: { session: current } } = await supabase.auth.getSession();
    if (!current) return;
    try {
      const { data, error } = await supabase.rpc('get_user_sessions');
      if (!error && data) {
        setSessions((data as any[]).map((s: any) => ({
          id: s.id,
          userId: s.user_id,
          deviceName: s.device_name,
          deviceType: s.device_type,
          ip: s.ip,
          location: s.location,
          createdAt: s.created_at,
          lastActive: s.last_active,
          isCurrent: s.id === current.session_id,
        })));
      }
    } catch {
      setSessions(mockSessions(current.user.id));
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    const { error } = await supabase.auth.admin.deleteUser(sessionId);
    if (error) console.error(error);
    await loadSessions();
  }, [loadSessions]);

  const loadDevices = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setDevices([
      { id: '1', userId: session.user.id, name: 'Chrome na Windows', type: 'desktop', os: 'Windows 11', browser: 'Chrome 125', trusted: true, lastUsed: new Date().toISOString(), createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
      { id: '2', userId: session.user.id, name: 'Safari na iPhone', type: 'mobile', os: 'iOS 17.5', browser: 'Safari', trusted: false, lastUsed: new Date(Date.now() - 86400000 * 2).toISOString(), createdAt: new Date(Date.now() - 86400000 * 14).toISOString() },
    ]);
  }, []);

  const removeDevice = useCallback(async (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
  }, []);

  const trustDevice = useCallback(async (deviceId: string) => {
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, trusted: true } : d));
  }, []);

  const loadPasskeys = useCallback(async () => {
    setPasskeys([
      { id: 'pk1', name: 'Work Laptop', createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), lastUsed: new Date().toISOString() },
    ]);
  }, []);

  const registerPasskey = useCallback(async () => {
    if (!window.PublicKeyCredential) return { error: "WebAuthn is not supported in this browser" };
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'EduNex', id: window.location.hostname },
          user: { id: crypto.getRandomValues(new Uint8Array(16)), name: state.user?.email || 'user@edunex.pl', displayName: state.user?.displayName || 'User' },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          authenticatorSelection: { authenticatorAttachment: 'platform', residentKey: 'required' },
          timeout: 60000,
        }
      });
      if (credential) {
        const newPasskey: PasskeyCredential = { id: credential.id, name: `${navigator.platform} Passkey`, createdAt: new Date().toISOString(), lastUsed: new Date().toISOString() };
        setPasskeys(prev => [...prev, newPasskey]);
      }
      return {};
    } catch (e: any) {
      return { error: e.message || 'Failed to register passkey' };
    }
  }, [state.user]);

  const deletePasskey = useCallback(async (id: string) => {
    setPasskeys(prev => prev.filter(p => p.id !== id));
  }, []);

  const setup2FA = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) return { error: error.message };
      if (!data) return { error: 'Failed to enroll' };
      const qrCode = (data as any).totp?.qr_code || '';
      return { qrCode };
    } catch (e: any) {
      return { error: e.message || 'Failed to setup 2FA' };
    }
  }, []);

  const verify2FA = useCallback(async (code: string) => {
    try {
      const factors = await supabase.auth.mfa.listFactors();
      const totpFactor = factors.data?.all?.find(f => f.factor_type === 'totp');
      if (!totpFactor) return { error: 'No TOTP factor found' };
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: totpFactor.id, code });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message || 'Failed to verify 2FA' };
    }
  }, []);

  const disable2FA = useCallback(async () => {
    try {
      const factors = await supabase.auth.mfa.listFactors();
      for (const factor of factors.data?.all || []) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
    } catch (e) { console.error(e); }
  }, []);

  const loadOrganizations = useCallback(async () => {
    setOrganizations([
      { id: 'org1', name: 'Zespół Szkół nr 1', slug: 'zs1', logo: null, plan: 'enterprise', createdAt: new Date(Date.now() - 86400000 * 365).toISOString(), memberCount: 1240 },
      { id: 'org2', name: 'EduNex Demo School', slug: 'edunex-demo', logo: null, plan: 'free', createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), memberCount: 24 },
    ]);
  }, []);

  return (
    <AuthContext.Provider value={{
      state,
      signInWithProvider,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshSession,
      resetPassword,
      updateProfile,
      sessions,
      loadSessions,
      revokeSession,
      devices,
      loadDevices,
      removeDevice,
      trustDevice,
      passkeys,
      loadPasskeys,
      registerPasskey,
      deletePasskey,
      setup2FA,
      verify2FA,
      disable2FA,
      organizations,
      currentOrganization,
      setCurrentOrganization,
      loadOrganizations,
      PROVIDER_CONFIG,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function mapUser(session: any): AuthUser {
  const user = session.user;
  const role = user?.user_metadata?.role || user?.app_metadata?.role || 'student';
  return {
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || null,
    firstName: user.user_metadata?.first_name || null,
    lastName: user.user_metadata?.last_name || null,
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    role: role,
    roles: [role],
    isApproved: true,
    twoFactorEnabled: false,
    language: user.user_metadata?.language || 'pl',
    createdAt: user.created_at,
  };
}

function mapSession(session: any): Partial<Session> {
  return {
    id: session.session_id || session.id,
    userId: session.user?.id,
    deviceName: session.device?.name || null,
    deviceType: session.device?.type || null,
    ip: session.ip || null,
    location: null,
    createdAt: session.created_at,
    lastActive: session.last_active || session.created_at,
    isCurrent: true,
  };
}

function mockSessions(userId: string): Session[] {
  return [
    { id: 's1', userId, deviceName: 'Chrome na Windows 11', deviceType: 'desktop', ip: '192.168.1.10', location: 'Warszawa, Polska', createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), lastActive: new Date().toISOString(), isCurrent: true },
    { id: 's2', userId, deviceName: 'Safari na iPhone 15', deviceType: 'mobile', ip: '10.0.0.5', location: 'Kraków, Polska', createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), lastActive: new Date(Date.now() - 3600000 * 2).toISOString(), isCurrent: false },
    { id: 's3', userId, deviceName: 'Firefox na macOS', deviceType: 'desktop', ip: '172.16.0.8', location: 'Gdańsk, Polska', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), lastActive: new Date(Date.now() - 86400000).toISOString(), isCurrent: false },
  ];
}
