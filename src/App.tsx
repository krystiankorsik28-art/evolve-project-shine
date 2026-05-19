import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginAdmin from "./pages/auth/LoginAdmin";
import LoginTeacher from "./pages/auth/LoginTeacher";
import LoginStudent from "./pages/auth/LoginStudent";
import RegisterTeacher from "./pages/auth/RegisterTeacher";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminTeacherApprovals from "./pages/admin/AdminTeacherApprovals";
import TeacherPending from "./pages/teacher/TeacherPending";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherExams from "./pages/teacher/TeacherExams";
import TeacherExamEditor from "./pages/teacher/TeacherExamEditor";
import TeacherMaterials from "./pages/teacher/TeacherMaterials";
import TeacherQuestionBank from "./pages/teacher/TeacherQuestionBank";
import TeacherLiveMonitor from "./pages/teacher/TeacherLiveMonitor";
import TeacherAnalytics from "./pages/teacher/TeacherAnalytics";
import TeacherLeaderboard from "./pages/teacher/TeacherLeaderboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherCalendar from "./pages/teacher/TeacherCalendar";
import TeacherAIGenerator from "./pages/teacher/TeacherAIGenerator";
import TeacherLiveLobby from "./pages/teacher/TeacherLiveLobby";
import TeacherHomework from "./pages/teacher/TeacherHomework";
import Forum from "./pages/Forum";
import Settings from "./pages/Settings";
import StudentAchievements from "./pages/student/StudentAchievements";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentExam from "./pages/student/StudentExam";
import StudentResults from "./pages/student/StudentResults";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />

              {/* Auth */}
              <Route path="/auth/admin" element={<LoginAdmin />} />
              <Route path="/auth/teacher" element={<LoginTeacher />} />
              <Route path="/auth/student" element={<LoginStudent />} />
              <Route path="/auth/login-admin" element={<LoginAdmin />} />
              <Route path="/auth/login-teacher" element={<LoginTeacher />} />
              <Route path="/auth/login-student" element={<LoginStudent />} />
              <Route path="/auth/register-teacher" element={<RegisterTeacher />} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/audit" element={<ProtectedRoute role="admin"><AdminAudit /></ProtectedRoute>} />
              <Route path="/admin/approvals" element={<ProtectedRoute role="admin"><AdminTeacherApprovals /></ProtectedRoute>} />

              {/* Teacher */}
              <Route path="/teacher/pending" element={<ProtectedRoute role="teacher"><TeacherPending /></ProtectedRoute>} />
              <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
              <Route path="/teacher/exams" element={<ProtectedRoute role="teacher"><TeacherExams /></ProtectedRoute>} />
              <Route path="/teacher/exams/:id" element={<ProtectedRoute role="teacher"><TeacherExamEditor /></ProtectedRoute>} />
              <Route path="/teacher/materials" element={<ProtectedRoute role="teacher"><TeacherMaterials /></ProtectedRoute>} />
              <Route path="/teacher/bank" element={<ProtectedRoute role="teacher"><TeacherQuestionBank /></ProtectedRoute>} />
              <Route path="/teacher/live" element={<ProtectedRoute role="teacher"><TeacherLiveMonitor /></ProtectedRoute>} />
              <Route path="/teacher/analytics" element={<ProtectedRoute role="teacher"><TeacherAnalytics /></ProtectedRoute>} />
              <Route path="/teacher/leaderboard" element={<ProtectedRoute role="teacher"><TeacherLeaderboard /></ProtectedRoute>} />

              {/* Student */}
              <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
              {/* Egzamin i wyniki: dostępne dla anonimowych/uczniów po PIN — bez wymagania roli student */}
              <Route path="/student/exam/:attemptId" element={<StudentExam />} />
              <Route path="/student/results/:attemptId" element={<StudentResults />} />

              <Route path="/teacher/classes" element={<ProtectedRoute role="teacher"><TeacherClasses /></ProtectedRoute>} />
              <Route path="/teacher/calendar" element={<ProtectedRoute role="teacher"><TeacherCalendar /></ProtectedRoute>} />
              <Route path="/teacher/ai" element={<ProtectedRoute role="teacher"><TeacherAIGenerator /></ProtectedRoute>} />
              <Route path="/teacher/live-lobby" element={<ProtectedRoute role="teacher"><TeacherLiveLobby /></ProtectedRoute>} />
              <Route path="/teacher/homework" element={<ProtectedRoute role="teacher"><TeacherHomework /></ProtectedRoute>} />
              <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/student/achievements" element={<ProtectedRoute role="student"><StudentAchievements /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
