// Edge function: bezpieczne zarządzanie kontami użytkowników
// Wymaga: zalogowany admin LUB hasło bootstrap (do pierwszego uruchomienia)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-bootstrap-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOOTSTRAP_KEY = "edunex-bootstrap-2026"; // tylko do seedowania

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = await req.json();
    const action: string = body.action;

    // Autoryzacja: admin JWT lub bootstrap key
    let authorized = false;
    const bootstrap = req.headers.get("x-bootstrap-key");
    if (bootstrap === BOOTSTRAP_KEY) authorized = true;

    if (!authorized) {
      const authHeader = req.headers.get("authorization") ?? "";
      const token = authHeader.replace("Bearer ", "");
      if (token) {
        const { data: { user } } = await admin.auth.getUser(token);
        if (user) {
          const { data: roleRow } = await admin
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();
          if (roleRow) authorized = true;
        }
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === ACTIONS ===
    if (action === "create_user") {
      const { email, password, role, first_name, last_name, approval_status } = body;
      if (!email || !password || !role) {
        return new Response(JSON.stringify({ error: "missing fields" }), { status: 400, headers: corsHeaders });
      }
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: first_name ?? "",
          last_name: last_name ?? "",
          display_name: `${first_name ?? ""} ${last_name ?? ""}`.trim() || email,
          role,
        },
      });
      if (error) throw error;
      // Wymuś rolę i status (trigger może już je wstawić, więc UPDATE)
      await admin.from("user_roles").update({
        role,
        approval_status: approval_status ?? (role === "teacher" ? "pending" : "approved"),
        approved_at: approval_status === "approved" || role !== "teacher" ? new Date().toISOString() : null,
      }).eq("user_id", created.user.id);
      return new Response(JSON.stringify({ success: true, user_id: created.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_user_by_email") {
      const { email } = body;
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const target = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!target) {
        return new Response(JSON.stringify({ success: true, message: "not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await admin.auth.admin.deleteUser(target.id);
      return new Response(JSON.stringify({ success: true, deleted: target.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "approve_teacher") {
      const { user_id, approver_id } = body;
      const { error } = await admin.from("user_roles").update({
        approval_status: "approved",
        approved_by: approver_id ?? null,
        approved_at: new Date().toISOString(),
        rejection_reason: null,
      }).eq("user_id", user_id).eq("role", "teacher");
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reject_teacher") {
      const { user_id, reason, approver_id } = body;
      const { error } = await admin.from("user_roles").update({
        approval_status: "rejected",
        approved_by: approver_id ?? null,
        approved_at: new Date().toISOString(),
        rejection_reason: reason ?? "Brak uzasadnienia",
      }).eq("user_id", user_id).eq("role", "teacher");
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list_users") {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const ids = list.users.map((u) => u.id);
      const { data: roles } = await admin.from("user_roles").select("*").in("user_id", ids);
      const { data: profiles } = await admin.from("profiles").select("*").in("user_id", ids);
      const merged = list.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        profile: profiles?.find((p) => p.user_id === u.id) ?? null,
        role: roles?.find((r) => r.user_id === u.id) ?? null,
      }));
      return new Response(JSON.stringify({ users: merged }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reset_password") {
      const { user_id, new_password } = body;
      const { error } = await admin.auth.admin.updateUserById(user_id, { password: new_password });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-manage-users error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
