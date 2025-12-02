import { ReactNode } from 'react';
import { Battery, Wifi, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  // Obtener hora actual
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  return (
    <>
      {/* Vista Desktop: Emulador de Android */}
      <div className="hidden md:flex min-h-screen bg-gray-900 items-center justify-center p-4">
        <div className="w-full max-w-[400px] h-[800px] border-[2px] border-black bg-black rounded-[45px] overflow-hidden relative shadow-2xl">
          {/* Marco exterior del dispositivo */}
          <div className="w-full h-full bg-white flex flex-col">
            {/* Barra de estado de Android */}
            <div className="bg-black text-white px-4 py-2 flex items-center justify-between text-xs flex-shrink-0">
              <div className="flex items-center gap-1">
                <span>{hours}:{minutes}</span>
              </div>
              <div className="flex items-center gap-2">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3 h-3" />
              </div>
            </div>

            {/* Contenido de la aplicación - Pantalla completa */}
            <div className="flex-1 overflow-hidden bg-white">
              <div className="w-full h-full overflow-y-auto">
                {children}
              </div>
            </div>

            {/* Botones de navegación de Android */}
            <div className="bg-black h-12 flex items-center justify-around flex-shrink-0">
              {/* Botón Atrás */}
              <button className="text-white opacity-70 hover:opacity-100 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              
              {/* Botón Inicio */}
              <button className="text-white opacity-70 hover:opacity-100 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="8"/>
                </svg>
              </button>
              
              {/* Botón Recientes */}
              <button className="text-white opacity-70 hover:opacity-100 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <rect x="7" y="7" width="10" height="10" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vista Mobile Real: Pantalla completa nativa */}
      <div className="md:hidden w-full min-h-screen bg-white flex flex-col">
        {/* Contenido de la aplicación - Pantalla completa */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}