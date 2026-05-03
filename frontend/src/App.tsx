import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const MentorPage = lazy(() => import('./pages/MentorPage'));
const JobMatchPage = lazy(() => import('./pages/JobMatchPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const DailyPlanPage = lazy(() => import('./pages/DailyPlanPage'));
const SkillGapPage = lazy(() => import('./pages/SkillGapPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

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
              <Route index element={<RoadmapPage />} />
              <Route path="roadmap" element={<RoadmapPage />} />
              <Route path="mentor" element={<MentorPage />} />
              <Route path="job-match" element={<JobMatchPage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="daily-plan" element={<DailyPlanPage />} />
              <Route path="skill-gap" element={<SkillGapPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
