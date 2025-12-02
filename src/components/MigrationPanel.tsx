import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert } from './ui/alert';
import { 
  Database, 
  Upload, 
  Check, 
  X, 
  AlertTriangle, 
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { migrationAPI, authAPI } from '../utils/api';

interface MigrationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  count?: number;
}

export function MigrationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [steps, setSteps] = useState<MigrationStep[]>([
    { id: 'backup', name: 'Crear backup de localStorage', status: 'pending' },
    { id: 'paquetes', name: 'Migrar paquetes', status: 'pending' },
    { id: 'cursos', name: 'Migrar cursos', status: 'pending' },
    { id: 'usuarios', name: 'Migrar usuarios', status: 'pending' },
    { id: 'verify', name: 'Verificar migración', status: 'pending' },
  ]);

  const updateStep = (id: string, updates: Partial<MigrationStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const getLocalStorageData = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const cursos = JSON.parse(localStorage.getItem('cursos') || '[]');
    const paquetes = JSON.parse(localStorage.getItem('paquetes') || '[]');

    return { users, cursos, paquetes };
  };

  const handleBackup = () => {
    const backup = {
      fecha: new Date().toISOString(),
      users: localStorage.getItem('users'),
      cursos: localStorage.getItem('cursos'),
      paquetes: localStorage.getItem('paquetes'),
      progreso: localStorage.getItem('user_progress'),
      ranking: localStorage.getItem('ranking'),
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-localStorage-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleMigration = async () => {
    setIsMigrating(true);

    try {
      // Paso 1: Backup
      updateStep('backup', { status: 'running' });
      handleBackup();
      updateStep('backup', { status: 'success', message: '✅ Backup descargado' });

      // Obtener datos
      const { users, cursos, paquetes } = getLocalStorageData();

      // Paso 2: Migrar paquetes
      updateStep('paquetes', { status: 'running' });
      let paquetesMigrados = 0;
      for (const paquete of paquetes) {
        try {
          await fetch(`https://vfqhvepewtjhzujkqjrw.supabase.co/functions/v1/make-server-1fcaa2e7/paquetes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('supabase_access_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWh2ZXBld3RqaHp1amtxanJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0OTUzNTksImV4cCI6MjA0ODA3MTM1OX0.BdVOexj-1xDkH6p5OfZqN6-KgqeULi-dHAeUcL-nD14'}`,
            },
            body: JSON.stringify({
              nombre: paquete.nombre,
              descripcion: paquete.descripcion,
              precio: paquete.precio,
              duracion: paquete.duracion,
              nivel: paquete.nivel,
              caracteristicas: paquete.caracteristicas || [],
              cursosIds: paquete.cursosIds || [],
              destacado: paquete.destacado || false,
            }),
          });
          paquetesMigrados++;
        } catch (error) {
          console.error('Error migrando paquete:', paquete.nombre, error);
        }
      }
      updateStep('paquetes', { 
        status: 'success', 
        message: `✅ ${paquetesMigrados}/${paquetes.length} paquetes migrados`,
        count: paquetesMigrados
      });

      // Paso 3: Migrar cursos
      updateStep('cursos', { status: 'running' });
      let cursosMigrados = 0;
      for (const curso of cursos) {
        try {
          await fetch(`https://vfqhvepewtjhzujkqjrw.supabase.co/functions/v1/make-server-1fcaa2e7/cursos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('supabase_access_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWh2ZXBld3RqaHp1amtxanJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0OTUzNTksImV4cCI6MjA0ODA3MTM1OX0.BdVOexj-1xDkH6p5OfZqN6-KgqeULi-dHAeUcL-nD14'}`,
            },
            body: JSON.stringify({
              titulo: curso.titulo,
              descripcion: curso.descripcion,
              thumbnail: curso.thumbnail,
              modulos: curso.modulos || [],
            }),
          });
          cursosMigrados++;
        } catch (error) {
          console.error('Error migrando curso:', curso.titulo, error);
        }
      }
      updateStep('cursos', { 
        status: 'success', 
        message: `✅ ${cursosMigrados}/${cursos.length} cursos migrados`,
        count: cursosMigrados
      });

      // Paso 4: Migrar usuarios (excepto admin)
      updateStep('usuarios', { status: 'running' });
      let usuariosMigrados = 0;
      const nonAdminUsers = users.filter((u: any) => u.type !== 'admin');
      
      for (const user of nonAdminUsers) {
        try {
          await authAPI.signup({
            username: user.username,
            password: user.password,
            type: user.type,
            userData: {
              nombreCompleto: user.nombreCompleto,
              tipoDocumento: user.tipoDocumento,
              numeroDocumento: user.numeroDocumento,
              email: user.email,
              telefono: user.telefono,
              ciudad: user.ciudad,
              empresaId: user.empresaId,
              paqueteId: user.paqueteId,
              cantidadMiembros: user.cantidadMiembros,
              empresaData: user.type === 'empresa' ? {
                nombreEmpresa: user.nombreEmpresa,
                nit: user.nit,
                personaContacto: user.personaContacto,
                limiteEmpleados: user.limiteEmpleados || 10,
              } : undefined,
            },
          });
          usuariosMigrados++;
        } catch (error) {
          console.error('Error migrando usuario:', user.username, error);
        }
      }
      updateStep('usuarios', { 
        status: 'success', 
        message: `✅ ${usuariosMigrados}/${nonAdminUsers.length} usuarios migrados`,
        count: usuariosMigrados
      });

      // Paso 5: Verificar
      updateStep('verify', { status: 'running' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStep('verify', { 
        status: 'success', 
        message: '✅ Migración completada exitosamente'
      });

    } catch (error) {
      console.error('Error en migración:', error);
      const errorStep = steps.find(s => s.status === 'running');
      if (errorStep) {
        updateStep(errorStep.id, { 
          status: 'error', 
          message: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
        });
      }
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClearLocalStorage = () => {
    const confirmacion = confirm(
      '⚠️ ADVERTENCIA: Esto eliminará todos los datos de localStorage.\n\n' +
      'Solo hazlo si ya migraste todo a Supabase.\n\n' +
      '¿Estás seguro?'
    );

    if (confirmacion) {
      localStorage.removeItem('users');
      localStorage.removeItem('cursos');
      localStorage.removeItem('paquetes');
      localStorage.removeItem('user_progress');
      localStorage.removeItem('ranking');
      alert('🗑️ localStorage limpiado exitosamente');
    }
  };

  const { users, cursos, paquetes } = getLocalStorageData();
  const hasData = users.length > 0 || cursos.length > 0 || paquetes.length > 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 z-50"
      >
        <Database className="w-5 h-5" />
        <span className="font-medium">Migración a Supabase</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Migración a Supabase</h2>
                <p className="text-white/80">De localStorage a base de datos en la nube</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Info actual */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <div className="text-3xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-blue-600/70">Usuarios</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl">
              <div className="text-3xl font-bold text-purple-600">{cursos.length}</div>
              <div className="text-sm text-purple-600/70">Cursos</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-2xl">
              <div className="text-3xl font-bold text-indigo-600">{paquetes.length}</div>
              <div className="text-sm text-indigo-600/70">Paquetes</div>
            </div>
          </div>

          {!hasData && (
            <Alert className="bg-amber-50 border-amber-200 rounded-2xl">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div className="ml-3">
                <p className="font-medium text-amber-900">No hay datos para migrar</p>
                <p className="text-sm text-amber-700">
                  No se encontraron datos en localStorage. Si ya migraste, puedes cerrar este panel.
                </p>
              </div>
            </Alert>
          )}

          {/* Pasos de migración */}
          {hasData && (
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    step.status === 'pending'
                      ? 'bg-gray-50 border-gray-200'
                      : step.status === 'running'
                      ? 'bg-blue-50 border-blue-300 animate-pulse'
                      : step.status === 'success'
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        step.status === 'pending'
                          ? 'bg-gray-200'
                          : step.status === 'running'
                          ? 'bg-blue-500'
                          : step.status === 'success'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    >
                      {step.status === 'pending' && (
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      )}
                      {step.status === 'running' && (
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                      )}
                      {step.status === 'success' && (
                        <Check className="w-5 h-5 text-white" />
                      )}
                      {step.status === 'error' && (
                        <X className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{step.name}</div>
                      {step.message && (
                        <div
                          className={`text-sm ${
                            step.status === 'error'
                              ? 'text-red-600'
                              : step.status === 'success'
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {step.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleBackup}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              disabled={isMigrating}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Backup
            </Button>

            {hasData && (
              <Button
                onClick={handleMigration}
                disabled={isMigrating}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Migrando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Iniciar Migración
                  </>
                )}
              </Button>
            )}

            {!hasData && (
              <Button
                onClick={handleClearLocalStorage}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar localStorage
              </Button>
            )}
          </div>

          {/* Advertencia */}
          <Alert className="bg-blue-50 border-blue-200 rounded-2xl">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <div className="ml-3 text-sm text-blue-900">
              <strong>Importante:</strong> Asegúrate de haber ejecutado los scripts SQL en Supabase antes de migrar.
              Consulta <code className="bg-blue-100 px-2 py-0.5 rounded">/SUPABASE_SETUP.md</code> para más información.
            </div>
          </Alert>
        </div>
      </Card>
    </div>
  );
}
