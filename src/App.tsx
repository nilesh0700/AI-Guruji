import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import { ThemeProvider } from './components/ThemeProvider';
import SupabaseAuthProvider from './components/SupabaseAuthProvider';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import AuthDebug from './components/AuthDebug';

const Home = React.lazy(() => import('./pages/Home'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const Assessments = React.lazy(() => import('./pages/Assessments'));
const AssessmentTest = React.lazy(() => import('./pages/AssessmentTest'));
const Reports = React.lazy(() => import('./pages/Reports'));
const ChatBot = React.lazy(() => import('./pages/ChatBot'));
const Settings = React.lazy(() => import('./pages/Settings'));

type PrivateRouteProps = {
  children: React.ReactNode;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, refreshSession } = useAuthStore();
  const [hasChecked, setHasChecked] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !hasChecked) {
        try {
          await refreshSession();
        } catch (error) {
          console.error('Error checking authentication:', error);
        } finally {
          setHasChecked(true);
        }
      } else if (!hasChecked) {
        setHasChecked(true);
      }
    };
    
    checkAuth();
  }, [isAuthenticated, refreshSession, hasChecked]);
  
  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && !hasChecked) {
        console.log('Auth check timed out, proceeding to login');
        setHasChecked(true);
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, hasChecked]);
  
  if (isLoading && !hasChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ThemeProvider>
      <SupabaseAuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                path="/dashboard/*"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="assessments" element={<Assessments />} />
                <Route path="assessments/:testId" element={<AssessmentTest />} />
                <Route path="reports" element={<Reports />} />
                <Route path="chatbot" element={<ChatBot />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        {import.meta.env.DEV && <AuthDebug />}
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
}

export default App;