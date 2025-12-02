import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { GraduationCap } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const success = onLogin(username, password);
    if (!success) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8EEFF] via-[#F5F7FF] to-[#E8EEFF] flex flex-col pt-6 px-6 pb-24 overflow-auto">
      {/* Brand name en esquina superior */}
      <div className="absolute top-6 left-6">
        <h1 className="text-3xl text-gray-900">Proyecta</h1>
      </div>

      {/* Contenedor central con logo y formulario */}
      <div className="flex-1 flex flex-col items-center justify-center mb-4">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-4 shadow-lg">
            <GraduationCap className="w-10 h-10 text-[#10B981]" />
          </div>
          <h1 className="text-gray-900 mb-2">Bienvenido</h1>
          <p className="text-gray-600 text-sm">Inicia sesión para continuar</p>
        </div>

        {/* Formulario */}
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Usuario</label>
                <Input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-2xl border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Contraseña</label>
                <Input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-2xl border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-center text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white shadow-lg"
              >
                Iniciar Sesión
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Credenciales de administrador - Mejorado con más espacio */}
      <div className="w-full max-w-sm mx-auto mt-4">
        <div className="bg-white rounded-3xl shadow-lg p-5">
          <p className="text-center text-gray-700 mb-3 text-sm">Credenciales de Administrador</p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Usuario:</span>
              <span className="text-gray-900">admin</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Contraseña:</span>
              <span className="text-gray-900 text-sm">UraMarketing2025*</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}