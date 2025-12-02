import { User } from '../App';
import { Button } from './ui/button';
import { LogOut, Users, TrendingUp, BookOpen, Home, UserCircle2, Play, Crown, Search, Plus, X, MessageCircle, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PaquetesDisplay } from './PaquetesDisplay';
import { CursoModulosViewReadOnly } from './CursoModulosViewReadOnly';
import { Input } from './ui/input';
import { RankingCompetitivo } from './RankingCompetitivo';

interface EmpresaPanelProps {
  user: User;
  onLogout: () => void;
}

interface Trabajador {
  id: string;
  codigo: string;
  username: string;
  nombreCompleto?: string;
  empresaId?: string;
}

interface TrabajadorConProgreso extends Trabajador {
  cursosCompletados: number;
  cursosEnProgreso: number;
  progresoGeneral: number;
  totalVideosVistos: number;
  totalVideos: number;
}

interface EmpresaData {
  id: string;
  codigo: string;
  username: string;
  nombreEmpresa?: string;
  limiteEmpleados?: number;
  paqueteNombre?: string;
  paqueteId?: string;
}

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  thumbnail?: string;
  modulos: Array<{
    id: string;
    titulo: string;
    videos: Array<{
      id: string;
      titulo: string;
      url: string;
    }>;
  }>;
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
  limiteEmpleados?: number;
}

export function EmpresaPanel({ user, onLogout }: EmpresaPanelProps) {
  const [trabajadores, setTrabajadores] = useState<TrabajadorConProgreso[]>([]);
  const [empresaData, setEmpresaData] = useState<EmpresaData | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [activeTab, setActiveTab] = useState<'inicio' | 'cursos' | 'perfil'>('inicio');
  const [cursoActivo, setCursoActivo] = useState<Curso | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [busquedaCursos, setBusquedaCursos] = useState('');
  const [showAmpliarPlanModal, setShowAmpliarPlanModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [cantidadNuevosTrabajadores, setCantidadNuevosTrabajadores] = useState(1);
  const [nuevosTrabajadores, setNuevosTrabajadores] = useState<Array<{nombre: string; cedula: string}>>([{nombre: '', cedula: ''}]);

  // Función para calcular el progreso de un trabajador en todos los cursos
  const calcularProgresoTrabajador = (trabajadorUsername: string, cursos: Curso[]) => {
    let cursosCompletados = 0;
    let cursosEnProgreso = 0;
    let totalVideosVistos = 0;
    let totalVideos = 0;

    cursos.forEach(curso => {
      const totalVideosCurso = curso.modulos.reduce((acc, m) => acc + m.videos.length, 0);
      totalVideos += totalVideosCurso;

      const key = `curso_${curso.id}_user_${trabajadorUsername}_videos_completados`;
      const saved = localStorage.getItem(key);
      const videosCompletados = saved ? JSON.parse(saved).length : 0;
      totalVideosVistos += videosCompletados;

      const progresoCurso = totalVideosCurso > 0 ? Math.round((videosCompletados / totalVideosCurso) * 100) : 0;

      if (progresoCurso === 100) {
        cursosCompletados++;
      } else if (progresoCurso > 0) {
        cursosEnProgreso++;
      }
    });

    const progresoGeneral = totalVideos > 0 ? Math.round((totalVideosVistos / totalVideos) * 100) : 0;

    return {
      cursosCompletados,
      cursosEnProgreso,
      progresoGeneral,
      totalVideosVistos,
      totalVideos
    };
  };

  useEffect(() => {
    // Cargar cursos y paquetes
    const savedCursos = JSON.parse(localStorage.getItem('cursos') || '[]');
    const savedPaquetes = JSON.parse(localStorage.getItem('paquetes') || '[]');
    setCursos(savedCursos);
    setPaquetes(savedPaquetes);

    // Cargar datos de la empresa desde localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const empresa = users.find((u: EmpresaData) => u.username === user.username);
    setEmpresaData(empresa || null);

    // Cargar trabajadores de esta empresa con su progreso
    if (empresa) {
      const trabajadoresEmpresa = users.filter((u: Trabajador) => 
        u.empresaId === empresa.id
      );

      // Calcular progreso para cada trabajador
      const trabajadoresConProgreso = trabajadoresEmpresa.map((trabajador: Trabajador) => {
        const progreso = calcularProgresoTrabajador(trabajador.username, savedCursos);
        return {
          ...trabajador,
          ...progreso
        };
      });

      setTrabajadores(trabajadoresConProgreso);
    }
  }, [user.username]);

  // Calcular estadísticas generales de la empresa
  const estadisticasGenerales = trabajadores.reduce((acc, t) => ({
    totalCursosCompletados: acc.totalCursosCompletados + t.cursosCompletados,
    totalCursosEnProgreso: acc.totalCursosEnProgreso + t.cursosEnProgreso,
    totalVideosVistos: acc.totalVideosVistos + t.totalVideosVistos,
    totalVideos: acc.totalVideos + t.totalVideos
  }), { totalCursosCompletados: 0, totalCursosEnProgreso: 0, totalVideosVistos: 0, totalVideos: 0 });

  const progresoGeneralEmpresa = estadisticasGenerales.totalVideos > 0 
    ? Math.round((estadisticasGenerales.totalVideosVistos / estadisticasGenerales.totalVideos) * 100) 
    : 0;

  // Filtrar trabajadores según búsqueda
  const trabajadoresFiltrados = trabajadores.filter(t => 
    (t.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Funciones para el modal de ampliar plan
  const handleCantidadChange = (cantidad: number) => {
    const cant = Math.max(1, cantidad);
    setCantidadNuevosTrabajadores(cant);
    const nuevosArray = Array(cant).fill(null).map((_, i) => 
      nuevosTrabajadores[i] || {nombre: '', cedula: ''}
    );
    setNuevosTrabajadores(nuevosArray);
  };

  const handleTrabajadorChange = (index: number, field: 'nombre' | 'cedula', value: string) => {
    const updated = [...nuevosTrabajadores];
    updated[index] = {...updated[index], [field]: value};
    setNuevosTrabajadores(updated);
  };

  const handleEnviarWhatsApp = () => {
    const mensaje = `*SOLICITUD DE AMPLIACIÓN DE PLAN*\n\n` +
      `*Datos de la Empresa:*\n` +
      `📌 Nombre: ${empresaData?.nombreEmpresa || user.username}\n` +
      `📌 Código: ${empresaData?.codigo || 'N/A'}\n` +
      `📌 Plan Actual: ${empresaData?.paqueteNombre || 'Sin plan'}\n` +
      `📌 Límite Actual: ${empresaData?.limiteEmpleados || 0} empleados\n\n` +
      `*Trabajadores a Agregar: ${cantidadNuevosTrabajadores}*\n\n` +
      nuevosTrabajadores.map((t, i) => 
        `${i + 1}. Nombre: ${t.nombre || 'Sin especificar'}\n   Cédula: ${t.cedula || 'Sin especificar'}`
      ).join('\n\n') +
      `\n\n_Enviado desde Panel Empresa_`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Renderizar contenido según la tab activa
  const renderContent = () => {
    if (cursoActivo) {
      return (
        <CursoModulosViewReadOnly 
          curso={cursoActivo}
          onClose={() => setCursoActivo(null)}
        />
      );
    }

    switch (activeTab) {
      case 'inicio':
        return renderInicio();
      case 'cursos':
        return renderCursos();
      case 'perfil':
        return renderPerfil();
      default:
        return null;
    }
  };

  const renderInicio = () => (
    <div className="pb-24">
      {/* Estadísticas Generales de la Empresa */}
      {trabajadores.length > 0 && (
        <div className="bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 backdrop-blur-sm rounded-3xl p-5 mb-4 border border-[#F59E0B]/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900">Progreso General de la Empresa</h3>
              <p className="text-xs text-gray-600">{progresoGeneralEmpresa}% completado</p>
            </div>
          </div>

          <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden mb-4">
            <div 
              className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progresoGeneralEmpresa}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/70 rounded-xl p-3 text-center">
              <p className="text-2xl text-green-700 mb-0.5">{estadisticasGenerales.totalCursosCompletados}</p>
              <p className="text-xs text-gray-600">Cursos completados</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3 text-center">
              <p className="text-2xl text-blue-700 mb-0.5">{estadisticasGenerales.totalCursosEnProgreso}</p>
              <p className="text-xs text-gray-600">En curso</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3 text-center">
              <p className="text-2xl text-purple-700 mb-0.5">{estadisticasGenerales.totalVideosVistos}</p>
              <p className="text-xs text-gray-600">Videos vistos</p>
            </div>
          </div>
        </div>
      )}

      {/* Botón Ranking Competitivo */}
      {trabajadores.length > 0 && (
        <Button 
          onClick={() => setShowRankingModal(true)}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white shadow-lg mb-4"
        >
          <Trophy className="w-5 h-5 mr-2" />
          Ver Ranking Competitivo
        </Button>
      )}

      {/* Plan Actual y Mejora */}
      <div className="bg-gradient-to-br from-[#8B5CF6]/20 to-[#7C3AED]/20 backdrop-blur-sm rounded-3xl p-5 mb-4 border border-[#8B5CF6]/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-2xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900">Plan Actual</h3>
            <p className="text-lg text-gray-900 font-semibold">{empresaData?.paqueteNombre || 'Sin plan'}</p>
          </div>
        </div>

        {empresaData?.paqueteNombre && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Límite de empleados</span>
              <span className="text-gray-900 font-semibold">{empresaData.limiteEmpleados || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cursos incluidos</span>
              <span className="text-gray-900 font-semibold">{cursos.length}</span>
            </div>
          </div>
        )}

        <Button 
          onClick={() => setActiveTab('perfil')}
          className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:opacity-90 text-white rounded-full"
        >
          {empresaData?.paqueteNombre ? 'Ver Planes y Mejorar' : 'Ver Planes Disponibles'}
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-3xl shadow-sm p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900">Resumen General</h3>
            <p className="text-xs text-gray-500">Estadísticas de la empresa</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Empleados registrados</span>
            <span className="text-sm text-gray-900">
              {trabajadores.length} / {empresaData?.limiteEmpleados || 0}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] h-2.5 rounded-full"
              style={{ 
                width: empresaData?.limiteEmpleados 
                  ? `${Math.min((trabajadores.length / empresaData.limiteEmpleados) * 100, 100)}%`
                  : '0%'
              }}
            />
          </div>
        </div>
      </div>

      {/* Trabajadores */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-900">Trabajadores</h3>
        <Button
          onClick={() => setShowAmpliarPlanModal(true)}
          size="sm"
          className="bg-gradient-to-r from-[#10B981] to-[#059669] hover:opacity-90 text-white rounded-full flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agrandar Plan
        </Button>
      </div>

      {/* Buscador de trabajadores */}
      {trabajadores.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, usuario o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-2xl border-gray-200 focus:border-[#4F46E5]"
            />
          </div>
        </div>
      )}

      {trabajadores.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No hay trabajadores registrados</p>
          <p className="text-gray-400 text-xs mt-1">
            El administrador puede crear trabajadores para tu empresa
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trabajadoresFiltrados.map((trabajador) => (
            <div key={trabajador.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900">
                      {trabajador.nombreCompleto || trabajador.username}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-2 py-0.5 rounded-full">
                        {trabajador.codigo}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl text-gray-900 font-semibold">{trabajador.progresoGeneral}%</p>
                  <p className="text-xs text-gray-500">Progreso</p>
                </div>
              </div>

              {/* Barra de progreso individual */}
              <div className="mb-3">
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      trabajador.progresoGeneral === 100 
                        ? 'bg-gradient-to-r from-[#10B981] to-[#059669]'
                        : trabajador.progresoGeneral > 0
                        ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]'
                        : 'bg-gray-300'
                    }`}
                    style={{ width: `${trabajador.progresoGeneral}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {trabajador.totalVideosVistos} de {trabajador.totalVideos} videos completados
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                <div className="bg-green-50 rounded-xl p-2 text-center">
                  <p className="text-lg text-green-700">{trabajador.cursosCompletados}</p>
                  <p className="text-xs text-green-600">Completados</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-2 text-center">
                  <p className="text-lg text-blue-700">{trabajador.cursosEnProgreso}</p>
                  <p className="text-xs text-blue-600">En curso</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCursos = () => (
    <div className="pb-24">
      <div className="mb-4">
        <h2 className="text-gray-900 mb-1">Cursos Disponibles</h2>
        <p className="text-gray-500 text-sm">Vista de solo lectura para supervisión</p>
      </div>

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
          <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No hay cursos disponibles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cursos
            .filter(curso => curso.titulo.toLowerCase().includes(busquedaCursos.toLowerCase()))
            .map((curso) => (
            <div
              key={curso.id}
              onClick={() => setCursoActivo(curso)}
              className="bg-white rounded-3xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              {curso.thumbnail && (
                <div className="w-full aspect-video bg-gradient-to-br from-[#4F46E5] to-[#7C3AED]">
                  <img 
                    src={curso.thumbnail} 
                    alt={curso.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-gray-900 mb-2">{curso.titulo}</h3>
                <p className="text-gray-600 text-sm mb-4">{curso.descripcion}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-50 px-3 py-1.5 rounded-full">
                      <p className="text-purple-700 text-xs">{curso.modulos.length} módulos</p>
                    </div>
                    <div className="bg-blue-50 px-3 py-1.5 rounded-full">
                      <p className="text-blue-700 text-xs">
                        {curso.modulos.reduce((acc, m) => acc + m.videos.length, 0)} videos
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 text-white rounded-full"
                  >
                    Ver Módulos
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPerfil = () => (
    <div className="pb-24">
      <div className="bg-white rounded-3xl shadow-sm p-5 mb-4">
        <h3 className="text-gray-900 mb-4">Información de la Empresa</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Nombre de la empresa</p>
            <p className="text-gray-900">{empresaData?.nombreEmpresa || user.username}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Código de empresa</p>
            <p className="text-gray-900">{empresaData?.codigo || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Plan actual</p>
            <p className="text-gray-900">{empresaData?.paqueteNombre || 'Sin plan'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Límite de empleados</p>
            <p className="text-gray-900">{empresaData?.limiteEmpleados || 0}</p>
          </div>
        </div>
      </div>

      <h3 className="text-gray-900 mb-4">Planes Disponibles</h3>
      <PaquetesDisplay paquetes={paquetes} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8EEFF] via-[#F5F7FF] to-[#E8EEFF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">Panel Empresa</p>
            <h2 className="text-gray-900">
              {empresaData?.nombreEmpresa || user.username}
            </h2>
            {empresaData?.codigo && (
              <div className="flex items-center gap-2 mt-1">
                <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white px-2 py-0.5 rounded-full text-xs">
                  {empresaData.codigo}
                </div>
                {empresaData?.paqueteNombre && (
                  <div className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-2 py-0.5 rounded-full text-xs">
                    Plan: {empresaData.paqueteNombre}
                  </div>
                )}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl p-2 text-white text-center">
            <p className="text-xl mb-0.5">{trabajadores.length}</p>
            <p className="text-xs opacity-90">Trabajadores</p>
          </div>
          <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl p-2 text-white text-center">
            <p className="text-xl mb-0.5">{empresaData?.limiteEmpleados || 0}</p>
            <p className="text-xs opacity-90">Límite</p>
          </div>
          <div className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-2xl p-2 text-white text-center">
            <p className="text-xl mb-0.5">
              {empresaData?.limiteEmpleados 
                ? Math.round((trabajadores.length / empresaData.limiteEmpleados) * 100)
                : 0}%
            </p>
            <p className="text-xs opacity-90">Ocupación</p>
          </div>
        </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Navegación inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 safe-area-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'inicio' ? 'text-[#4F46E5]' : 'text-gray-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Inicio</span>
          </button>
          <button
            onClick={() => setActiveTab('cursos')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'cursos' ? 'text-[#4F46E5]' : 'text-gray-400'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Cursos</span>
          </button>
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'perfil' ? 'text-[#4F46E5]' : 'text-gray-400'
            }`}
          >
            <UserCircle2 className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </div>

      {/* Modal de Ampliar Plan */}
      {showAmpliarPlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900">Ampliar Plan</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Solicitar más trabajadores</p>
                </div>
                <Button
                  onClick={() => setShowAmpliarPlanModal(false)}
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Resumen del plan actual */}
              <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/10 rounded-2xl p-4 border border-[#8B5CF6]/20">
                <h4 className="text-sm text-gray-900 mb-2">Plan Actual</h4>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Plan:</span> {empresaData?.paqueteNombre || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Límite:</span> {empresaData?.limiteEmpleados || 0} empleados
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Registrados:</span> {trabajadores.length} empleados
                  </p>
                </div>
              </div>

              {/* Cantidad de trabajadores a agregar */}
              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  ¿Cuántos trabajadores deseas agregar?
                </label>
                <Input
                  type="number"
                  min="1"
                  value={cantidadNuevosTrabajadores}
                  onChange={(e) => handleCantidadChange(Number(e.target.value))}
                  className="rounded-2xl"
                />
              </div>

              {/* Formulario de trabajadores */}
              <div className="space-y-3">
                <h4 className="text-sm text-gray-900">Datos de los nuevos trabajadores</h4>
                {nuevosTrabajadores.map((trabajador, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <p className="text-xs text-gray-500 font-semibold">Trabajador {index + 1}</p>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Nombre completo</label>
                      <Input
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        value={trabajador.nombre}
                        onChange={(e) => handleTrabajadorChange(index, 'nombre', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Cédula</label>
                      <Input
                        type="text"
                        placeholder="Ej: 1234567890"
                        value={trabajador.cedula}
                        onChange={(e) => handleTrabajadorChange(index, 'cedula', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón de WhatsApp */}
              <Button
                onClick={handleEnviarWhatsApp}
                className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-white rounded-full py-6 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar solicitud por WhatsApp
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Se abrirá WhatsApp con un mensaje prediseñado con todos los datos de tu solicitud
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ranking Competitivo */}
      {showRankingModal && (
        <RankingCompetitivo 
          empresaId={user.empresaId}
          mostrarGrafica={true}
          mostrarBuscador={true}
          onClose={() => setShowRankingModal(false)}
          isModal={true}
        />
      )}
    </div>
  );
}