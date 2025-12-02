import { X, Play, CheckCircle, Circle } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

interface CursoModulosViewProps {
  curso: {
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
  };
  onClose: () => void;
  onSelectVideo: (moduloIndex: number, videoIndex: number) => void;
  userId: string;
}

export function CursoModulosView({ curso, onClose, onSelectVideo, userId }: CursoModulosViewProps) {
  const [videosCompletados, setVideosCompletados] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Cargar videos completados desde localStorage
    const key = `curso_${curso.id}_user_${userId}_videos_completados`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setVideosCompletados(new Set(JSON.parse(saved)));
    }
  }, [curso.id, userId]);

  const toggleVideoCompletado = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(videosCompletados);
    if (newSet.has(videoId)) {
      newSet.delete(videoId);
    } else {
      newSet.add(videoId);
    }
    setVideosCompletados(newSet);
    
    // Guardar en localStorage
    const key = `curso_${curso.id}_user_${userId}_videos_completados`;
    localStorage.setItem(key, JSON.stringify(Array.from(newSet)));
  };

  const totalVideos = curso.modulos.reduce((acc, m) => acc + m.videos.length, 0);
  const videosVistos = videosCompletados.size;
  const progresoGeneral = totalVideos > 0 ? Math.round((videosVistos / totalVideos) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black z-50 overflow-y-auto">
      <div className="min-h-screen w-full max-w-md mx-auto pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-gray-900 to-transparent backdrop-blur-sm z-10 p-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white">Contenido del Curso</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Imagen y descripción del curso */}
        <div className="px-5 mb-6">
          {curso.imagen && (
            <div className="w-full aspect-video rounded-[30px] overflow-hidden mb-4 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED]">
              <img 
                src={curso.imagen} 
                alt={curso.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-white mb-2">{curso.titulo}</h1>
          <p className="text-white/70 text-sm mb-4">{curso.descripcion}</p>
          
          {/* Progreso General del Curso */}
          <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm">Progreso del curso</p>
              <p className="text-white font-semibold">{progresoGeneral}%</p>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#10B981] to-[#059669] h-1 rounded-full transition-all duration-500"
                style={{ width: `${progresoGeneral}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-white/60 text-xs">{videosVistos} de {totalVideos} videos completados</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-white/60 text-xs">
            <span>{curso.modulos.length} módulos</span>
            <span>•</span>
            <span>{totalVideos} videos</span>
          </div>
        </div>

        {/* Módulos y Videos */}
        <div className="px-5 space-y-4">
          {curso.modulos.map((modulo, moduloIndex) => (
            <div 
              key={modulo.id}
              className="bg-white/10 backdrop-blur-sm rounded-[25px] overflow-hidden border border-white/20"
            >
              {/* Header del módulo */}
              <div className="bg-gradient-to-r from-[#4F46E5]/30 to-[#7C3AED]/30 p-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-sm">
                    {moduloIndex + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-sm">{modulo.titulo}</h3>
                    <p className="text-white/50 text-xs">{modulo.videos.length} videos</p>
                  </div>
                </div>
              </div>

              {/* Lista de videos */}
              <div className="divide-y divide-white/10">
                {modulo.videos.map((video, videoIndex) => (
                  <button
                    key={video.id}
                    onClick={() => onSelectVideo(moduloIndex, videoIndex)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                  >
                    {/* Ícono de play */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </div>

                    {/* Info del video */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{video.titulo}</p>
                      <p className="text-white/50 text-xs">Video {videoIndex + 1}</p>
                    </div>

                    {/* Indicador de completado */}
                    {videosCompletados.has(video.id) ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}