import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner-toaster';
import './i18n';

// Pages - to be created
import LandingPage from '@/pages/LandingPage';
import ChatPage from '@/pages/ChatPage';
import DashboardPage from '@/pages/DashboardPage';
import CreativePage from '@/pages/CreativePage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import PricingPage from '@/pages/PricingPage';

function AppContent() {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chat/:sessionId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/creative" element={<ProtectedRoute><CreativePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </Router>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617]">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 animate-pulse flex items-center justify-center">
            <Zap className="w-5 h-5 text-slate-950" fill="currentColor" />
          </div>
        </div>
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
        className="text-cyan-400 mt-6 font-black tracking-widest uppercase text-xs"
      >
        {i18n.language === 'ar' ? 'جاري التحميل...' : 'Initializing AI...'}
      </motion.p>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="althakaa-ui-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
