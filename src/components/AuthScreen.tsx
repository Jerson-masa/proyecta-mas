import { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { Copy, User, Users, Briefcase, Shield, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onBack?: () => void;
}

export function AuthScreen({ onAuthSuccess, onBack }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminCreated, setAdminCreated] = useState(false);

  // Crear admin automáticamente al cargar
  useEffect(() => {
    createAdminIfNotExists();
  }, []);

  const createAdminIfNotExists = async () => {
    try {
      // Intentar crear el admin
      const result = await authAPI.signup('don@jerson', '123456789', 'Administrador Principal', 'admin');
      if (!result.error) {
        setAdminCreated(true);
      }
    } catch (error) {
      // Si ya existe, no hacer nada
      console.log('Admin may already exist');
    }
  };

  const quickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
    setLoading(true);

    try {
      await authAPI.signIn(userEmail, userPassword);
      onAuthSuccess();
    } catch (err: any) {
      console.error('Quick login error:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or when clipboard API is blocked
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback: Could not copy text', err);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Could not copy text', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await authAPI.signIn(email, password);
      } else {
        const result = await authAPI.signup(email, password, name, role);
        if (result.error) {
          throw new Error(result.error);
        }
        // Auto login after signup
        await authAPI.signIn(email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl">
        {/* Botón de volver */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al feed
          </button>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-gray-900 mb-2">Plataforma de Cursos</h1>
          <p className="text-gray-600">
            {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-[20px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors"
                required
                placeholder="Tu nombre completo"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-[20px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors"
              required
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-[20px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors"
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-2">Tipo de cuenta</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-[20px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors bg-white"
              >
                <option value="individual">Individual</option>
                <option value="worker">Trabajador</option>
                <option value="company">Empresa</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-[20px] border-2 border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-[20px] text-white transition-all hover:shadow-xl disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

        {/* Acceso Rápido - Solo en Login */}
        {isLogin && (
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <p className="text-center text-gray-700 mb-4">🚀 Acceso Rápido</p>
            
            {/* Admin Access */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-[20px] p-4 mb-3 border-2 border-indigo-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Administrador</p>
                  <p className="text-gray-600">Gestiona toda la plataforma</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="don@jerson"
                    readOnly
                    className="flex-1 px-3 py-2 bg-white rounded-[12px] border-2 border-indigo-200 text-gray-700"
                  />
                  <button
                    onClick={() => copyToClipboard('don@jerson')}
                    className="p-2 bg-white rounded-[12px] border-2 border-indigo-200 hover:bg-indigo-50 transition-all"
                  >
                    <Copy className="w-4 h-4 text-indigo-600" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="123456789"
                    readOnly
                    className="flex-1 px-3 py-2 bg-white rounded-[12px] border-2 border-indigo-200 text-gray-700"
                  />
                  <button
                    onClick={() => copyToClipboard('123456789')}
                    className="p-2 bg-white rounded-[12px] border-2 border-indigo-200 hover:bg-indigo-50 transition-all"
                  >
                    <Copy className="w-4 h-4 text-indigo-600" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => quickLogin('don@jerson', '123456789')}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[16px] hover:shadow-lg transition-all disabled:opacity-50"
              >
                Entrar como Administrador
              </button>
            </div>

            {/* Quick access buttons for other roles */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setIsLogin(false);
                  setRole('worker');
                }}
                className="p-3 bg-blue-50 rounded-[16px] border-2 border-blue-200 hover:bg-blue-100 transition-all"
              >
                <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <span className="text-blue-600 block">Trabajador</span>
              </button>
              
              <button
                onClick={() => {
                  setIsLogin(false);
                  setRole('company');
                }}
                className="p-3 bg-green-50 rounded-[16px] border-2 border-green-200 hover:bg-green-100 transition-all"
              >
                <Briefcase className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <span className="text-green-600 block">Empresa</span>
              </button>
              
              <button
                onClick={() => {
                  setIsLogin(false);
                  setRole('individual');
                }}
                className="p-3 bg-purple-50 rounded-[16px] border-2 border-purple-200 hover:bg-purple-100 transition-all"
              >
                <User className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <span className="text-purple-600 block">Individual</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
