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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  const controlsTimeoutRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Swipe gesture handling (estilo TikTok)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Obtener todos los videos del módulo actual
  // Handle both 'modulos' and 'modules' property names
  const modules = curso?.modulos || curso?.modules || [];
  const currentModule = modules[currentModuleIndex] || moduloInicial;
  const allVideos = currentModule?.videos || [];
  const currentVideo = allVideos[currentVideoIndex] || videoInicial;

  useEffect(() => {
    // Encontrar el índice del video y módulo inicial
    if (modules.length > 0) {
      const modIndex = modules.findIndex((m: any) => m.id === moduloInicial?.id);
      if (modIndex !== -1) {
        setCurrentModuleIndex(modIndex);
        const vidIndex = modules[modIndex].videos.findIndex((v: any) => v.id === videoInicial.id);
        if (vidIndex !== -1) {
          setCurrentVideoIndex(vidIndex);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Auto-hide controls after 3 seconds ONLY if playing
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else if (!isPlaying) {
      // Always show controls when paused
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  const handleScreenTap = () => {
    // If playing, toggle controls. If paused, controls are always on, so maybe play?
    // User said: "while video is playing do not see anything... but if paused see buttons"
    // So if playing, tap shows controls briefly? Or pauses?
    // Let's make tap toggle controls if playing.
    if (isPlaying) {
      setShowControls(!showControls);
    }
  };

  const goToNextVideo = () => {
    if (currentVideoIndex < allVideos.length - 1) {
      // Next video in same module
      setCurrentVideoIndex(currentVideoIndex + 1);
      setIsPlaying(true); // Auto-play next
      setShowControls(false); // Hide UI for immersive feel
    } else if (modules.length > 0 && currentModuleIndex < modules.length - 1) {
      // Next module
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentVideoIndex(0);
      setIsPlaying(true);
      setShowControls(false);
    } else {
      // End of course
      setShowControls(true);
      setIsPlaying(false);
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setIsPlaying(true);
      setShowControls(false);
    } else if (currentModuleIndex > 0) {
      // Previous module (last video)
      const prevModuleIndex = currentModuleIndex - 1;
      const prevModule = modules[prevModuleIndex];
      setCurrentModuleIndex(prevModuleIndex);
      setCurrentVideoIndex(prevModule.videos.length - 1);
      setIsPlaying(true);
      setShowControls(false);
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

  // Handle video events
  const onVideoEnded = () => {
    goToNextVideo();
  };

  const onVideoPlay = () => {
    setIsPlaying(true);
    setShowControls(false);
  };

  const onVideoPause = () => {
    setIsPlaying(false);
    setShowControls(true);
  };

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onClick={handleScreenTap}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Video Container */}
      <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">

        {embedUrl ? (
          isDirectVideo ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={embedUrl}
              autoPlay
              playsInline
              loop={false} // Disable loop to allow auto-advance
              muted={false}
              onEnded={onVideoEnded}
              onPlay={onVideoPlay}
              onPause={onVideoPause}
              controls={!isPlaying} // Show native controls only when paused/interacting? Or never?
              // User said: "while playing do not see anything... if paused see buttons"
              // If we use native controls, they might conflict with our overlay.
              // Let's hide native controls and rely on click-to-pause/play if possible, 
              // BUT for mobile web, native controls are often better.
              // However, the user wants a specific UI behavior.
              // Let's try to hide native controls and use our overlay for navigation, 
              // but we need a way to Play/Pause. 
              // Tapping screen usually toggles play/pause on mobile video.
              // Let's keep controls={false} and add a custom Play/Pause button?
              // Or just rely on the browser's default behavior for tap?
              // If controls=false, tap usually doesn't play/pause on all browsers without listener.
              // Let's stick to the user's request: "buttons and text" visibility.
              // We will use native controls for the video itself (play/pause/seek) if possible,
              // OR we just overlay our buttons.
              // If we hide native controls, we need to implement play/pause.
              // For now, let's try controls={false} and see if we can just use the overlay.
              // Actually, simpler: controls={!isPlaying} might work if the browser supports it.
              // But standard behavior: controls=true shows native UI.
              // Let's use controls={false} and add a big Play/Pause button in center when paused?
              // Or just let the user tap.
              // Let's try: controls={false} and handle click to play/pause.
              onClick={(e) => {
                e.stopPropagation();
                const video = e.target as HTMLVideoElement;
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              }}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <iframe
              ref={iframeRef}
              className="absolute inset-0 w-full h-full"
              src={embedUrl} // Note: embedUrl for iframe usually has autoplay=1. 
              // We can't easily detect end or play/pause state for generic iframe without API.
              // So for iframe, we might have to rely on manual navigation or "immersive mode" is just always on?
              // Or we assume it's playing if it loaded.
              // We can't hide UI on play for iframe easily.
              // We will just show UI on tap for iframe.
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
              allowFullScreen
              style={{
                border: 'none',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                // Allow interaction with iframe (for native controls) but ensure overlay can still be shown?
                // If we want immersive mode, we should probably block iframe interaction when controls are hidden?
                // No, user needs to pause.
                // Let's just keep it simple: iframe is always interactive.
                // But we need the overlay buttons to be z-index higher.
                // The overlay container is already z-50 (fixed inset-0).
                // Wait, the overlay buttons are inside the main div?
                // We need to check where the buttons are rendered.
              }}
            />
          )
        ) : (
          // Placeholder
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
            {/* ... same placeholder ... */}
          </div>
        )}

        {/* Floating Toggle Button (Always visible or visible when controls hidden) */}
        {!showControls && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowControls(true);
            }}
            className="absolute top-4 right-4 z-[60] p-2 bg-black/50 text-white rounded-full backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        )}

        {/* Overlay Controls */}
        {(!isPlaying || showControls) && (
          <>
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pt-8 z-20 transition-opacity duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white drop-shadow-2xl font-medium">{curso?.name || 'Curso'}</p>
                  <p className="text-white/70 text-sm drop-shadow-lg">{currentModule?.name || 'Módulo'}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform hover:bg-black/60"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="absolute top-20 left-0 right-0 px-4 z-20 flex gap-1">
              {allVideos.map((_: any, idx: number) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full flex-1 transition-all ${idx === currentVideoIndex
                    ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                    : idx < currentVideoIndex
                      ? 'bg-white/50'
                      : 'bg-white/20'
                    }`}
                />
              ))}
            </div>

            {/* Center Play Button (only if paused and direct video) */}
            {!isPlaying && isDirectVideo && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                </div>
              </div>
            )}

            {/* Navigation Buttons (Visible when paused/controls shown) */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-10 pointer-events-none">
              {/* Previous Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreviousVideo();
                }}
                className={`w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto hover:bg-black/60 transition-all ${currentVideoIndex === 0 && currentModuleIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
                disabled={currentVideoIndex === 0 && currentModuleIndex === 0}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextVideo();
                }}
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto hover:bg-black/60 transition-all"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pb-10 z-20 transition-opacity duration-300">
              <div className="mb-4">
                <h3 className="text-white drop-shadow-2xl font-bold text-xl mb-2">{currentVideo?.title || 'Sin título'}</h3>
                {currentVideo?.description && (
                  <p className="text-white/80 text-sm drop-shadow-lg line-clamp-3 leading-relaxed">{currentVideo.description}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextVideo();
                  }}
                  className="flex-1 py-3 bg-white text-black rounded-[16px] font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                  <span>Siguiente Video</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {onBackToModulos && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBackToModulos();
                    }}
                    className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-[16px] font-medium active:scale-95 transition-transform hover:bg-white/20"
                  >
                    Módulos
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
