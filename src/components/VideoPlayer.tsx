import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface VideoPlayerProps {
  curso: any;
  moduloInicial: any;
  videoInicial: any;
  userId: string;
  onClose: () => void;
  onBackToModulos?: () => void;
}

export function VideoPlayer({
  curso,
  moduloInicial,
  videoInicial,
  userId,
  onClose,
  onBackToModulos
}: VideoPlayerProps) {
  const [showControls, setShowControls] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const controlsTimeoutRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Swipe gesture handling (estilo TikTok)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Obtener todos los videos del módulo actual
  const allVideos = moduloInicial?.videos || [];
  const currentVideo = allVideos[currentVideoIndex] || videoInicial;

  useEffect(() => {
    // Encontrar el índice del video inicial
    const initialIndex = allVideos.findIndex((v: any) => v.id === videoInicial.id);
    if (initialIndex !== -1) {
      setCurrentVideoIndex(initialIndex);
    }
  }, []);

  useEffect(() => {
    // Auto-hide controls after 3 seconds
    if (showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  const handleScreenTap = () => {
    setShowControls(true);
  };

  const goToNextVideo = () => {
    if (currentVideoIndex < allVideos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setShowControls(true);
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setShowControls(true);
    }
  };

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipeUp = distance > minSwipeDistance;
    const isSwipeDown = distance < -minSwipeDistance;
    
    if (isSwipeUp) {
      // Swipe up = siguiente video (como TikTok)
      goToNextVideo();
    }
    
    if (isSwipeDown) {
      // Swipe down = video anterior
      goToPreviousVideo();
    }
  };

  // Convertir URL de YouTube a formato embed con autoplay
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // YouTube URLs (incluyendo Shorts)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      
      // YouTube Shorts
      if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('shorts/')[1]?.split('?')[0]?.split('/')[0];
      }
      // YouTube normal
      else if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } 
      // Youtu.be
      else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } 
      // Embed
      else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        // SIN controles (controls=0), autoplay, loop, y optimizado para móvil vertical estilo TikTok
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${videoId}&fs=0&disablekb=1&iv_load_policy=3`;
      }
    }
    
    // Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        // SIN controles para Vimeo estilo TikTok
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&controls=0&loop=1&background=0`;
      }
    }
    
    // Si es URL directo de video (mp4, webm, etc)
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }
    
    // Por defecto retornar la URL original
    return url;
  };

  const embedUrl = getEmbedUrl(currentVideo?.url || '');
  const isDirectVideo = embedUrl.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onClick={handleScreenTap}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Video Container - Formato 9:16 Pantalla Completa estilo TikTok/Reels */}
      <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
        
        {/* Video Player - Estilo TikTok/Reels (9:16) */}
        {embedUrl ? (
          isDirectVideo ? (
            // Video HTML5 directo SIN controles
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={embedUrl}
              autoPlay
              playsInline
              loop
              muted={false}
              onClick={(e) => e.stopPropagation()}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            // Video embebido (YouTube Shorts, Vimeo, etc) - Formato vertical 9:16
            <iframe
              ref={iframeRef}
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
              allowFullScreen
              style={{ 
                border: 'none',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )
        ) : (
          // Placeholder si no hay URL válida
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="text-center px-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white/50 text-4xl">🎥</span>
              </div>
              <p className="text-white/70 mb-2">{currentVideo?.title || 'Video no disponible'}</p>
              <p className="text-white/50 text-sm">
                {currentVideo?.url ? 'Cargando video...' : 'URL del video no proporcionada'}
              </p>
            </div>
          </div>
        )}

        {/* Overlay de controles minimalistas (solo visible cuando se toca la pantalla) */}
        {showControls && (
          <>
            {/* Top Bar - Minimalista estilo TikTok */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 pt-8 z-20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white drop-shadow-2xl font-medium">{curso?.name || 'Curso'}</p>
                  <p className="text-white/70 text-sm drop-shadow-lg">{moduloInicial?.name || 'Módulo'}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Indicadores de progreso - Estilo Instagram Stories/TikTok (arriba) */}
            <div className="absolute top-16 left-0 right-0 px-2 z-20 flex gap-1">
              {allVideos.map((_: any, idx: number) => (
                <div
                  key={idx}
                  className={`h-0.5 rounded-full flex-1 transition-all ${
                    idx === currentVideoIndex
                      ? 'bg-white'
                      : idx < currentVideoIndex
                      ? 'bg-white/50'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Right Side Bar - Estilo TikTok */}
            <div className="absolute right-3 bottom-24 z-20 flex flex-col gap-4">
              {/* Contador de videos */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{currentVideoIndex + 1}/{allVideos.length}</span>
                </div>
              </div>
            </div>

            {/* Indicadores de Swipe en los laterales */}
            {allVideos.length > 1 && (
              <>
                {/* Indicador de swipe abajo (siguiente video) */}
                {currentVideoIndex < allVideos.length - 1 && (
                  <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <div className="flex flex-col items-center text-white/40">
                      <ChevronRight className="w-8 h-8 rotate-90" />
                    </div>
                  </div>
                )}
                
                {/* Indicador de swipe arriba (video anterior) */}
                {currentVideoIndex > 0 && (
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <div className="flex flex-col items-center text-white/40">
                      <ChevronLeft className="w-8 h-8 -rotate-90" />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Bottom Bar - Info del video estilo TikTok */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pb-8 z-20">
              {/* Video Title & Description */}
              <div className="mb-3">
                <h3 className="text-white drop-shadow-2xl font-semibold mb-1">{currentVideo?.title || 'Sin título'}</h3>
                {currentVideo?.description && (
                  <p className="text-white/80 text-sm drop-shadow-lg line-clamp-2">{currentVideo.description}</p>
                )}
              </div>

              {/* Swipe Hint - Solo mostrar si hay más videos */}
              {allVideos.length > 1 && (
                <div className="flex items-center justify-center gap-2 mb-3 text-white/60 text-xs">
                  <ChevronLeft className="w-3 h-3" />
                  <span>Desliza para navegar</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}

              {/* Botón Volver a Módulos (solo si existe la función) */}
              {onBackToModulos && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBackToModulos();
                  }}
                  className="w-full py-3 bg-white/15 backdrop-blur-md text-white rounded-[20px] active:scale-95 transition-transform font-medium"
                >
                  Ver todos los módulos
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
