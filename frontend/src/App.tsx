import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import LoginPage from '@/pages/auth/LoginPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboard } from '@/components/admin/Dashboard';
import { EventManagement } from '@/components/admin/EventManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { BrigadeManagement } from '@/components/admin/BrigadeManagement';
import { SubmissionManagement } from '@/components/admin/SubmissionManagement';
import { Analytics } from '@/components/admin/Analytics';
import { LogsPage } from '@/pages/admin/LogsPage';
import { StudentLayout } from '@/pages/student/StudentLayout';
import DayActivities from '@/components/student/DayActivities';
import { MySubmissions } from '@/components/student/MySubmissions';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<EventManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="brigades" element={<BrigadeManagement />} />
              <Route path="submissions" element={<SubmissionManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="logs" element={<LogsPage />} />
            </Route>
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute requiredRole="STUDENT">
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StudentDashboard />} />
              <Route path="activities" element={<DayActivities />} />
              <Route path="submissions" element={<MySubmissions />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;