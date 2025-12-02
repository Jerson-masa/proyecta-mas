import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Database, Server, Key, Table } from 'lucide-react';
import { createClient, SERVER_URL } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SupabaseStatusCheckProps {
  onClose: () => void;
}

export function SupabaseStatusCheck({ onClose }: SupabaseStatusCheckProps) {
  const [checks, setChecks] = useState({
    credentials: false,
    serverHealth: false,
    authConnection: false,
    databaseTables: false,
  });
  
  const [isChecking, setIsChecking] = useState(true);
  const [details, setDetails] = useState({
    projectId: '',
    serverUrl: '',
    tablesFound: [] as string[],
    error: '',
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsChecking(true);
    const newChecks = { ...checks };
    const newDetails = { ...details };

    // 1. Verificar credenciales
    try {
      newDetails.projectId = projectId;
      newDetails.serverUrl = SERVER_URL;
      newChecks.credentials = !!(projectId && publicAnonKey);
    } catch (error) {
      newChecks.credentials = false;
    }

    // 2. Verificar salud del servidor
    try {
      const response = await fetch(`${SERVER_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      newChecks.serverHealth = response.ok;
    } catch (error) {
      newChecks.serverHealth = false;
      newDetails.error = 'No se puede conectar al servidor';
    }

    // 3. Verificar conexión de autenticación
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      newChecks.authConnection = !error;
    } catch (error) {
      newChecks.authConnection = false;
    }

    // 4. Verificar si las tablas existen
    try {
      const response = await fetch(`${SERVER_URL}/cursos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (response.ok) {
        newChecks.databaseTables = true;
        newDetails.tablesFound = ['users_platform', 'cursos', 'modulos', 'videos', 'paquetes', 'empresas', 'user_progress', 'video_completions', 'ranking_monthly'];
      } else {
        const data = await response.json();
        if (data.error?.includes('relation') || data.error?.includes('does not exist')) {
          newDetails.error = 'Las tablas de la base de datos no están creadas aún';
        }
        newChecks.databaseTables = false;
      }
    } catch (error) {
      newChecks.databaseTables = false;
    }

    setChecks(newChecks);
    setDetails(newDetails);
    setIsChecking(false);
  };

  const getOverallStatus = () => {
    const total = Object.values(checks).filter(Boolean).length;
    if (total === 4) return 'success';
    if (total >= 2) return 'warning';
    return 'error';
  };

  const status = getOverallStatus();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b ${
          status === 'success' ? 'bg-green-50 border-green-200' :
          status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-4">
            {status === 'success' && <CheckCircle className="w-12 h-12 text-green-600" />}
            {status === 'warning' && <AlertTriangle className="w-12 h-12 text-yellow-600" />}
            {status === 'error' && <XCircle className="w-12 h-12 text-red-600" />}
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Estado de Conexión Supabase
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {status === 'success' && '✅ Todo funcionando correctamente'}
                {status === 'warning' && '⚠️ Configuración parcial detectada'}
                {status === 'error' && '❌ Requiere configuración'}
              </p>
            </div>
          </div>
        </div>

        {/* Checks */}
        <div className="p-6 space-y-4">
          {/* Check 1: Credenciales */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              checks.credentials ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {checks.credentials ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Credenciales de Supabase</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {checks.credentials ? (
                  <>
                    Project ID: <code className="bg-white px-2 py-0.5 rounded text-xs">{details.projectId}</code>
                  </>
                ) : (
                  'Credenciales no encontradas'
                )}
              </p>
            </div>
          </div>

          {/* Check 2: Servidor */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              checks.serverHealth ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {checks.serverHealth ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Servidor Backend</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {checks.serverHealth ? (
                  <>Conectado a {details.serverUrl}</>
                ) : (
                  <>Servidor no responde. Verifica que las Edge Functions estén desplegadas.</>
                )}
              </p>
            </div>
          </div>

          {/* Check 3: Auth */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              checks.authConnection ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {checks.authConnection ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Sistema de Autenticación</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {checks.authConnection ? (
                  'Supabase Auth está funcionando'
                ) : (
                  'No se puede conectar al servicio de autenticación'
                )}
              </p>
            </div>
          </div>

          {/* Check 4: Tablas */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              checks.databaseTables ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {checks.databaseTables ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Tablas de Base de Datos</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {checks.databaseTables ? (
                  <>
                    {details.tablesFound.length} tablas encontradas
                    <div className="flex flex-wrap gap-1 mt-2">
                      {details.tablesFound.map(table => (
                        <span key={table} className="bg-white px-2 py-0.5 rounded text-xs border border-gray-200">
                          {table}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {details.error || 'Las tablas no han sido creadas. Ejecuta los scripts SQL en Supabase Dashboard.'}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        {!checks.databaseTables && (
          <div className="px-6 pb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Próximos Pasos
              </h4>
              <ol className="text-sm text-blue-800 mt-3 space-y-2 list-decimal list-inside">
                <li>Ve a <strong>Supabase Dashboard</strong> → SQL Editor</li>
                <li>Abre el archivo <code className="bg-white px-2 py-0.5 rounded">/SUPABASE_SETUP.md</code></li>
                <li>Copia y ejecuta todos los scripts SQL uno por uno</li>
                <li>Crea el usuario admin inicial</li>
                <li>Refresca esta página para verificar</li>
              </ol>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={runDiagnostics}
            disabled={isChecking}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {isChecking ? 'Verificando...' : '🔄 Verificar Nuevamente'}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}