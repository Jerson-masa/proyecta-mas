import { X, Play, CheckCircle, Clock, Search } from 'lucide-react';
import { Button } from './ui/button';
import { useMemo, useState } from 'react';

interface CursosListViewProps {
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

export function CursosListView({ cursos, userId, onClose, onSelectCurso }: CursosListViewProps) {
  const [busquedaCursos, setBusquedaCursos] = useState('');
  
  const cursosConProgreso = useMemo(() => {
    return cursos.map(curso => {
      const totalVideos = curso.modulos.reduce((acc, m) => acc + m.videos.length, 0);
      
      // Obtener videos completados
      const key = `curso_${curso.id}_user_${userId}_videos_completados`;
      const saved = localStorage.getItem(key);
      const videosCompletados = saved ? JSON.parse(saved).length : 0;
      
      const progreso = totalVideos > 0 ? Math.round((videosCompletados / totalVideos) * 100) : 0;
      
      let estado: 'sin-iniciar' | 'en-progreso' | 'terminado' = 'sin-iniciar';
      if (progreso === 100) {
        estado = 'terminado';
      } else if (progreso > 0) {
        estado = 'en-progreso';
      }
      
      return {
        ...curso,
        progreso,
        estado,
        videosCompletados,
        totalVideos
      };
    });
  }, [cursos, userId]);

  const cursosFiltrados = useMemo(() => {
    return cursosConProgreso.filter(curso => 
      curso.titulo.toLowerCase().includes(busquedaCursos.toLowerCase()) ||
      curso.descripcion.toLowerCase().includes(busquedaCursos.toLowerCase())
    );
  }, [cursosConProgreso, busquedaCursos]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-50 overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm z-10 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white">Todos los Cursos</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-white/60 text-sm">{cursos.length} cursos disponibles</p>
      </div>

      {/* Lista de Cursos */}
      <div className="px-5 space-y-4 mt-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={busquedaCursos}
            onChange={(e) => setBusquedaCursos(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm rounded-[25px] px-4 py-2 text-white/60 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-opacity-50"
          />
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60" />
        </div>
        {cursosFiltrados.map(curso => (
          <div
            key={curso.id}
            onClick={() => onSelectCurso(curso)}
            className="bg-white/10 backdrop-blur-sm rounded-[25px] overflow-hidden border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
          >
            {/* Imagen */}
            {curso.imagen && (
              <div className="w-full aspect-video bg-gradient-to-br from-[#4F46E5] to-[#7C3AED]">
                <img 
                  src={curso.imagen} 
                  alt={curso.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Contenido */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white mb-1">{curso.titulo}</h3>
                  <p className="text-white/60 text-sm line-clamp-2">{curso.descripcion}</p>
                </div>
              </div>

              {/* Progreso */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white/70 text-xs">Progreso</p>
                  <p className="text-white text-xs font-semibold">{curso.progreso}%</p>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-1 rounded-full transition-all duration-500 ${
                      curso.progreso === 100 
                        ? 'bg-gradient-to-r from-[#10B981] to-[#059669]'
                        : curso.progreso > 0
                        ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]'
                        : 'bg-white/30'
                    }`}
                    style={{ width: `${curso.progreso}%` }}
                  />
                </div>
              </div>

              {/* Estado y Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {curso.estado === 'terminado' && (
                    <div className="flex items-center gap-1.5 bg-[#10B981]/20 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-[#10B981] text-xs">Terminado</span>
                    </div>
                  )}
                  {curso.estado === 'en-progreso' && (
                    <div className="flex items-center gap-1.5 bg-[#4F46E5]/20 px-3 py-1.5 rounded-full">
                      <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span className="text-[#4F46E5] text-xs">En progreso</span>
                    </div>
                  )}
                  {curso.estado === 'sin-iniciar' && (
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                      <Play className="w-3.5 h-3.5 text-white/60" />
                      <span className="text-white/60 text-xs">Sin iniciar</span>
                    </div>
                  )}
                </div>
                
                <p className="text-white/50 text-xs">
                  {curso.videosCompletados}/{curso.totalVideos} videos
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}