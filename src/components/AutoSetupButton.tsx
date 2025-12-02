import { useState } from 'react';
import { Button } from './ui/button';
import { Database, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SERVER_URL } from '../utils/supabase/client';
import { getAuthHeaders } from '../utils/supabase/client';

export function AutoSetupButton() {
  const [isConfiguring, setIsConfiguring] = useState(false);

  const autoConfigureDatabase = async () => {
    setIsConfiguring(true);
    
    const toastId = toast.loading('Configurando Supabase automáticamente...');
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${SERVER_URL}/setup/auto`, {
        method: 'POST',
        headers,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('🎉 ¡Supabase configurado exitosamente!', { id: toastId });
        toast.info('Por favor recarga la página para aplicar los cambios', {
          duration: 5000,
          action: {
            label: 'Recargar',
            onClick: () => window.location.reload()
          }
        });
      } else {
        // Mostrar detalles en consola
        if (data.errors && data.errors.length > 0) {
          console.error('❌ Errores:', data.errors);
          
          // Si el error es que las tablas no existen, mostrar mensaje específico y guía
          if (data.errors.some((e: string) => e.includes('no existen') || e.includes('Could not find'))) {
            toast.error('⚠️ Las tablas no existen en Supabase', { id: toastId });
            toast.info('📋 Sigue estos pasos:', {
              duration: 10000,
              description: '1. Click en "Wizard Completo"\n2. Copia el SQL del Paso 1\n3. Pégalo en Supabase SQL Editor\n4. Luego vuelve a usar Auto-Configurar'
            });
          } else {
            toast.error(data.error || 'Error en la configuración', { id: toastId });
          }
        } else {
          toast.error(data.error || 'Error en la configuración', { id: toastId });
        }
        
        if (data.details && data.details.length > 0) {
          console.log('✅ Completado:', data.details);
        }
      }
    } catch (error) {
      console.error('Error en auto-configuración:', error);
      toast.error('Error de conexión con Supabase', { id: toastId });
      toast.info('Usa el wizard completo para configurar manualmente', {
        duration: 5000
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <Button
      onClick={autoConfigureDatabase}
      disabled={isConfiguring}
      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl h-10 px-4"
    >
      {isConfiguring ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Configurando...
        </>
      ) : (
        <>
          <Wand2 className="w-4 h-4 mr-2" />
          Auto-Configurar
        </>
      )}
    </Button>
  );
}
