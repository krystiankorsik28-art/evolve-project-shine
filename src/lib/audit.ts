import { supabase } from "@/integrations/supabase/client";

export async function logAudit(action: string, opts?: {
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      resource_type: opts?.resource_type,
      resource_id: opts?.resource_id,
      metadata: (opts?.metadata as never) ?? {},
      user_agent: navigator.userAgent,
    });
  } catch (e) {
    console.warn("audit failed", e);
  }
}
