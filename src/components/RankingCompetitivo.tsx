import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Medal, Crown, X, Search } from 'lucide-react';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrofeoCustom } from './TrofeoCustom';

interface RankingCompetitivoProps {
  empresaId?: string; // Para filtrar trabajadores de una empresa
  mostrarGrafica?: boolean; // Si se muestra la gráfica de progreso
  currentUserId?: string; // Para resaltar al usuario actual
  onClose?: () => void; // Para cerrar el modal
  isModal?: boolean; // Si se muestra como modal
  mostrarBuscador?: boolean; // Si muestra el buscador (solo Admin y Empresa)
}

interface TrabajadorProgreso {
  id: string;
  username: string;
  nombreCompleto?: string;
  progreso: number;
  videosCompletados: number;
  totalVideos: number;
  empresaId?: string;
}

export function RankingCompetitivo({ 
  empresaId, 
  mostrarGrafica = false, 
  currentUserId,
  onClose,
  isModal = false,
  mostrarBuscador = false
}: RankingCompetitivoProps) {
  const [ranking, setRanking] = useState<TrabajadorProgreso[]>([]);
  const [mesActual, setMesActual] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    calcularRanking();
    
    // Obtener mes actual
    const fecha = new Date();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    setMesActual(`${meses[fecha.getMonth()]} ${fecha.getFullYear()}`);
  }, [empresaId]);

  const calcularRanking = () => {
    // Obtener todos los usuarios
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const cursos = JSON.parse(localStorage.getItem('cursos') || '[]');

    // Filtrar trabajadores
    let trabajadores = users.filter((u: any) => u.type === 'trabajador');
    
    // Si hay empresaId, filtrar solo trabajadores de esa empresa
    if (empresaId) {
      trabajadores = trabajadores.filter((t: any) => t.empresaId === empresaId);
    }

    // Calcular progreso de cada trabajador
    const trabajadoresConProgreso: TrabajadorProgreso[] = trabajadores.map((trabajador: any) => {
      let videosCompletados = 0;
      let totalVideos = 0;

      cursos.forEach((curso: any) => {
        const totalCursoVideos = curso.modulos.reduce((acc: number, m: any) => acc + m.videos.length, 0);
        totalVideos += totalCursoVideos;

        const key = `curso_${curso.id}_user_${trabajador.username}_videos_completados`;
        const saved = localStorage.getItem(key);
        if (saved) {
          videosCompletados += JSON.parse(saved).length;
        }
      });

      const progreso = totalVideos > 0 ? Math.round((videosCompletados / totalVideos) * 100) : 0;

      return {
        id: trabajador.id,
        username: trabajador.username,
        nombreCompleto: trabajador.nombreCompleto,
        progreso,
        videosCompletados,
        totalVideos,
        empresaId: trabajador.empresaId
      };
    });

    // Ordenar por progreso descendente
    trabajadoresConProgreso.sort((a, b) => {
      if (b.progreso !== a.progreso) {
        return b.progreso - a.progreso;
      }
      return b.videosCompletados - a.videosCompletados;
    });

    setRanking(trabajadoresConProgreso);
  };

  const getTrofeoIcon = (posicion: number) => {
    if (posicion < 3) {
      return <TrofeoCustom posicion={posicion as 0 | 1 | 2} size="md" />;
    }
    return null;
  };

  const getTrofeoColor = (posicion: number) => {
    if (posicion === 0) return 'from-amber-50 via-yellow-100 to-amber-50';
    if (posicion === 1) return 'from-slate-50 via-gray-100 to-slate-50';
    if (posicion === 2) return 'from-orange-50 via-amber-100 to-orange-50';
    return 'from-gray-100 to-gray-200';
  };

  // Preparar datos para la gráfica (top 10)
  const datosGrafica = ranking.slice(0, 10).map((t, index) => ({
    nombre: t.nombreCompleto?.split(' ')[0] || t.username,
    progreso: t.progreso,
    posicion: index + 1
  }));

  const getBarColor = (posicion: number) => {
    if (posicion === 1) return '#EAB308'; // Oro
    if (posicion === 2) return '#9CA3AF'; // Plata
    if (posicion === 3) return '#92400E'; // Bronce
    return '#4F46E5'; // Morado
  };

  // Filtrar ranking por búsqueda
  const rankingFiltrado = ranking.filter(trabajador => {
    if (!busqueda.trim()) return true;
    const searchLower = busqueda.toLowerCase();
    const nombre = (trabajador.nombreCompleto || trabajador.username).toLowerCase();
    return nombre.includes(searchLower);
  });

  const contenido = (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-3xl p-4 md:p-5 mb-4 md:mb-5 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Crown className="w-5 h-5 md:w-6 md:h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-white mb-0.5 text-base md:text-lg">Ranking Competitivo</h3>
              <p className="text-xs md:text-sm text-white/80">{mesActual}</p>
            </div>
          </div>
          {isModal && onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="rounded-2xl hover:bg-white/20 text-white h-9 w-9"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
          <p className="text-xs md:text-sm text-white/90">¡Sube en el ranking completando más cursos!</p>
        </div>
      </div>

      {/* Buscador (solo para Admin y Empresa) */}
      {mostrarBuscador && (
        <div className="mb-4 md:mb-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar trabajador por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-11 md:pl-12 pr-4 py-2.5 md:py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent text-sm md:text-base text-gray-900 placeholder:text-gray-400"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {busqueda && (
            <p className="text-xs text-gray-500 mt-2 ml-1">
              {rankingFiltrado.length} resultado{rankingFiltrado.length !== 1 ? 's' : ''} encontrado{rankingFiltrado.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Gráfica de progreso (top 10) */}
      {mostrarGrafica && datosGrafica.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-6">
          <h4 className="text-gray-900 mb-4">Top 10 - Progreso del Mes</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={datosGrafica}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="nombre" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}
                formatter={(value: number) => [`${value}%`, 'Progreso']}
              />
              <Bar dataKey="progreso" radius={[8, 8, 0, 0]} barSize={20}>
                {datosGrafica.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.posicion)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Lista de Ranking */}
      <div className="space-y-2 md:space-y-2.5">
        {rankingFiltrado.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-2xl mx-auto mb-3 md:mb-4 flex items-center justify-center">
              <Trophy className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No hay trabajadores en el ranking</p>
            <p className="text-gray-400 text-xs mt-1">Los trabajadores aparecerán aquí cuando completen cursos</p>
          </div>
        ) : (
          rankingFiltrado.map((trabajador, index) => {
            const esUsuarioActual = currentUserId === trabajador.username;
            const esPodio = index < 3;
            
            return (
              <div 
                key={trabajador.id}
                className={`bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  esUsuarioActual ? 'ring-2 ring-[#4F46E5] ring-offset-1 md:ring-offset-2' : ''
                }`}
              >
                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-3.5">
                  {/* Posición */}
                  <div className="flex-shrink-0">
                    {esPodio ? (
                      <div className={`w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br ${getTrofeoColor(index)} rounded-lg md:rounded-xl flex items-center justify-center shadow-md`}>
                        <div className="scale-75 md:scale-90">
                          {getTrofeoIcon(index)}
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg md:rounded-xl flex items-center justify-center">
                        <span className="text-sm md:text-base text-gray-600">#{index + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Información del trabajador */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                      <p className="text-sm md:text-base text-gray-900 truncate">
                        {trabajador.nombreCompleto || trabajador.username}
                      </p>
                      {esUsuarioActual && (
                        <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white px-1.5 md:px-2 py-0.5 rounded-full text-xs">
                          Tú
                        </span>
                      )}
                      {index === 0 && (
                        <Crown className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500" />
                      )}
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${
                            index === 0 ? 'from-yellow-400 to-yellow-600' :
                            index === 1 ? 'from-gray-300 to-gray-500' :
                            index === 2 ? 'from-amber-600 to-amber-800' :
                            'from-[#4F46E5] to-[#7C3AED]'
                          } transition-all duration-500`}
                          style={{ width: `${trabajador.progreso}%` }}
                        />
                      </div>
                      <span className="text-xs md:text-sm text-gray-600 min-w-[40px] md:min-w-[45px] text-right">
                        {trabajador.progreso}%
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-0.5 md:mt-1">
                      {trabajador.videosCompletados} de {trabajador.totalVideos} videos
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mensaje motivacional */}
      {ranking.length > 0 && (
        <div className="mt-4 md:mt-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-blue-100">
          <p className="text-xs md:text-sm text-gray-700 text-center">
            💪 ¡Sigue aprendiendo para escalar posiciones!
          </p>
        </div>
      )}
    </>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#E8EEFF] via-[#F5F7FF] to-[#E8EEFF] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          {contenido}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {contenido}
    </div>
  );
}