import { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { AdminPanel } from './components/AdminPanel';
import { CompanyPanel } from './components/CompanyPanel';
import { WorkerPanel } from './components/WorkerPanel';
import { IndividualPanel } from './components/IndividualPanel';
import { PublicFeed } from './components/PublicFeed';
import { authAPI, userAPI } from './utils/api';

export default function App() {
  const [view, setView] = useState<'public' | 'auth' | 'app'>('public');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authAPI.getSession();
      if (session) {
        const userData = await userAPI.getCurrentUser();
        setUser(userData.user);
        setView('app');
      } else {
        setView('public');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setView('public');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    await checkAuth();
  };

  const handleLogout = async () => {
    try {
      await authAPI.signOut();
      setUser(null);
      setView('public');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLoginRequest = () => {
    setView('auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  // Vista pública - Feed sin login
  if (view === 'public') {
    return <PublicFeed onLoginRequest={handleLoginRequest} />;
  }

  // Pantalla de autenticación
  if (view === 'auth') {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} onBack={() => setView('public')} />;
  }

  // Paneles autenticados según rol
  switch (user?.role) {
    case 'admin':
      return <AdminPanel user={user} onLogout={handleLogout} />;
    case 'company':
      return <CompanyPanel user={user} onLogout={handleLogout} />;
    case 'worker':
      return <WorkerPanel user={user} onLogout={handleLogout} />;
    case 'individual':
      return <IndividualPanel user={user} onLogout={handleLogout} />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Tipo de usuario no reconocido</p>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-indigo-600 text-white rounded-[16px] hover:bg-indigo-700 transition-all"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      );
  }
}
