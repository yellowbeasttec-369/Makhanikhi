import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Navbar } from './components/Navbar';
import { PublicLanding } from './components/PublicLanding';
import { PublicDemo } from './components/PublicDemo';
import { Dashboard } from './components/Dashboard';
import { ServiceBooking } from './components/ServiceBooking';
import { VerificationCenter } from './components/VerificationCenter';
import { OwnerRegistration } from './components/OwnerRegistration';
import { RegistrationFlow } from './components/RegistrationFlow';
import { Login } from './components/Login';
import { WorkshopRegistry } from './components/WorkshopRegistry';
import { BottomNav } from './components/BottomNav';
import { Toaster } from 'sonner';
import { LegalPages } from './components/LegalPages';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthReady } = useAuth();
  if (!isAuthReady) return <div className="h-screen flex items-center justify-center bg-industrial-charcoal text-technic-yellow font-black text-2xl animate-pulse">MAKHANIKHI...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isPublicMarketingRoute = location.pathname === '/' || location.pathname === '/demo' || ['/privacy', '/terms', '/community', '/data-rights'].includes(location.pathname);
  return (
    <div className="min-h-screen bg-industrial-charcoal selection:bg-technic-yellow selection:text-industrial-charcoal pb-20 md:pb-0">
      {!isPublicMarketingRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        <Route path="/demo" element={<PublicDemo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<LegalPages />} />
        <Route path="/terms" element={<LegalPages />} />
        <Route path="/community" element={<LegalPages />} />
        <Route path="/data-rights" element={<LegalPages />} />
        <Route path="/registry" element={<WorkshopRegistry />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/book" element={<ProtectedRoute><ServiceBooking /></ProtectedRoute>} />
        <Route path="/verify" element={<ProtectedRoute><VerificationCenter /></ProtectedRoute>} />
        <Route path="/register-owner" element={<ProtectedRoute><OwnerRegistration /></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute><RegistrationFlow /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
};

export default function App() {
  return <AuthProvider><Router><AppContent /></Router></AuthProvider>;
}
