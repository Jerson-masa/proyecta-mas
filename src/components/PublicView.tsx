import { useState, useEffect } from 'react';
import { Home, BookOpen, User, Play, Clock, GraduationCap, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { LoginPage } from './LoginPage';
import { Button } from './ui/button';

interface PublicViewProps {
  onLogin: (username: string, password: string) => boolean;
}

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string; // thumbnail de la imagen
  thumbnail?: string; // alias para compatibilidad
  categoria: string;
  nivel: string;
  duracion: string;
  modulos: {
    id: string;
    titulo: string;
    videos: {
      id: string;
      titulo: string;
      url: string;
      duracion: string;
      completado?: boolean;
    }[];
  }[];
}

// Función para detectar y convertir URLs de YouTube a embed (igual que VideoPlayer.tsx)
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Patrones de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      // Parámetros para YouTube
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&playsinline=1`;
    }
  }
  
  return null;
}

// Función para detectar Vimeo
function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match) {
    return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
  }
  
  return null;
}

export function PublicView({ onLogin }: PublicViewProps) {
  const [activeTab, setActiveTab] = useState<'inicio' | 'cursos' | 'perfil'>('inicio');
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [videoActual, setVideoActual] = useState<string | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [expandedCursos, setExpandedCursos] = useState<Set<string>>(new Set());
  const [playingVideo, setPlayingVideo] = useState<{ cursoId: string; moduloId: string; videoId: string } | null>(null);

  // Obtener todos los videos de todos los cursos
  const todosLosVideos = cursos.flatMap(curso =>
    curso.modulos.flatMap(modulo =>
      modulo.videos.map(video => ({
        ...video,
        cursoTitulo: curso.titulo,
        moduloTitulo: modulo.titulo,
        cursoImagen: curso.imagen,
      }))
    )
  );

  useEffect(() => {
    // Cargar cursos del localStorage
    const savedCursos = JSON.parse(localStorage.getItem('cursos') || '[]');
    // Normalizar para compatibilidad: si tiene thumbnail, usarlo como imagen
    const cursosNormalizados = savedCursos.map((curso: any) => ({
      ...curso,
      imagen: curso.thumbnail || curso.imagen || '',
      categoria: curso.categoria || 'General',
      nivel: curso.nivel || 'Principiante',
      duracion: curso.duracion || '1 hora',
      modulos: curso.modulos?.map((modulo: any) => ({
        ...modulo,
        videos: modulo.videos?.map((video: any) => ({
          ...video,
          duracion: video.duracion || '5 min'
        })) || []
      })) || []
    }));
    setCursos(cursosNormalizados);
  }, []);

  const toggleCurso = (cursoId: string) => {
    const newExpanded = new Set(expandedCursos);
    if (newExpanded.has(cursoId)) {
      newExpanded.delete(cursoId);
    } else {
      newExpanded.add(cursoId);
    }
    setExpandedCursos(newExpanded);
  };

  const handleVideoClick = (cursoId: string, moduloId: string, videoId: string, videoIndex: number) => {
    // Permitir ver solo los 2 primeros videos
    if (videoIndex >= 2) {
      setActiveTab('perfil');
      return;
    }
    setPlayingVideo({ cursoId, moduloId, videoId });
  };

  const closeVideoPlayer = () => {
    setPlayingVideo(null);
  };

  const renderInicio = () => {
    if (todosLosVideos.length === 0) {
      return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#E8EEFF] via-[#F5F7FF] to-[#E8EEFF] p-5 pb-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-gray-900 mb-2">Proyecta</h3>
            <p className="text-gray-600">No hay videos disponibles</p>
            <p className="text-sm text-gray-500 mt-2">Los videos aparecerán aquí cuando se agreguen cursos</p>
          </div>
        </div>
      );
    }

    const videoMostrado = todosLosVideos[currentVideoIndex];

    // Determinar tipo de video para Inicio también
    const isYouTube = videoMostrado.url.includes('youtube.com') || videoMostrado.url.includes('youtu.be');
    const isVimeo = videoMostrado.url.includes('vimeo.com');

    let embedUrl = videoMostrado.url;
    
    // Convertir URLs de YouTube a formato embed
    if (isYouTube) {
      if (videoMostrado.url.includes('watch?v=')) {
        const videoId = videoMostrado.url.split('watch?v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      } else if (videoMostrado.url.includes('youtu.be/')) {
        const videoId = videoMostrado.url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      } else if (videoMostrado.url.includes('embed/')) {
        // Ya está en formato embed
        embedUrl = videoMostrado.url.includes('?') ? videoMostrado.url : `${videoMostrado.url}?autoplay=1&rel=0`;
      }
    }
    
    // Convertir URLs de Vimeo a formato embed
    if (isVimeo) {
      const videoId = videoMostrado.url.split('vimeo.com/')[1]?.split('?')[0];
      embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }

    return (
      <div className="h-screen w-full bg-black relative overflow-hidden">
        {/* Video en pantalla completa 9:16 */}
        <div className="absolute inset-0 flex items-center justify-center pb-16">
          <div className="w-full h-full max-w-[56.25vh] mx-auto relative">
            {(isYouTube || isVimeo) ? (
              <iframe
                key={embedUrl}
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={videoMostrado.titulo}
                loading="eager"
              />
            ) : (
              <video
                src={videoMostrado.url}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
                loop
              >
                Tu navegador no soporta el elemento de video.
              </video>
            )}

            {/* Información del video superpuesta */}
            <div className="absolute bottom-24 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pointer-events-none">
              <h3 className="text-white mb-1">{videoMostrado.titulo}</h3>
              <p className="text-sm text-white/80 mb-2">{videoMostrado.cursoTitulo} • {videoMostrado.moduloTitulo}</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">{videoMostrado.duracion}</span>
              </div>
            </div>

            {/* Navegación de videos */}
            <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-3 px-5">
              <Button
                onClick={() => setCurrentVideoIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentVideoIndex === 0}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none rounded-full px-4 disabled:opacity-30"
                size="sm"
              >
                Anterior
              </Button>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm">
                  {currentVideoIndex + 1} / {todosLosVideos.length}
                </span>
              </div>
              <Button
                onClick={() => setCurrentVideoIndex((prev) => Math.min(todosLosVideos.length - 1, prev + 1))}
                disabled={currentVideoIndex === todosLosVideos.length - 1}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none rounded-full px-4 disabled:opacity-30"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCursos = () => {
    if (cursos.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#E8EEFF] via-[#F5F7FF] to-[#E8EEFF] flex items-center justify-center p-5">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600">No hay cursos disponibles</p>
            <p className="text-sm text-gray-500 mt-2">Los cursos aparecerán aquí cuando se agreguen</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8EEFF] via-[#F5F7FF] to-[#E8EEFF] pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-5 pt-12 pb-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white">Proyecta</h2>
              <p className="text-sm text-white/80">{cursos.length} cursos disponibles</p>
            </div>
          </div>
        </div>

        {/* Lista de Cursos - Mismo diseño que usuarios */}
        <div className="px-5 py-5">
          <div className="max-w-7xl mx-auto space-y-3">
            {cursos.map((curso) => {
              const totalVideos = curso.modulos.reduce((acc, m) => acc + m.videos.length, 0);
              const isExpanded = expandedCursos.has(curso.id);
              
              return (
                <div
                  key={curso.id}
                  className="bg-white rounded-3xl shadow-sm overflow-hidden"
                >
                  {/* Thumbnail con Play Overlay - Igual que usuarios */}
                  <div className="relative h-48 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] cursor-pointer" onClick={() => toggleCurso(curso.id)}>
                    {curso.imagen && (
                      <>
                        <img 
                          src={curso.imagen}
                          alt={curso.titulo}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </>
                    )}
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
                        {isExpanded ? (
                          <ChevronUp className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        )}
                      </div>
                    </div>

                    {/* Badge de videos */}
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-white text-xs">{totalVideos} videos</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-gray-900 mb-1">{curso.titulo}</h3>
                    <p className="text-sm text-gray-500 mb-3">{curso.descripcion}</p>

                    {/* Metadatos */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white px-3 py-1 rounded-full text-xs">
                        {curso.categoria}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {curso.nivel}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {curso.duracion}
                      </span>
                    </div>

                    {/* Botón expandir - Estilo similar a "Comenzar" */}
                    {!isExpanded ? (
                      <Button
                        onClick={() => toggleCurso(curso.id)}
                        className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white"
                      >
                        Ver contenido del curso
                      </Button>
                    ) : (
                      <Button
                        onClick={() => toggleCurso(curso.id)}
                        variant="outline"
                        className="w-full h-11 rounded-2xl border-gray-200"
                      >
                        Ocultar contenido
                      </Button>
                    )}

                    {/* Módulos y videos expandidos */}
                    {isExpanded && (
                      <div className="space-y-3 mt-4">
                        {curso.modulos.map((modulo, moduloIndex) => {
                          let videoGlobalIndex = 0;
                          // Calcular índice global del primer video de este módulo
                          for (let i = 0; i < moduloIndex; i++) {
                            videoGlobalIndex += curso.modulos[i].videos.length;
                          }

                          return (
                            <div key={modulo.id} className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                              <h4 className="text-gray-900 text-sm mb-3">{modulo.titulo}</h4>
                              <div className="space-y-2">
                                {modulo.videos.map((video, videoIndex) => {
                                  const currentGlobalIndex = videoGlobalIndex + videoIndex;
                                  const isLocked = currentGlobalIndex >= 2;

                                  return (
                                    <button
                                      key={video.id}
                                      onClick={() => handleVideoClick(curso.id, modulo.id, video.id, currentGlobalIndex)}
                                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                        isLocked 
                                          ? 'bg-gray-100 cursor-pointer hover:bg-gray-200' 
                                          : 'bg-white hover:bg-gray-50 cursor-pointer'
                                      }`}
                                    >
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        isLocked 
                                          ? 'bg-gray-300' 
                                          : 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]'
                                      }`}>
                                        {isLocked ? (
                                          <Lock className="w-5 h-5 text-gray-600" />
                                        ) : (
                                          <Play className="w-5 h-5 text-white" />
                                        )}
                                      </div>
                                      <div className="flex-1 text-left">
                                        <p className={`text-sm ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                                          {video.titulo}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                          <Clock className="w-3 h-3" />
                                          {video.duracion}
                                        </p>
                                      </div>
                                      {isLocked && (
                                        <span className="text-xs text-[#4F46E5] px-2 py-1 bg-blue-50 rounded-full">
                                          Premium
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de video player en pantalla completa */}
        {playingVideo && (() => {
          const curso = cursos.find(c => c.id === playingVideo.cursoId);
          const modulo = curso?.modulos.find(m => m.id === playingVideo.moduloId);
          const video = modulo?.videos.find(v => v.id === playingVideo.videoId);

          console.log('🔍 DEBUG - playingVideo:', playingVideo);
          console.log('🔍 DEBUG - curso encontrado:', curso);
          console.log('🔍 DEBUG - modulo encontrado:', modulo);
          console.log('🔍 DEBUG - video encontrado:', video);

          if (!video) {
            console.error('❌ Video NO encontrado!');
            return null;
          }
          
          if (!video.url) {
            console.error('❌ Video NO tiene URL!');
            return (
              <div className="fixed inset-0 bg-red-500 z-50 flex items-center justify-center">
                <div className="text-white text-center p-5">
                  <h1 className="text-2xl mb-4">ERROR: Video sin URL</h1>
                  <p>El video no tiene una URL configurada</p>
                  <button
                    onClick={closeVideoPlayer}
                    className="mt-4 bg-white text-red-500 px-6 py-2 rounded-full"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            );
          }
          
          console.log('🎥 Video URL Original:', video.url);

          // Usar las MISMAS funciones que VideoPlayer.tsx
          const youtubePatterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s]+)/,
            /youtube\.com\/embed\/([^&\s]+)/
          ];
          
          let youtubeEmbedUrl = null;
          for (const pattern of youtubePatterns) {
            const match = video.url.match(pattern);
            if (match) {
              youtubeEmbedUrl = `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&playsinline=1`;
              console.log('✅ YouTube detectado - Video ID:', match[1]);
              console.log('✅ Embed URL:', youtubeEmbedUrl);
              break;
            }
          }

          const isYouTube = !!youtubeEmbedUrl;
          const isVimeo = video.url.includes('vimeo.com');
          
          let embedUrl = youtubeEmbedUrl || video.url;
          
          if (isVimeo) {
            const match = video.url.match(/vimeo\.com\/(\d+)/);
            if (match) {
              embedUrl = `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
              console.log('✅ Vimeo detectado - Video ID:', match[1]);
            }
          }
          
          console.log('📺 Tipo final:', isYouTube ? 'YouTube' : isVimeo ? 'Vimeo' : 'MP4/Directo');
          console.log('🎬 URL a reproducir:', embedUrl);

          return (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
              <div className="w-full h-full max-w-[56.25vh] mx-auto relative bg-gray-900">
                <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 text-xs z-50 rounded">
                  DEBUG: {isYouTube ? 'YouTube' : isVimeo ? 'Vimeo' : 'Video Directo'}
                </div>
                
                {isYouTube ? (
                  <iframe
                    key={embedUrl}
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
                    allowFullScreen
                    title={video.titulo}
                    style={{ border: 'none' }}
                  />
                ) : isVimeo ? (
                  <iframe
                    key={embedUrl}
                    src={embedUrl}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={video.titulo}
                    style={{ border: 'none' }}
                  />
                ) : (
                  <video
                    key={video.id}
                    src={video.url}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                  >
                    Tu navegador no soporta el elemento de video.
                  </video>
                )}
                
                {/* Botón cerrar GRANDE Y VISIBLE */}
                <button
                  onClick={closeVideoPlayer}
                  className="absolute top-4 right-4 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors z-[60] text-xl font-bold shadow-lg"
                >
                  ✕
                </button>

                {/* Info del video */}
                <div className="absolute bottom-4 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pointer-events-none">
                  <h3 className="text-white mb-1">{video.titulo}</h3>
                  <p className="text-sm text-white/80 mb-2">{curso?.titulo} • {modulo?.titulo}</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">{video.duracion}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  const renderPerfil = () => {
    return <LoginPage onLogin={onLogin} />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return renderInicio();
      case 'cursos':
        return renderCursos();
      case 'perfil':
        return renderPerfil();
      default:
        return renderInicio();
    }
  };

  return (
    <div className="w-full min-h-screen relative">
      {renderContent()}

      {/* Navegación inferior fija */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 safe-area-bottom ${playingVideo ? 'z-40' : 'z-50'}`}>
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
            <User className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}