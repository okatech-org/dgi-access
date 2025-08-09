import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { LoginScreen } from './components/LoginScreen';
import { SimpleDashboard } from './components/SimpleDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/Toaster';

/**
 * Route protégée qui nécessite une authentification
 */
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultRoute = user.role === 'ADMIN' ? '/admin' : '/reception';
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
}

/**
 * Route publique qui redirige vers le dashboard si l'utilisateur est connecté
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user) {
    const defaultRoute = user.role === 'ADMIN' ? '/admin' : '/reception';
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
}

/**
 * Composant pour gérer la navigation et les redirections après connexion
 */
function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Écouteur d'événements pour forcer le rechargement de l'application
  useEffect(() => {
    const handleForceUpdate = () => {
      setForceUpdate(prev => prev + 1);
      console.log('🔄 Application rechargée');
    };
    
    window.addEventListener('force-update', handleForceUpdate);
    
    return () => {
      window.removeEventListener('force-update', handleForceUpdate);
    };
  }, []);

  // Redirection après connexion vers la route demandée ou par défaut
  useEffect(() => {
    if (user && location.pathname === '/login') {
      const state = location.state as { from?: Location };
      const from = state?.from?.pathname;
      
      if (user.role === 'ADMIN') {
        if (from && from.startsWith('/admin')) {
          navigate(from, { replace: true });
        } else {
          navigate('/admin', { replace: true });
        }
      } else {
        if (from && from.startsWith('/reception')) {
          navigate(from, { replace: true });
        } else {
          navigate('/reception', { replace: true });
        }
      }
    }
  }, [user, navigate, location]);

  const updateContext = `app-${forceUpdate}-${user?.role || 'guest'}`;

  return (
    <div className="min-h-screen bg-gray-50" key={updateContext} data-app-state={updateContext}>
      <Routes>
        {/* Route d'accueil */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <HomePage onNavigateToLogin={() => navigate('/login')} />
            </PublicRoute>
          } 
        />
        
        {/* Route de connexion */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginScreen onBackToHome={() => navigate('/')} />
            </PublicRoute>
          } 
        />
        
        {/* Routes admin */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SimpleDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Routes réception */}
        <Route 
          path="/reception/*" 
          element={
            <ProtectedRoute allowedRoles={['RECEPTION']}>
              <SimpleDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;