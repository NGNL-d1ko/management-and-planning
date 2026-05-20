import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import ToastContainer from '../components/ui/ToastContainer';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import TasksPage from '../pages/TasksPage';
import RoutinesPage from '../pages/RoutinesPage';
import KanbanPage from '../pages/KanbanPage';
import WorkspaceCalendarPage from '../pages/WorkspaceCalendarPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

const DefaultRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Navigate
      to={isAuthenticated ? '/app/dashboard' : '/login'}
      replace
    />
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<DefaultRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="routines" element={<RoutinesPage />} />
        <Route path="kanban" element={<KanbanPage />} />
        <Route path="projects" element={<Navigate to="/app/tasks" replace />} />
        <Route path="projects/:projectId" element={<Navigate to="/app/tasks" replace />} />
        <Route path="calendar" element={<WorkspaceCalendarPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

const AppRouter = () => (
  <AuthProvider>
    <ToastProvider>
      <AppRoutes />
      <ToastContainer />
    </ToastProvider>
  </AuthProvider>
);

export default AppRouter;
