import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { LoginPage } from '@/components/auth/LoginPage';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/components/admin/Dashboard';
import { EventManagement } from '@/components/admin/EventManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { SubmissionManagement } from '@/components/admin/SubmissionManagement';
import { Analytics } from '@/components/admin/Analytics';
import { StudentLayout } from '@/components/student/StudentLayout';
import { DayActivities } from '@/components/student/DayActivities';
import { MySubmissions } from '@/components/student/MySubmissions';
import { StudentDashboard } from '@/components/student/StudentDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
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
              <Route path="plans" element={<EventManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="submissions" element={<SubmissionManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<div className="p-8 text-center text-gray-600">Settings - Coming Soon</div>} />
            </Route>
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute requiredRole="STUDENT">
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DayActivities />} />
              <Route path="submissions" element={<MySubmissions />} />
              <Route path="dashboard" element={<StudentDashboard />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;