import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Uczeń — EduNex.pl";
    const stored = sessionStorage.getItem("edunex_student");
    if (stored) {
      const s = JSON.parse(stored);
      navigate(`/student/exam/${s.attempt_id}`, { replace: true });
    } else {
      navigate("/auth/student", { replace: true });
    }
  }, [navigate]);

  return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
}
