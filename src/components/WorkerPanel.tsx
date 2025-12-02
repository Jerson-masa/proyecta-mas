import { useState, useEffect } from 'react';
import { BookOpen, Trophy, Play, CheckCircle } from 'lucide-react';
import { coursesAPI, enrollmentsAPI } from '../utils/api';
import { RankingPanel } from './RankingPanel';
import { CourseViewer } from './CourseViewer';

export function WorkerPanel({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'courses' | 'my-courses' | 'ranking'>('courses');
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'courses') {
        const data = await coursesAPI.getAll();
        setCourses(data.courses || []);
      } else if (activeTab === 'my-courses') {
        const data = await enrollmentsAPI.getMyEnrollments();
        setEnrollments(data.enrollments || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollmentsAPI.enroll(courseId);
      alert('¡Inscrito exitosamente!');
      loadData();
    } catch (error: any) {
      console.error('Error enrolling:', error);
      alert(error.message || 'Error al inscribirse');
    }
  };

  const handleStartCourse = async (enrollment: any) => {
    const courseData = await coursesAPI.getById(enrollment.courseId);
    setSelectedCourse({ ...courseData.course, enrollment });
  };

  if (selectedCourse) {
    return (
      <CourseViewer
        course={selectedCourse}
        enrollment={selectedCourse.enrollment}
        onComplete={() => {
          alert('¡Felicitaciones! Has completado el curso');
          setSelectedCourse(null);
          loadData();
        }}
        onClose={() => setSelectedCourse(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 pb-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white mb-1">Mi Aprendizaje</h1>
              <p className="text-white/80">{user.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-[16px] text-white hover:bg-white/30 transition-all"
            >
              Salir
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-4">
              <div className="text-white/80 mb-1">Puntos</div>
              <div className="text-white">{user.points || 0}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-4">
              <div className="text-white/80 mb-1">Cursos</div>
              <div className="text-white">{user.completedCourses || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-md mx-auto -mt-12 px-6">
        <div className="bg-white rounded-[24px] shadow-lg p-2 flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 py-3 rounded-[16px] transition-all ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-5 h-5 mx-auto mb-1" />
            <span className="block">Explorar</span>
          </button>
          <button
            onClick={() => setActiveTab('my-courses')}
            className={`flex-1 py-3 rounded-[16px] transition-all ${
              activeTab === 'my-courses'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Play className="w-5 h-5 mx-auto mb-1" />
            <span className="block">Mis Cursos</span>
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 py-3 rounded-[16px] transition-all ${
              activeTab === 'ranking'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Trophy className="w-5 h-5 mx-auto mb-1" />
            <span className="block">Ranking</span>
          </button>
        </div>

        {/* Content */}
        <div className="pb-8">
          {activeTab === 'ranking' && <RankingPanel />}

          {activeTab === 'courses' && (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-[24px] overflow-hidden shadow-lg border-2 border-gray-100 hover:border-indigo-200 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white/50" />
                  </div>

                  <div className="p-5">
                    <h3 className="text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4">{course.description}</p>

                    <div className="flex gap-2 flex-wrap mb-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-[12px]">
                        {course.category}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-[12px]">
                        {course.level}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-[12px]">
                        +{course.points} pts
                      </span>
                    </div>

                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[16px] hover:shadow-lg transition-all"
                    >
                      Inscribirse
                    </button>
                  </div>
                </div>
              ))}

              {courses.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay cursos disponibles</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-courses' && (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-[24px] overflow-hidden shadow-lg border-2 border-gray-100"
                >
                  {/* Thumbnail */}
                  <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                    <BookOpen className="w-16 h-16 text-white/50" />
                    {enrollment.completed && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-[12px] flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Completado
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-gray-900 mb-2">{enrollment.course?.title}</h3>
                    <p className="text-gray-600 mb-4">{enrollment.course?.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Progreso</span>
                        <span className="text-indigo-600">{enrollment.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartCourse(enrollment)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[16px] hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      {enrollment.progress === 0 ? 'Comenzar' : 'Continuar'}
                    </button>
                  </div>
                </div>
              ))}

              {enrollments.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <Play className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No estás inscrito en ningún curso</p>
                  <p>¡Explora y comienza tu aprendizaje!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
