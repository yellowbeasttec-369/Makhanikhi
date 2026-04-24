import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { ServiceBooking } from './components/ServiceBooking';
import { VerificationCenter } from './components/VerificationCenter';
import { OwnerRegistration } from './components/OwnerRegistration';
import { RegistrationFlow } from './components/RegistrationFlow';
import { Login } from './components/Login';
import { BottomNav } from './components/BottomNav';
import { Toaster } from 'sonner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-industrial-charcoal text-technic-yellow font-black text-2xl animate-pulse">MAKHANIKHI...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { error } = useAuth();

  if (error) {
    return (
      <div className="min-h-screen bg-industrial-charcoal text-digital-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service Unavailable</h1>
          <p className="text-text-dim">{error}</p>
          <p className="text-sm text-text-dim mt-4">Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-industrial-charcoal selection:bg-technic-yellow selection:text-industrial-charcoal pb-20 md:pb-0">
      <Navbar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/book" 
          element={
            <ProtectedRoute>
              <ServiceBooking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/verify" 
          element={
            <ProtectedRoute>
              <VerificationCenter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/register-owner" 
          element={
            <ProtectedRoute>
              <OwnerRegistration />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <ProtectedRoute>
              <RegistrationFlow />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      <BottomNav />
      
      <footer className="border-t border-white/5 py-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="/Makhanikhi_logo_launch.png" alt="Makhanikhi Logo" className="h-8 w-auto object-contain" referrerPolicy="no-referrer" />
            <span className="makhanikhi-logo text-xl">Makhanikhi</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <img src="/yellow beast.jpg" alt="Yellow Beast Logo" className="h-12 w-auto rounded-xl grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500" referrerPolicy="no-referrer" />
            <p className="text-digital-white/30 text-xs uppercase tracking-widest font-bold">
              Powered by <span className="text-technic-yellow">Yellow Beast (Pty) Ltd</span> R&D and Venture studio
            </p>
          </div>
          <p className="text-digital-white/20 text-[10px] mt-8">
            © 2026 Makhanikhi Specialist Mobile Mechanics. All Rights Reserved.
          </p>
        </div>
      </footer>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
