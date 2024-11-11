import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import { ThemeProvider } from './components/ThemeProvider';
import { useThemeStore } from './store/themeStore';

const Home = React.lazy(() => import('./pages/Home'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Assessments = React.lazy(() => import('./pages/Assessments'));
const AssessmentTest = React.lazy(() => import('./pages/AssessmentTest'));
const Reports = React.lazy(() => import('./pages/Reports'));
const ChatBot = React.lazy(() => import('./pages/ChatBot'));
const Settings = React.lazy(() => import('./pages/Settings'));

type PrivateRouteProps = {
  children: React.ReactNode;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = true;
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
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
    </ThemeProvider>
  );
}

export default App;