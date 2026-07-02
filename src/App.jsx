import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { usePrefs } from '@/hooks/usePrefs';
import Onboarding from './pages/Onboarding';
import Today from './pages/Today';
import Upcoming from './pages/Upcoming';
import Browse from './pages/Browse';
import Completed from './pages/Completed';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CompanionPreview from './pages/CompanionPreview';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();
  const { onboarded } = usePrefs();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-highlight rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // First-run gate: authenticated but not yet onboarded → full-screen setup
  // (outside AppLayout, so no nav chrome). Setting `onboarded` drops the gate.
  if (isAuthenticated && !onboarded) {
    return <Onboarding />;
  }

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected app routes — wrapped in AppLayout (header + bottom nav) */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          {/* 4 surfaces. Page bodies are shipped placeholders that later epics
              replace in-place (Focus→Epic 3, Plan→Epic 2, Archive→Epic 4). */}
          <Route path="/" element={<Today />} />                {/* Focus */}
          <Route path="/plan" element={<Upcoming />} />         {/* Plan (Upcoming + capture) */}
          <Route path="/archive" element={<Completed />} />     {/* Archive */}
          <Route path="/settings" element={<Settings />} />
          {/* Browse kept reachable (secondary plane); Epic 2 merges it into Plan. */}
          <Route path="/browse" element={<Browse />} />
          {/* Back-compat redirects for the renamed routes. */}
          <Route path="/upcoming" element={<Navigate to="/plan" replace />} />
          <Route path="/completed" element={<Navigate to="/archive" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  // DEV-ONLY: feel the win-moment without Base44 auth. Uncommitted scaffolding.
  if (typeof window !== 'undefined' && window.location.pathname === '/preview') {
    return <CompanionPreview />;
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;