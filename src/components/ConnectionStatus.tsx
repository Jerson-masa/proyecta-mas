import { useState, useEffect } from 'react';
import { Cloud, CloudOff, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { SERVER_URL } from '../utils/supabase/client';

interface ConnectionStatusProps {
  useSupabase: boolean;
}

export function ConnectionStatus({ useSupabase }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    checkConnection();
    
    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, [useSupabase]);

  const checkConnection = async () => {
    if (!useSupabase) {
      setStatus('disconnected');
      setLastCheck(new Date());
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 segundos timeout
      });

      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Error verificando conexión:', error);
      setStatus('disconnected');
    } finally {
      setLastCheck(new Date());
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'checking':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!useSupabase) {
      return 'Modo Local (localStorage)';
    }

    switch (status) {
      case 'connected':
        return 'Conectado a Supabase';
      case 'disconnected':
        return 'Desconectado - Usando localStorage';
      case 'checking':
        return 'Verificando conexión...';
      default:
        return 'Estado desconocido';
    }
  };

  const getStatusIcon = () => {
    if (!useSupabase) {
      return <Database className="w-4 h-4" />;
    }

    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4" />;
      case 'checking':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 flex items-center gap-3 min-w-[280px] p-[12px]">
        {/* Indicador visual */}
        <div className="relative">
          <div className={`w-10 h-10 ${getStatusColor()} rounded-lg flex items-center justify-center text-white`}>
            {useSupabase ? (
              status === 'connected' ? (
                <Cloud className="w-5 h-5" />
              ) : (
                <CloudOff className="w-5 h-5" />
              )
            ) : (
              <Database className="w-5 h-5" />
            )}
          </div>
          
          {/* Pulso animado cuando está verificando */}
          {status === 'checking' && (
            <div className="absolute inset-0 w-10 h-10 bg-yellow-400 rounded-lg animate-ping opacity-25"></div>
          )}
        </div>

        {/* Info de estado */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${
              status === 'connected' 
                ? 'text-green-700' 
                : status === 'disconnected' 
                ? 'text-red-700' 
                : 'text-yellow-700'
            }`}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="text-xs text-gray-500 mt-0.5">
            Última verificación: {lastCheck.toLocaleTimeString()}
          </div>
        </div>

        {/* Botón de refresh */}
        <button
          onClick={checkConnection}
          disabled={status === 'checking'}
          className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
            status === 'checking' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Verificar conexión"
        >
          <svg
            className={`w-4 h-4 text-gray-600 ${status === 'checking' ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Info cuando usa localStorage */}
      {!useSupabase && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Database className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium">Modo de desarrollo local</p>
              <p className="mt-1 text-blue-700">
                Los datos se guardan en localStorage. 
                Activa "Usar Supabase" para persistencia real.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}