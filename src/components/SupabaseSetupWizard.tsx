import { useState } from 'react';
import { Button } from './ui/button';
import { Database, CheckCircle, AlertCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';
import { SERVER_URL } from '../utils/supabase/client';
import { getAuthHeaders } from '../utils/supabase/client';

interface SupabaseSetupWizardProps {
  onClose: () => void;
}

export function SupabaseSetupWizard({ onClose }: SupabaseSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [adminUserId, setAdminUserId] = useState('');
  const [isAutoConfiguring, setIsAutoConfiguring] = useState(false);

  const sqlScript = `-- ============================================
-- CREAR TODAS LAS TABLAS
-- ============================================

-- Tabla de usuarios de la plataforma
CREATE TABLE IF NOT EXISTS users_platform (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('admin', 'empresa', 'trabajador', 'individual')),
  nombre_completo TEXT,
  tipo_documento TEXT,
  numero_documento TEXT,
  email TEXT,
  telefono TEXT,
  ciudad TEXT,
  empresa_id UUID REFERENCES users_platform(id) ON DELETE SET NULL,
  paquete_id UUID,
  cantidad_miembros INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users_platform(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_type ON users_platform(type);
CREATE INDEX IF NOT EXISTS idx_users_empresa_id ON users_platform(empresa_id);

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  nombre_empresa TEXT NOT NULL,
  nit TEXT,
  persona_contacto TEXT,
  limite_empleados INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de módulos
CREATE TABLE IF NOT EXISTS modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modulos_curso_id ON modulos(curso_id);

-- Tabla de videos
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  duracion INTEGER,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_modulo_id ON videos(modulo_id);

-- Tabla de paquetes
CREATE TABLE IF NOT EXISTS paquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10, 2) NOT NULL,
  duracion TEXT,
  nivel TEXT CHECK (nivel IN ('Básico', 'Intermedio', 'Avanzado', 'Profesional')),
  caracteristicas JSONB DEFAULT '[]'::jsonb,
  cursos_ids JSONB DEFAULT '[]'::jsonb,
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de completados de video
CREATE TABLE IF NOT EXISTS video_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_video_completions_user_id ON video_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_video_completions_video_id ON video_completions(video_id);

-- Tabla de progreso de usuario
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  videos_completados INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  porcentaje_completado INTEGER DEFAULT 0,
  ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, curso_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_curso_id ON user_progress(curso_id);

-- Tabla de ranking mensual
CREATE TABLE IF NOT EXISTS ranking_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES users_platform(id) ON DELETE SET NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  puntos INTEGER DEFAULT 0,
  cursos_completados INTEGER DEFAULT 0,
  videos_completados INTEGER DEFAULT 0,
  tiempo_total INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_ranking_monthly_user_id ON ranking_monthly(user_id);
CREATE INDEX IF NOT EXISTS idx_ranking_monthly_empresa_id ON ranking_monthly(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ranking_monthly_month_year ON ranking_monthly(month, year);

-- Habilitar RLS en todas las tablas
ALTER TABLE users_platform ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE paquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_monthly ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso desde el backend
CREATE POLICY "Service role has full access" ON users_platform FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON empresas FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON cursos FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON modulos FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON videos FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON paquetes FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON video_completions FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON user_progress FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON ranking_monthly FOR ALL USING (true);`;

  const adminInsertSQL = adminUserId 
    ? `INSERT INTO users_platform (auth_user_id, username, codigo, type, nombre_completo)
VALUES ('${adminUserId}', 'admin', 'ADMIN-1', 'admin', 'Administrador');`
    : '';

  const copyToClipboard = async (text: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('Copiado al portapapeles');
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
          toast.success('Copiado al portapapeles');
        } catch (err) {
          console.error('Fallback: Could not copy text', err);
          toast.error('No se pudo copiar al portapapeles');
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Could not copy text', err);
      toast.error('No se pudo copiar al portapapeles');
    }
  };

  const openSupabaseDashboard = () => {
    window.open(`https://supabase.com/dashboard/project/${projectId}`, '_blank');
  };

  const autoConfigureDatabase = async () => {
    setIsAutoConfiguring(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${SERVER_URL}/setup/auto`, {
        method: 'POST',
        headers,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Configuración automática completada');
        if (data.adminExists) {
          toast.info('El usuario admin ya existía');
        }
        setCurrentStep(3);
      } else {
        toast.error(data.error || 'Error en la configuración automática');
        console.error('Errores:', data.errors);
        console.log('Detalles:', data.details);
      }
    } catch (error) {
      console.error('Error en auto-configuración:', error);
      toast.error('Error de conexión. Verifica que las tablas estén creadas.');
    } finally {
      setIsAutoConfiguring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] p-8 rounded-t-3xl text-white">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-8 h-8" />
            <h2 className="text-2xl">Configuración de Supabase</h2>
          </div>
          <p className="text-white/90">Sigue estos pasos para activar la base de datos</p>
        </div>

        <div className="p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Crear Tablas */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-blue-900 mb-1">Paso 1: Crear las Tablas en Supabase</h3>
                  <p className="text-sm text-blue-700">
                    Ve al SQL Editor de Supabase y ejecuta el siguiente script
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-200">
                  <h4 className="text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Opción Automática (Recomendado)
                  </h4>
                  <p className="text-sm text-green-700 mb-3">
                    Primero ejecuta este SQL en Supabase para crear las tablas. Luego usa el botón automático del Paso 2.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={openSupabaseDashboard}
                    className="flex-1 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-xl h-12"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Abrir Supabase Dashboard
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(sqlScript)}
                    variant="outline"
                    className="rounded-xl h-12 px-6"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    Copiar SQL
                  </Button>
                </div>

                <div className="bg-gray-900 rounded-2xl p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono">
                    {sqlScript.substring(0, 500)}...
                    <span className="text-gray-500"> (Script completo copiado)</span>
                  </pre>
                </div>

                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</span>
                    <span>Click en "Abrir Supabase Dashboard"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</span>
                    <span>En el menú lateral, click en "SQL Editor"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</span>
                    <span>Click en "New Query"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">4</span>
                    <span>Pega el script SQL copiado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">5</span>
                    <span>Click en "Run" para ejecutar el script</span>
                  </li>
                </ol>

                <Button
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-xl h-12"
                >
                  Siguiente Paso
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Crear Usuario Admin */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-200">
                <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-purple-900 mb-1">Paso 2: Crear Usuario Administrador</h3>
                  <p className="text-sm text-purple-700">
                    Puedes hacerlo automático o manual
                  </p>
                </div>
              </div>

              {/* Opción Automática */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-green-900 mb-1">✨ Configuración Automática (Recomendado)</h4>
                    <p className="text-sm text-green-700">
                      Crea el usuario admin automáticamente con un solo click
                    </p>
                  </div>
                </div>
                <Button
                  onClick={autoConfigureDatabase}
                  disabled={isAutoConfiguring}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl h-12"
                >
                  {isAutoConfiguring ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Configurando...
                    </>
                  ) : (
                    <>
                      <Database className="w-5 h-5 mr-2" />
                      Configurar Automáticamente
                    </>
                  )}
                </Button>
              </div>

              {/* Separador */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">O hazlo manualmente</span>
                </div>
              </div>

              <ol className="space-y-4 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</span>
                  <div className="flex-1">
                    <p className="mb-2">En el Dashboard de Supabase, ve a <strong>"Authentication" → "Users"</strong></p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</span>
                  <div className="flex-1">
                    <p className="mb-2">Click en <strong>"Add user" → "Create new user"</strong></p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</span>
                  <div className="flex-1">
                    <p className="mb-2">Completa los datos:</p>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
                      <div>
                        <strong>Email:</strong> <code className="bg-white px-2 py-1 rounded text-purple-600">admin@plataforma.local</code>
                      </div>
                      <div>
                        <strong>Password:</strong> <code className="bg-white px-2 py-1 rounded text-purple-600">UraMarketing2025*</code>
                      </div>
                      <div>
                        <strong>Auto Confirm User:</strong> <span className="text-green-600">✓ Activado</span>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">4</span>
                  <div className="flex-1">
                    <p className="mb-2">Después de crear el usuario, <strong>copia su UUID</strong> (ID)</p>
                  </div>
                </li>
              </ol>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Pega aquí el UUID del usuario admin:</label>
                <input
                  type="text"
                  value={adminUserId}
                  onChange={(e) => setAdminUserId(e.target.value)}
                  placeholder="ej: 12345678-1234-1234-1234-123456789abc"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-1 rounded-xl h-12"
                >
                  Atrás
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!adminUserId || adminUserId.length < 30}
                  className="flex-1 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-xl h-12 disabled:opacity-50"
                >
                  Siguiente Paso
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Insertar Admin */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-green-900 mb-1">Paso 3: Insertar Registro del Admin</h3>
                  <p className="text-sm text-green-700">
                    Ejecuta este último SQL para completar la configuración
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => copyToClipboard(adminInsertSQL)}
                  variant="outline"
                  className="w-full rounded-xl h-12"
                >
                  <Copy className="w-5 h-5 mr-2" />
                  Copiar SQL del Admin
                </Button>

                <div className="bg-gray-900 rounded-2xl p-4">
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {adminInsertSQL}
                  </pre>
                </div>

                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</span>
                    <span>Regresa al SQL Editor de Supabase</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</span>
                    <span>Crea una nueva query y pega el SQL copiado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</span>
                    <span>Click en "Run"</span>
                  </li>
                </ol>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    ¡Todo listo!
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Ahora puedes iniciar sesión con:
                  </p>
                  <div className="bg-white rounded-xl p-4 space-y-2 border border-green-200">
                    <div>
                      <strong>Usuario:</strong> <code className="bg-green-50 px-2 py-1 rounded text-green-700">admin</code>
                    </div>
                    <div>
                      <strong>Contraseña:</strong> <code className="bg-green-50 px-2 py-1 rounded text-green-700">UraMarketing2025*</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                    className="flex-1 rounded-xl h-12"
                  >
                    Atrás
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success('¡Configuración completada! Recarga la página para comenzar.');
                      onClose();
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl h-12"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Finalizar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
