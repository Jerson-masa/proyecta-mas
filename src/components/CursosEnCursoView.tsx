import { X, Clock, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { useMemo } from 'react';

interface CursosEnCursoViewProps {
  cursos: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    imagen?: string;
    modulos: Array<{
      id: string;
      titulo: string;
      videos: Array<{
        id: string;
        titulo: string;
        url: string;
      }>;
    }>;
  }>;
  userId: string;
  onClose: () => void;
  onSelectCurso: (curso: any) => void;
}

export function CursosEnCursoView({ cursos, userId, onClose, onSelectCurso }: CursosEnCursoViewProps) {
  const cursosEnProgreso = useMemo(() => {
    const cursosConProgreso = cursos.map(curso => {
      const totalVideos = curso.modulos.reduce((acc, m) => acc + m.videos.length, 0);
      
      const key = `curso_${curso.id}_user_${userId}_videos_completados`;
      const saved = localStorage.getItem(key);
      const videosCompletados = saved ? JSON.parse(saved).length : 0;
      
      const progreso = totalVideos > 0 ? Math.round((videosCompletados / totalVideos) * 100) : 0;
      
      return {
        ...curso,
        progreso,
        videosCompletados,
        totalVideos
      };
    });

    // Filtrar solo cursos que están en progreso (1-99%)
    return cursosConProgreso.filter(c => c.progreso > 0 && c.progreso < 100);
  }, [cursos, userId]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-50 overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm z-10 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white">Cursos en Progreso</h2>
              <p className="text-white/60 text-xs">{cursosEnProgreso.length} cursos activos</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-5 space-y-4 mt-4">
        {cursosEnProgreso.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-white mb-2">No hay cursos en progreso</h3>
            <p className="text-white/60 text-sm text-center">
              Comienza a ver un curso para que aparezca aquí
            </p>
          </div>
        ) : (
          cursosEnProgreso.map(curso => (
            <div
              key={curso.id}
              onClick={() => onSelectCurso(curso)}
              className="bg-white/10 backdrop-blur-sm rounded-[25px] overflow-hidden border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
            >
              {/* Imagen */}
              {curso.imagen && (
                <div className="w-full aspect-video bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] relative">
                  <img 
                    src={curso.imagen} 
                    alt={curso.titulo}
                    className="w-full h-full object-cover"
                  />
                  {/* Badge de progreso sobre la imagen */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <p className="text-white text-xs font-semibold">{curso.progreso}%</p>
                  </div>
                </div>
              )}

              {/* Contenido */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-white mb-1">{curso.titulo}</h3>
                  <p className="text-white/60 text-sm line-clamp-2">{curso.descripcion}</p>
                </div>

                {/* Progreso */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white/70 text-xs">Progreso actual</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-[#4F46E5]" />
                      <p className="text-white text-xs">{curso.videosCompletados}/{curso.totalVideos}</p>
                    </div>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] h-1 rounded-full transition-all duration-500"
                      style={{ width: `${curso.progreso}%` }}
                    />
                  </div>
                </div>

                {/* Botón continuar */}
                <Button className="w-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 text-white rounded-full">
                  Continuar Curso
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}