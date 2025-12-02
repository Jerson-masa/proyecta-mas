import { X, TrendingUp, CheckCircle, Clock, Play, Award } from 'lucide-react';
import { Button } from './ui/button';
import { useMemo } from 'react';

interface ProgresoViewProps {
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

export function ProgresoView({ cursos, userId, onClose, onSelectCurso }: ProgresoViewProps) {
  const estadisticas = useMemo(() => {
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

    const terminados = cursosConProgreso.filter(c => c.progreso === 100).length;
    const enProgreso = cursosConProgreso.filter(c => c.progreso > 0 && c.progreso < 100).length;
    const sinIniciar = cursosConProgreso.filter(c => c.progreso === 0).length;
    
    const totalVideos = cursosConProgreso.reduce((acc, c) => acc + c.totalVideos, 0);
    const videosVistos = cursosConProgreso.reduce((acc, c) => acc + c.videosCompletados, 0);
    const progresoGeneral = totalVideos > 0 ? Math.round((videosVistos / totalVideos) * 100) : 0;

    return {
      cursos: cursosConProgreso,
      terminados,
      enProgreso,
      sinIniciar,
      totalVideos,
      videosVistos,
      progresoGeneral
    };
  }, [cursos, userId]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-50 overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm z-10 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white">Mi Progreso</h2>
              <p className="text-white/60 text-xs">Estadísticas de aprendizaje</p>
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

      {/* Estadísticas Generales */}
      <div className="px-5 space-y-4 mt-4">
        {/* Progreso General */}
        <div className="bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 backdrop-blur-sm rounded-[25px] p-5 border border-[#F59E0B]/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs">Progreso General</p>
                <p className="text-white text-2xl font-bold">{estadisticas.progresoGeneral}%</p>
              </div>
            </div>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden mb-3">
            <div 
              className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] h-1 rounded-full transition-all duration-500"
              style={{ width: `${estadisticas.progresoGeneral}%` }}
            />
          </div>
          
          <p className="text-white/60 text-xs text-center">
            {estadisticas.videosVistos} de {estadisticas.totalVideos} videos completados
          </p>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#10B981]/20 backdrop-blur-sm rounded-[20px] p-4 border border-[#10B981]/30">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/30 flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
            </div>
            <p className="text-[#10B981] text-2xl font-bold mb-1">{estadisticas.terminados}</p>
            <p className="text-white/70 text-xs">Terminados</p>
          </div>

          <div className="bg-[#4F46E5]/20 backdrop-blur-sm rounded-[20px] p-4 border border-[#4F46E5]/30">
            <div className="w-10 h-10 rounded-full bg-[#4F46E5]/30 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <p className="text-[#4F46E5] text-2xl font-bold mb-1">{estadisticas.enProgreso}</p>
            <p className="text-white/70 text-xs">En progreso</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-4 border border-white/20">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
              <Play className="w-5 h-5 text-white/60" />
            </div>
            <p className="text-white text-2xl font-bold mb-1">{estadisticas.sinIniciar}</p>
            <p className="text-white/70 text-xs">Sin iniciar</p>
          </div>
        </div>

        {/* Lista de Cursos con Progreso */}
        <div>
          <h3 className="text-white mb-3 px-1">Detalle por Curso</h3>
          <div className="space-y-3">
            {estadisticas.cursos.map(curso => (
              <div
                key={curso.id}
                onClick={() => onSelectCurso(curso)}
                className="bg-white/10 backdrop-blur-sm rounded-[20px] p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white text-sm mb-1">{curso.titulo}</h4>
                    <p className="text-white/50 text-xs">
                      {curso.videosCompletados}/{curso.totalVideos} videos
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-white font-semibold mb-1">{curso.progreso}%</p>
                    {curso.progreso === 100 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#10B981]" />
                        <span className="text-[#10B981] text-xs">Completado</span>
                      </div>
                    )}
                    {curso.progreso > 0 && curso.progreso < 100 && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#4F46E5]" />
                        <span className="text-[#4F46E5] text-xs">En curso</span>
                      </div>
                    )}
                    {curso.progreso === 0 && (
                      <span className="text-white/50 text-xs">Sin iniciar</span>
                    )}
                  </div>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}