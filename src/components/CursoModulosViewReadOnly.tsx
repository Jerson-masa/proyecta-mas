import { X, Lock, Eye } from 'lucide-react';
import { Button } from './ui/button';

interface CursoModulosViewReadOnlyProps {
  curso: {
    id: string;
    titulo: string;
    descripcion: string;
    modulos: Array<{
      id: string;
      titulo: string;
      videos: Array<{
        id: string;
        titulo: string;
        url: string;
      }>;
    }>;
  };
  onClose: () => void;
}

export function CursoModulosViewReadOnly({ curso, onClose }: CursoModulosViewReadOnlyProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-50 overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm z-10 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-5 h-5 text-white/60" />
              <p className="text-white/60 text-xs">Vista de empresa (solo lectura)</p>
            </div>
            <h2 className="text-white">{curso.titulo}</h2>
            <p className="text-white/70 text-sm mt-1">{curso.descripcion}</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20 text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Módulos */}
      <div className="px-5 space-y-4 mt-4">
        {curso.modulos.map((modulo, moduloIndex) => (
          <div key={modulo.id} className="bg-white/5 backdrop-blur-sm rounded-[25px] overflow-hidden border border-white/10">
            {/* Header del módulo */}
            <div className="bg-gradient-to-r from-white/10 to-white/5 p-4 border-b border-white/10">
              <h3 className="text-white">
                Módulo {moduloIndex + 1}: {modulo.titulo}
              </h3>
              <p className="text-white/60 text-sm mt-1">
                {modulo.videos.length} video{modulo.videos.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Lista de videos */}
            <div className="p-3 space-y-2">
              {modulo.videos.map((video, videoIndex) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 bg-white/5 rounded-[15px] p-3 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/90 text-sm">
                      Video {videoIndex + 1}: {video.titulo}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">Solo visible para empresas</p>
                  </div>
                  <div className="shrink-0">
                    <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/20">
                      <Eye className="w-4 h-4 text-white/50" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Mensaje informativo */}
        <div className="bg-gradient-to-r from-[#8B5CF6]/20 to-[#7C3AED]/20 backdrop-blur-sm rounded-[25px] p-5 border border-[#8B5CF6]/30 mb-20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/30 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="text-white mb-1">Vista de solo lectura</h3>
              <p className="text-white/70 text-sm">
                Como empresa, puedes visualizar la estructura de los cursos y módulos que tienen acceso tus trabajadores, pero no puedes reproducir los videos. Esta vista es únicamente para supervisión y seguimiento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
