import { User } from '../App';
import { Button } from './ui/button';
import { LogOut, Play, Home, BookOpen, UserCircle2, Trophy, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PaquetesDisplay } from './PaquetesDisplay';
import { VideoPlayer } from './VideoPlayer';
import { RankingCompetitivo } from './RankingCompetitivo';
import { CursoModulosView } from './CursoModulosView';
import { CursosListView } from './CursosListView';
import { CursosEnCursoView } from './CursosEnCursoView';
import { ProgresoView } from './ProgresoView';

interface TrabajadorPanelProps {
  user: User;
  onLogout: () => void;
}

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  thumbnail: string;
  modulos: any[];
}

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
}

interface UsuarioData {
  id: string;
  codigo: string;
  username: string;
  empresaId?: string;
  empresaNombre?: string;
  empresaCodigo?: string;
  paqueteId?: string;
  paqueteNombre?: string;
  nombreCompleto?: string;
}

export function TrabajadorPanel({ user, onLogout }: TrabajadorPanelProps) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [usuarioData, setUsuarioData] = useState<UsuarioData | null>(null);
  const [empresaData, setEmpresaData] = useState<UsuarioData | null>(null);
  const [activeTab, setActiveTab] = useState<'inicio' | 'cursos' | 'perfil'>('inicio');
  const [cursoActivo, setCursoActivo] = useState<Curso | null>(null);
  const [mostrarModulos, setMostrarModulos] = useState(false);
  const [videoSeleccionado, setVideoSeleccionado] = useState<{ modulo: number; video: number } | null>(null);
  const [vistaActual, setVistaActual] = useState<'principal' | 'cursos-list' | 'en-curso' | 'progreso'>('principal');
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [busquedaCursos, setBusquedaCursos] = useState('');

  useEffect(() => {
    // Cargar datos del usuario desde localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userData = users.find((u: UsuarioData) => u.username === user.username);
    setUsuarioData(userData || null);

    // Si es trabajador, obtener datos de su empresa
    if (userData?.empresaId) {
      const empresa = users.find((u: UsuarioData) => u.id === userData.empresaId);
      setEmpresaData(empresa || null);
    }

    // Cargar cursos creados por el admin desde localStorage
    const savedCursos = JSON.parse(localStorage.getItem('cursos') || '[]');
    setCursos(savedCursos);

    // Cargar paquetes disponibles
    const savedPaquetes = JSON.parse(localStorage.getItem('paquetes') || '[]');
    setPaquetes(savedPaquetes);
  }, [user.username]);

  // Verificar si el trabajador o su empresa tienen un paquete asignado
  const tienePlan = usuarioData?.paqueteId || empresaData?.paqueteId;

  // Si NO tiene plan, mostrar los paquetes disponibles
  if (!tienePlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8EEFF] via-[#F5F7FF] to-[#E8EEFF] pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-5 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500">Panel Trabajador</p>
                <h2 className="text-gray-900">Hola, {user.username}</h2>
              </div>
              <Button
                onClick={onLogout}
                variant="ghost"
                size="icon"
                className="rounded-2xl hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido - Sin plan */}
        <div className="px-5 py-5">
          <div className="max-w-7xl mx-auto">
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <h3 className="text-gray-900 mb-1">📦 No tienes un plan activo</h3>
            <p className="text-sm text-gray-600">
              Tu empresa aún no ha adquirido un plan. Contacta con tu administrador o elige uno de nuestros planes.
            </p>
          </div>

          <h3 className="text-gray-900 mb-4">Planes Disponibles</h3>
          <PaquetesDisplay paquetes={paquetes} />
          </div>
        </div>
      </div>
    );
  }

  const planActivo = usuarioData?.paqueteNombre || empresaData?.paqueteNombre;

  // Calcular estadísticas de progreso
  const calcularEstadisticas = () => {
    const cursosConProgreso = cursos.map(curso => {
      const totalVideos = curso.modulos.reduce((acc: number, m: any) => acc + m.videos.length, 0);
      
      const key = `curso_${curso.id}_user_${user.username}_videos_completados`;
      const saved = localStorage.getItem(key);
      const videosCompletados = saved ? JSON.parse(saved).length : 0;
      
      const progreso = totalVideos > 0 ? Math.round((videosCompletados / totalVideos) * 100) : 0;
      
      return { progreso, videosCompletados, totalVideos };
    });

    const enCurso = cursosConProgreso.filter(c => c.progreso > 0 && c.progreso < 100).length;
    const totalVideos = cursosConProgreso.reduce((acc, c) => acc + c.totalVideos, 0);
    const videosVistos = cursosConProgreso.reduce((acc, c) => acc + c.videosCompletados, 0);
    const progresoGeneral = totalVideos > 0 ? Math.round((videosVistos / totalVideos) * 100) : 0;

    return { enCurso, progresoGeneral };
  };

  const stats = calcularEstadisticas();

  // Renderizar contenido según la tab activa
  const renderContent = () => {
    if (activeTab === 'inicio') {
      return (
        <>
          {/* Header con stats */}
          <div className="bg-white border-b border-gray-100 px-5 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Panel Trabajador</p>
                  <h2 className="text-gray-900">Hola, {user.username}</h2>
                  {planActivo && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-2 py-0.5 rounded-full text-xs">
                        Plan: {planActivo}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="icon"
                  className="rounded-2xl hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setVistaActual('cursos-list')}
                  className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl p-3 text-white text-center hover:opacity-90 transition-opacity"
                >
                  <p className="text-2xl mb-0.5">{cursos.length}</p>
                  <p className="text-xs opacity-90">Cursos</p>
                </button>
                <button
                  onClick={() => setVistaActual('en-curso')}
                  className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl p-3 text-white text-center hover:opacity-90 transition-opacity"
                >
                  <p className="text-2xl mb-0.5">{stats.enCurso}</p>
                  <p className="text-xs opacity-90">En curso</p>
                </button>
                <button
                  onClick={() => setVistaActual('progreso')}
                  className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl p-3 text-white text-center hover:opacity-90 transition-opacity"
                >
                  <p className="text-2xl mb-0.5">{stats.progresoGeneral}%</p>
                  <p className="text-xs opacity-90">Progreso</p>
                </button>
              </div>
            </div>
          </div>

          {/* Content - Resumen de inicio */}
          <div className="px-5 py-5">
            <div className="max-w-7xl mx-auto">
              <h3 className="text-gray-900 mb-4">Resumen</h3>
              <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
                <p className="text-sm text-gray-600 mb-2">Bienvenido a tu panel de cursos</p>
                <p className="text-xs text-gray-500">Navega por las pestañas para ver tus cursos y perfil</p>
                {usuarioData?.empresaNombre && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Empresa</p>
                    <p className="text-sm text-gray-900">{usuarioData.empresaNombre}</p>
                  </div>
                )}
              </div>

              {/* Botón Ranking Competitivo */}
              <Button 
                onClick={() => setShowRankingModal(true)}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white shadow-lg mb-4"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Ver Ranking Competitivo
              </Button>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'cursos') {
      return (
        <>
          {/* Header simple para cursos */}
          <div className="bg-white border-b border-gray-100 px-5 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900">Mis Cursos</h2>
              </div>
            </div>
          </div>

          {/* Content - Lista de cursos */}
          <div className="px-5 py-5">
            <div className="max-w-7xl mx-auto">
              {/* Buscador de cursos */}
              {cursos.length > 0 && (
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar curso por título..."
                      value={busquedaCursos}
                      onChange={(e) => setBusquedaCursos(e.target.value)}
                      className="w-full pl-11 md:pl-12 pr-4 py-2.5 md:py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent text-sm md:text-base text-gray-900 placeholder:text-gray-400"
                    />
                    {busquedaCursos && (
                      <button
                        onClick={() => setBusquedaCursos('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {busquedaCursos && (
                    <p className="text-xs text-gray-500 mt-2 ml-1">
                      {cursos.filter(c => c.titulo.toLowerCase().includes(busquedaCursos.toLowerCase())).length} resultado{cursos.filter(c => c.titulo.toLowerCase().includes(busquedaCursos.toLowerCase())).length !== 1 ? 's' : ''} encontrado{cursos.filter(c => c.titulo.toLowerCase().includes(busquedaCursos.toLowerCase())).length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              {cursos.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl shadow-sm">
                  <p className="text-gray-500 text-sm">No hay cursos disponibles</p>
                  <p className="text-gray-400 text-xs mt-1">Los cursos aparecerán aquí cuando el administrador los cree</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cursos.filter(c => c.titulo.toLowerCase().includes(busquedaCursos.toLowerCase())).map((curso) => (
                    <div key={curso.id} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                      {/* Thumbnail */}
                      <div className="relative h-48 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED]">
                        <img 
                          src={curso.thumbnail} 
                          alt={curso.titulo}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-gray-900 mb-1">{curso.titulo}</h3>
                        <p className="text-sm text-gray-500 mb-3">{curso.descripcion}</p>

                        <Button 
                          className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white"
                          onClick={() => setCursoActivo(curso)}
                        >
                          Comenzar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'perfil') {
      return (
        <>
          {/* Header simple para perfil */}
          <div className="bg-white border-b border-gray-100 px-5 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900">Mi Perfil</h2>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="rounded-2xl hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          </div>

          {/* Content - Información del perfil */}
          <div className="px-5 py-5">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-3xl shadow-sm p-5">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-full flex items-center justify-center mb-3">
                    <UserCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-gray-900">{usuarioData?.nombreCompleto || user.username}</h3>
                  <p className="text-xs text-gray-500">Trabajador</p>
                  {usuarioData?.codigo && (
                    <div className="mt-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-3 py-1 rounded-full text-xs">
                      {usuarioData.codigo}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="pb-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Usuario</p>
                    <p className="text-sm text-gray-900">{user.username}</p>
                  </div>

                  {usuarioData?.nombreCompleto && (
                    <div className="pb-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Nombre Completo</p>
                      <p className="text-sm text-gray-900">{usuarioData.nombreCompleto}</p>
                    </div>
                  )}

                  {usuarioData?.empresaNombre && (
                    <div className="pb-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Empresa</p>
                      <p className="text-sm text-gray-900">{usuarioData.empresaNombre}</p>
                    </div>
                  )}

                  {planActivo && (
                    <div className="pb-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Plan Activo</p>
                      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-3 py-1.5 rounded-full text-sm inline-block">
                        {planActivo}
                      </div>
                      {empresaData?.paqueteNombre && (
                        <p className="text-xs text-gray-500 mt-1">Plan de empresa</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8EEFF] via-[#F5F7FF] to-[#E8EEFF] pb-20">
      {/* Contenido dinámico */}
      {renderContent()}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-3 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('inicio')}
            className="flex flex-col items-center gap-1 min-w-[70px]"
          >
            <Home 
              className={`w-6 h-6 ${
                activeTab === 'inicio' ? 'text-[#06B6D4]' : 'text-gray-400'
              }`}
            />
            <span 
              className={`text-xs ${
                activeTab === 'inicio' ? 'text-[#06B6D4]' : 'text-gray-500'
              }`}
            >
              Inicio
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cursos')}
            className="flex flex-col items-center gap-1 min-w-[70px]"
          >
            <BookOpen 
              className={`w-6 h-6 ${
                activeTab === 'cursos' ? 'text-[#06B6D4]' : 'text-gray-400'
              }`}
            />
            <span 
              className={`text-xs ${
                activeTab === 'cursos' ? 'text-[#06B6D4]' : 'text-gray-500'
              }`}
            >
              Cursos
            </span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className="flex flex-col items-center gap-1 min-w-[70px]"
          >
            <UserCircle2 
              className={`w-6 h-6 ${
                activeTab === 'perfil' ? 'text-[#06B6D4]' : 'text-gray-400'
              }`}
            />
            <span 
              className={`text-xs ${
                activeTab === 'perfil' ? 'text-[#06B6D4]' : 'text-gray-500'
              }`}
            >
              Perfil
            </span>
          </button>
        </div>
      </div>

      {/* Video Player */}
      {cursoActivo && !videoSeleccionado && (
        <CursoModulosView 
          curso={cursoActivo}
          userId={user.username}
          onClose={() => {
            setCursoActivo(null);
            setVideoSeleccionado(null);
          }}
          onSelectVideo={(moduloIndex, videoIndex) => {
            setVideoSeleccionado({ modulo: moduloIndex, video: videoIndex });
          }}
        />
      )}

      {/* Reproductor de Video */}
      {cursoActivo && videoSeleccionado && (
        <VideoPlayer 
          curso={cursoActivo}
          moduloInicial={videoSeleccionado.modulo}
          videoInicial={videoSeleccionado.video}
          userId={user.username}
          onClose={() => {
            setCursoActivo(null);
            setVideoSeleccionado(null);
          }}
          onBackToModulos={() => {
            setVideoSeleccionado(null);
          }}
        />
      )}

      {/* Vistas de Estadísticas */}
      {vistaActual === 'cursos-list' && (
        <CursosListView
          cursos={cursos}
          userId={user.username}
          onClose={() => setVistaActual('principal')}
          onSelectCurso={(curso) => {
            setVistaActual('principal');
            setCursoActivo(curso);
          }}
        />
      )}

      {vistaActual === 'en-curso' && (
        <CursosEnCursoView
          cursos={cursos}
          userId={user.username}
          onClose={() => setVistaActual('principal')}
          onSelectCurso={(curso) => {
            setVistaActual('principal');
            setCursoActivo(curso);
          }}
        />
      )}

      {vistaActual === 'progreso' && (
        <ProgresoView
          cursos={cursos}
          userId={user.username}
          onClose={() => setVistaActual('principal')}
          onSelectCurso={(curso) => {
            setVistaActual('principal');
            setCursoActivo(curso);
          }}
        />
      )}

      {/* Modal Ranking Competitivo */}
      {showRankingModal && (
        <RankingCompetitivo
          empresaId={usuarioData?.empresaId}
          currentUserId={user.username}
          onClose={() => setShowRankingModal(false)}
          isModal={true}
        />
      )}
    </div>
  );
}