import { useState, useEffect } from 'react';
import { Home, BookOpen, User, Play, Lock, ChevronRight } from 'lucide-react';
import { coursesAPI } from '../utils/api';
import { ShortsPlayer } from './ShortsPlayer';

interface PublicFeedProps {
  onLoginRequest: () => void;
}

export function PublicFeed({ onLoginRequest }: PublicFeedProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'courses' | 'profile'>('home');
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [playingVideo, setPlayingVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await coursesAPI.getAllCourses();
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vista de video en reproducción
  if (playingVideo) {
    // Get all free videos from this module
    const moduleVideos = selectedModule?.videos?.slice(0, 3).map((v: any) => ({
      ...v,
      courseName: selectedCourse?.name,
      moduleName: selectedModule?.name,
      isFree: true
    })) || [];

    return (
      <ShortsPlayer
        videos={moduleVideos}
        currentIndex={playingVideo.index}
        onVideoChange={() => { }}
        onClose={() => setPlayingVideo(null)}
        onLoginRequest={onLoginRequest}
      />
    );
  }

  // Vista de módulo seleccionado
  if (selectedModule && selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 pb-20">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md p-4 sticky top-0 z-10">
          <button
            onClick={() => {
              setSelectedModule(null);
            }}
            className="text-white flex items-center gap-2"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Volver</span>
          </button>
          <h2 className="text-white mt-2">{selectedCourse.name}</h2>
          <p className="text-white/80">{selectedModule.name}</p>
        </div>

        {/* Lista de videos */}
        <div className="p-4 space-y-3">
          {selectedModule.videos?.map((video: any, index: number) => {
            const isFree = index < 3;
            return (
              <button
                key={video.id}
                onClick={() => {
                  if (isFree) {
                    setPlayingVideo({
                      video,
                      index,
                      total: selectedModule.videos.length,
                      courseName: selectedCourse.name,
                      moduleName: selectedModule.name,
                      isFree: true
                    });
                  } else {
                    onLoginRequest();
                  }
                }}
                className="w-full bg-white rounded-[24px] p-4 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-24 h-24 rounded-[16px] bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    {isFree ? (
                      <Play className="w-8 h-8 text-white" fill="white" />
                    ) : (
                      <Lock className="w-8 h-8 text-white" />
                    )}
                    {isFree && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        GRATIS
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <p className="text-gray-900 mb-1">Video {index + 1}</p>
                    <p className="text-gray-600">{video.title}</p>
                    {!isFree && (
                      <div className="mt-2 flex items-center gap-2 text-indigo-600">
                        <Lock className="w-4 h-4" />
                        <span>Inicia sesión para ver</span>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Mensaje para registrarse */}
        {selectedModule.videos?.length > 3 && (
          <div className="fixed bottom-24 left-0 right-0 p-4">
            <button
              onClick={onLoginRequest}
              className="w-full bg-white text-indigo-600 py-4 rounded-[24px] shadow-2xl hover:shadow-3xl transition-all"
            >
              🔓 Inicia sesión para ver todos los {selectedModule.videos.length} videos
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Vista de curso seleccionado
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 pb-20">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md p-4 sticky top-0 z-10">
          <button
            onClick={() => setSelectedCourse(null)}
            className="text-white flex items-center gap-2"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Volver</span>
          </button>
          <h2 className="text-white mt-2">{selectedCourse.name}</h2>
          <p className="text-white/80">{selectedCourse.description}</p>
        </div>

        {/* Módulos */}
        <div className="p-4 space-y-3">
          <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-4 mb-4">
            <p className="text-white">
              🎁 Primeros 3 videos de cada módulo GRATIS
            </p>
          </div>

          {selectedCourse.modules?.map((module: any) => (
            <button
              key={module.id}
              onClick={() => setSelectedModule(module)}
              className="w-full bg-white rounded-[24px] p-5 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[16px] bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-gray-900 mb-1">{module.name}</p>
                  <p className="text-gray-600">
                    {module.videos?.length || 0} videos
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                      3 gratis
                    </span>
                    {(module.videos?.length || 0) > 3 && (
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs">
                        {(module.videos?.length || 0) - 3} con login
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Vista principal según tab
  return (
    <div className="min-h-screen w-full">
      {activeTab === 'profile' ? (
        <div className="flex items-center justify-center h-full bg-gradient-to-b from-indigo-500 to-purple-600">
          <div className="text-center px-6">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-white mb-2">Inicia sesión</h2>
            <p className="text-white/80 mb-6">
              Accede a todo el contenido y guarda tu progreso
            </p>
            <button
              onClick={onLoginRequest}
              className="bg-white text-indigo-600 px-8 py-4 rounded-[24px] hover:shadow-xl transition-all"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      ) : activeTab === 'courses' ? (
        // Vista de Cursos - Tarjetas con imágenes
        <div className="h-full bg-gradient-to-b from-indigo-500 to-purple-600 overflow-y-auto pb-24">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/80">No hay cursos disponibles</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-6 pb-4">
                <h1 className="text-white mb-1">📚 Todos los Cursos</h1>
                <p className="text-white/80">Explora y aprende gratis</p>
              </div>

              {/* Tarjetas de Cursos */}
              <div className="px-4 space-y-4 pb-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className="bg-white rounded-[32px] overflow-hidden shadow-2xl active:scale-98 transition-transform"
                  >
                    {/* Imagen de Presentación del Curso */}
                    <div className="h-56 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 relative overflow-hidden">
                      {course.thumbnailUrl ? (
                        // Mostrar imagen personalizada si existe
                        <img
                          src={course.thumbnailUrl}
                          alt={course.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        // Mostrar diseño por defecto si no hay miniatura
                        <>
                          {/* Pattern decorativo */}
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                          </div>

                          {/* Icono del curso */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md rounded-[32px] p-8">
                              <BookOpen className="w-20 h-20 text-white" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Badge de GRATIS */}
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                        <span>🎁</span>
                        <span className="font-medium">GRATIS</span>
                      </div>
                    </div>

                    {/* Info del Curso */}
                    <div className="p-6">
                      <h3 className="text-gray-900 mb-2">{course.name}</h3>
                      <p className="text-gray-600 mb-4">{course.description}</p>

                      {/* Módulos del curso */}
                      <div className="space-y-2 mb-4">
                        {course.modules?.slice(0, 3).map((module: any, idx: number) => (
                          <div
                            key={module.id}
                            className="flex items-center gap-3 bg-gray-50 rounded-[20px] p-3"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white">{idx + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 text-sm truncate">{module.name}</p>
                              <p className="text-gray-500 text-xs">
                                {module.videos?.length || 0} videos
                              </p>
                            </div>
                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              3 gratis
                            </div>
                          </div>
                        ))}

                        {(course.modules?.length || 0) > 3 && (
                          <p className="text-gray-500 text-sm text-center">
                            +{(course.modules?.length || 0) - 3} módulos más
                          </p>
                        )}
                      </div>

                      {/* Estadísticas */}
                      <div className="flex items-center gap-4 text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          📚 {course.modules?.length || 0} módulos
                        </span>
                        <span className="flex items-center gap-1">
                          🎥 {course.modules?.reduce((acc: number, m: any) => acc + (m.videos?.length || 0), 0) || 0} videos
                        </span>
                      </div>

                      {/* Botón de acción */}
                      <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-[24px] flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <Play className="w-5 h-5" fill="white" />
                        <span>Ver Curso</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/80">No hay cursos disponibles</p>
          </div>
        </div>
      ) : (() => {
        // Vista Home - Collect all free videos from all courses (first 3 from each module)
        const allFreeVideos: any[] = [];
        courses.forEach(course => {
          course.modules?.forEach((module: any) => {
            const freeVideos = module.videos?.slice(0, 3) || [];
            freeVideos.forEach((video: any) => {
              allFreeVideos.push({
                ...video,
                courseName: course.name,
                moduleName: module.name,
                isFree: true
              });
            });
          });
        });

        return allFreeVideos.length > 0 ? (
          <ShortsPlayer
            videos={allFreeVideos}
            currentIndex={0}
            onVideoChange={() => { }}
            onClose={() => { }}
            onLoginRequest={onLoginRequest}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/80">No hay videos disponibles</p>
          </div>
        );
      })()}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function BottomNav({
  activeTab,
  onTabChange
}: {
  activeTab: string;
  onTabChange: (tab: 'home' | 'courses' | 'profile') => void;
}) {
  return (
    <nav className="fixed bottom-8 left-0 right-0 p-4 z-[60]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center justify-center transition-all active:scale-95 w-14 h-14 rounded-full bg-black/40 backdrop-blur-md"
        >
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'text-white' : 'text-white/60'}`} />
        </button>

        <button
          onClick={() => onTabChange('courses')}
          className="flex items-center justify-center transition-all active:scale-95 w-14 h-14 rounded-full bg-black/40 backdrop-blur-md"
        >
          <BookOpen className={`w-6 h-6 ${activeTab === 'courses' ? 'text-white' : 'text-white/60'}`} />
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className="flex items-center justify-center transition-all active:scale-95 w-14 h-14 rounded-full bg-black/40 backdrop-blur-md"
        >
          <User className={`w-6 h-6 ${activeTab === 'profile' ? 'text-white' : 'text-white/60'}`} />
        </button>
      </div>
    </nav>
  );
}
