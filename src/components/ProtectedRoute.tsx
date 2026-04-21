import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  role?: AppRole | AppRole[];
}

export function ProtectedRoute({ children, role }: Props) {
  const { user, role: userRole, approvalStatus, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Nauczyciel pending/rejected → ekran statusu
  if (userRole === "teacher" && approvalStatus !== "approved") {
    if (location.pathname !== "/teacher/pending") {
      return <Navigate to="/teacher/pending" replace />;
    }
    return <>{children}</>;
  }

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!userRole || !roles.includes(userRole)) {
      const target =
        userRole === "admin" ? "/admin" :
        userRole === "teacher" ? "/teacher" :
        userRole === "student" ? "/student" : "/";
      return <Navigate to={target} replace />;
    }
  }

  return <>{children}</>;
}
