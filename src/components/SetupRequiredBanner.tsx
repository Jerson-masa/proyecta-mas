import { useState } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, Database, ExternalLink, Copy, CheckCircle, Wand2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';
import { SERVER_URL, getAuthHeaders } from '../utils/supabase/client';

const SQL_SCRIPT = `-- ================================================
-- SCRIPT DE CREACIÓN DE TABLAS - PLATAFORMA CURSOS
-- ================================================
-- Ejecuta este script UNA SOLA VEZ en Supabase SQL Editor

-- Tabla principal de usuarios
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

-- Índices para optimización
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

-- Tabla de videos completados
CREATE TABLE IF NOT EXISTS video_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_video_completions_user_id ON video_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_video_completions_video_id ON video_completions(video_id);

-- Tabla de progreso de usuarios
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

-- ================================================
-- ¡TABLAS CREADAS! Ahora usa el botón "Auto-Configurar"
-- ================================================`;

export function SetupRequiredBanner() {
  const [showSQL, setShowSQL] = useState(false);
  const [creating, setCreating] = useState(false);

  const createTablesAutomatically = async () => {
    const toastId = toast.loading('🔨 Creando tablas automáticamente...');
    setCreating(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${SERVER_URL}/setup/create-tables`, {
        method: 'POST',
        headers
      });

      const data = await response.json();

      if (data.success) {
        toast.success('🎉 ¡Tablas creadas exitosamente!', { id: toastId });
        toast.info('Recargando la página...', {
          duration: 2000
        });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        // Si falla la creación automática, mostrar las instrucciones manuales
        toast.error('⚠️ No se pudieron crear automáticamente', { id: toastId });
        toast.info('Usa el método manual copiando el SQL', {
          duration: 5000
        });
        setShowSQL(true);
      }
    } catch (error) {
      console.error('Error creando tablas:', error);
      toast.error('⚠️ Error al crear tablas', { id: toastId });
      toast.info('Usa el método manual copiando el SQL', {
        duration: 5000
      });
      setShowSQL(true);
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('✅ SQL copiado al portapapeles');
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
          toast.success('✅ SQL copiado al portapapeles');
        } catch (err) {
          console.error('Fallback: Could not copy text', err);
          toast.error('❌ No se pudo copiar al portapapeles');
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Could not copy text', err);
      toast.error('❌ No se pudo copiar al portapapeles');
    }
  };

  const openSupabaseDashboard = () => {
    window.open(`https://supabase.com/dashboard/project/${projectId}/editor`, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border-2 border-red-200 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-red-900 mb-2">⚠️ ¡Las Tablas de Supabase No Existen!</h3>
          <p className="text-sm text-red-700 mb-4">
            Para que la plataforma funcione correctamente, primero debes crear las tablas en Supabase.
            Puedes hacerlo <strong>automáticamente en 10 segundos</strong> o manualmente en 1 minuto.
          </p>

          {!showSQL ? (
            <div className="flex gap-3">
              <Button
                onClick={createTablesAutomatically}
                disabled={creating}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl h-12"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                {creating ? 'Creando...' : 'Crear Automáticamente'}
              </Button>
              <Button
                onClick={() => setShowSQL(true)}
                variant="outline"
                className="flex-1 rounded-xl h-12"
              >
                <Database className="w-5 h-5 mr-2" />
                Método Manual
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Aviso sobre método automático */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Puedes intentar "Crear Automáticamente" primero (más rápido).
                </p>
              </div>

              {/* Instrucciones paso a paso */}
              <div className="bg-white rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">
                      Copia el SQL de abajo (click en "Copiar SQL")
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">
                      Abre el SQL Editor de Supabase (click en "Abrir SQL Editor")
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">
                      Pega el SQL en el editor y haz click en <strong>"Run"</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      ¡Listo! Recarga esta página y todo funcionará
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                {/* Botón para volver al método automático */}
                <Button
                  onClick={createTablesAutomatically}
                  disabled={creating}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl h-12"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  {creating ? 'Creando Tablas...' : 'Probar Creación Automática'}
                </Button>

                {/* Separador */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-500">o usa el método manual</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Botones manuales */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => copyToClipboard(SQL_SCRIPT)}
                    className="flex-1 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-xl h-12"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    Copiar SQL
                  </Button>
                  <Button
                    onClick={openSupabaseDashboard}
                    variant="outline"
                    className="flex-1 rounded-xl h-12"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Abrir SQL Editor
                  </Button>
                </div>
              </div>

              {/* Script SQL (colapsable) */}
              <details className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <summary className="cursor-pointer text-sm text-gray-700 mb-2">
                  Ver SQL completo
                </summary>
                <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap mt-2">
                  {SQL_SCRIPT}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
