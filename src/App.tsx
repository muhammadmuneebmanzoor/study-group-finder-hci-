import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { api } from './lib/api';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import GroupList from './pages/GroupList';
import GroupDetail from './pages/GroupDetail';
import GroupCreate from './pages/GroupCreate';
import Profile from './pages/Profile';

import Messages from './pages/Messages';
import Scheduler from './pages/Scheduler';
import Notifications from './pages/Notifications';
import Friends from './pages/Friends';
import Ratings from './pages/Ratings';

// Layout
import AppLayout from './components/layout/AppLayout';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  const { setUser, setLoading, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setUser, setLoading]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route element={<AppLayoutWrapper />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/groups" element={<GroupList />} />
            <Route path="/groups/create" element={<GroupCreate />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/ratings" element={<Ratings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
      <Toaster />
    </>
  );
}

// Wrapper to pass children to AppLayout from react-router Route hierarchy
import { Outlet } from 'react-router-dom';
function AppLayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
