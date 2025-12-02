import { Check, Star, MessageCircle, Users } from 'lucide-react';
import { Button } from './ui/button';

interface Paquete {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  cursosIds: string[];
  caracteristicas: string[];
  duracion: string;
  nivel: 'Básico' | 'Intermedio' | 'Avanzado' | 'Profesional';
  destacado?: boolean;
  workerLimit?: number;
}

interface PaquetesDisplayProps {
  paquetes: Paquete[];
}

export function PaquetesDisplay({ paquetes }: PaquetesDisplayProps) {
  const handleAdquirirPlan = (paquete: Paquete) => {
    const mensaje = `Hola, estoy interesado en adquirir el paquete *${paquete.nombre}* por COP $${paquete.precio.toLocaleString('es-CO')}`;
    const numeroWhatsApp = '573137471549'; // +57 313 7471549
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  if (paquetes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl shadow-sm">
        <p className="text-gray-500 text-sm">No hay paquetes disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paquetes.map((paquete) => (
        <div
          key={paquete.id}
          className={`relative overflow-hidden rounded-3xl shadow-xl ${paquete.destacado
            ? 'bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] p-[2px]'
            : 'bg-white'
            }`}
        >
          {paquete.destacado && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs">Destacado</span>
              </div>
            </div>
          )}

          <div className={`${paquete.destacado ? 'bg-white' : ''} rounded-3xl p-5`}>
            {/* Header del paquete */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs mb-2 ${paquete.nivel === 'Básico' ? 'bg-green-100 text-green-700' :
                    paquete.nivel === 'Intermedio' ? 'bg-blue-100 text-blue-700' :
                      paquete.nivel === 'Avanzado' ? 'bg-purple-100 text-purple-700' :
                        'bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white'
                    }`}>
                    {paquete.nivel}
                  </span>
                  <h3 className="text-gray-900 mb-1">
                    {paquete.nombre}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{paquete.descripcion}</p>
                </div>
              </div>

              {/* Precio */}
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-xs text-gray-500">COP</span>
                <span className="text-4xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                  ${paquete.precio.toLocaleString('es-CO')}
                </span>
                <span className="text-sm text-gray-500">/ {paquete.duracion}</span>
              </div>

              {/* Límite de trabajadores */}
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <Users className="w-4 h-4" />
                <span>Hasta {paquete.workerLimit || 10} trabajadores</span>
              </div>
            </div>

            {/* Características */}
            <div className="space-y-2 mb-5">
              {paquete.caracteristicas.map((caracteristica, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="mt-0.5 w-5 h-5 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 flex-1">{caracteristica}</span>
                </div>
              ))}
            </div>

            {/* Botón de WhatsApp */}
            <Button
              onClick={() => handleAdquirirPlan(paquete)}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] text-white shadow-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Adquirir este plan
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
