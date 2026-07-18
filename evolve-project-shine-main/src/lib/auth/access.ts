import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type PortalRole = "student" | "teacher" | "parent" | "admin";
export type AccessStatus = "approved" | "pending" | "rejected" | "missing";

export const ROLE_DASHBOARD: Record<PortalRole, string> = {
  student: "/student/dashboard",
  teacher: "/teacher",
  parent: "/parent",
  admin: "/admin",
};

export const ROLE_LABEL: Record<PortalRole, string> = {
  student: "Uczeń",
  teacher: "Nauczyciel",
  parent: "Rodzic",
  admin: "Dyrekcja / administrator",
};

const ROLE_PRIORITY: PortalRole[] = ["admin", "teacher", "parent", "student"];

type RoleRow = {
  role: string;
  approval_status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
};

export type ResolvedAccess = {
  approvedRole: PortalRole | null;
  approvedRoles: PortalRole[];
  requestedRole: PortalRole | null;
  selectedRole: PortalRole | null;
  selectedStatus: AccessStatus;
  rejectionReason: string | null;
  lookupFailed: boolean;
};

export function isPortalRole(value: unknown): value is PortalRole {
  return value === "student" || value === "teacher" || value === "parent" || value === "admin";
}

function roleFromMetadata(user: User, key: "app" | "request") {
  const value =
    key === "app"
      ? user.app_metadata?.role
      : (user.user_metadata?.requested_role ?? user.user_metadata?.role);
  return isPortalRole(value) ? value : null;
}

export async function resolveUserAccess(
  user: User,
  selectedRole: PortalRole | null = null,
): Promise<ResolvedAccess> {
  const appRole = roleFromMetadata(user, "app");
  const requestedRole = roleFromMetadata(user, "request");
  const { data, error } = await supabase
    .from("user_roles")
    .select("role,approval_status,rejection_reason")
    .eq("user_id", user.id);

  const rows = (data ?? []) as RoleRow[];
  const approvedRoles = ROLE_PRIORITY.filter(
    (role) =>
      rows.some((entry) => entry.role === role && entry.approval_status === "approved") ||
      role === appRole,
  );
  const approvedRole = approvedRoles[0] ?? null;
  const inspectedRole = selectedRole ?? requestedRole ?? approvedRole;
  const inspectedRow = inspectedRole
    ? rows.find((entry) => entry.role === inspectedRole)
    : undefined;

  let selectedStatus: AccessStatus = "missing";
  if (inspectedRole && approvedRoles.includes(inspectedRole)) selectedStatus = "approved";
  else if (inspectedRow?.approval_status) selectedStatus = inspectedRow.approval_status;
  else if (inspectedRole && requestedRole === inspectedRole) selectedStatus = "pending";

  return {
    approvedRole,
    approvedRoles,
    requestedRole,
    selectedRole,
    selectedStatus,
    rejectionReason: inspectedRow?.rejection_reason ?? null,
    lookupFailed: Boolean(error),
  };
}
