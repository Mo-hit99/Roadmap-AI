import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));

const PageShimmer: React.FC = () => (
  <div className="page-shimmer">
    <div className="shimmer-line wide" />
    <div className="shimmer-grid">
      <div className="shimmer-card" />
      <div className="shimmer-card" />
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="loading-screen">
      <PageShimmer />
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageShimmer />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              } 
            >
              <Route index element={<HomePage />} />
              <Route path="roadmap" element={<RoadmapPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="*" element={<HomePage />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
