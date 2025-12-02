import { useState, useEffect } from 'react';
import { Users, TrendingUp, Award, BookOpen } from 'lucide-react';
import { companiesAPI } from '../utils/api';
import { RankingPanel } from './RankingPanel';

export function CompanyPanel({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'stats' | 'ranking'>('stats');
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'stats' && user.companyId) {
      loadWorkerStats();
    }
  }, [activeTab, user.companyId]);

  const loadWorkerStats = async () => {
    setLoading(true);
    try {
      const data = await companiesAPI.getWorkerStats(user.companyId || user.id);
      setWorkers(data.workers || []);
    } catch (error) {
      console.error('Error loading worker stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = workers.reduce((sum, w) => sum + (w.points || 0), 0);
  const totalCompleted = workers.reduce((sum, w) => sum + (w.completedCourses || 0), 0);
  const avgProgress = workers.length > 0 
    ? Math.round(workers.reduce((sum, w) => sum + (w.completedCourses || 0), 0) / workers.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white mb-1">Panel de Empresa</h1>
              <p className="text-white/80">{user.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-[16px] text-white hover:bg-white/30 transition-all"
            >
              Salir
            </button>
          </div>

          {/* Company Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-[16px] bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-white/80">Trabajadores</div>
              </div>
              <div className="text-white">{workers.length}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-[16px] bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-white/80">Puntos Totales</div>
              </div>
              <div className="text-white">{totalPoints}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-[16px] bg-white/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-white/80">Cursos Completados</div>
              </div>
              <div className="text-white">{totalCompleted}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto -mt-12 px-6">
        <div className="bg-white rounded-[24px] shadow-lg p-2 flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 rounded-[16px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 py-3 rounded-[16px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ranking'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🏆 Ranking
          </button>
        </div>

        {/* Content */}
        <div className="pb-8">
          {activeTab === 'ranking' && <RankingPanel />}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-gray-900 mb-6">Estadísticas de Trabajadores</h2>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : workers.length > 0 ? (
                <div className="grid gap-4">
                  {workers.map((worker) => (
                    <div
                      key={worker.id}
                      className="bg-white rounded-[24px] p-6 shadow-lg border-2 border-gray-100 hover:border-indigo-200 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                            {worker.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-gray-900">{worker.name}</h3>
                            <p className="text-gray-500">{worker.email}</p>
                          </div>
                        </div>

                        {worker.rank > 0 && (
                          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-[16px] flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            #{worker.rank}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-indigo-50 rounded-[16px] p-4">
                          <div className="text-indigo-600 mb-1">Puntos</div>
                          <div className="text-gray-900">{worker.points}</div>
                        </div>

                        <div className="bg-purple-50 rounded-[16px] p-4">
                          <div className="text-purple-600 mb-1">Pts. Mensuales</div>
                          <div className="text-gray-900">{worker.monthlyPoints}</div>
                        </div>

                        <div className="bg-green-50 rounded-[16px] p-4">
                          <div className="text-green-600 mb-1">Completados</div>
                          <div className="text-gray-900">{worker.completedCourses}</div>
                        </div>

                        <div className="bg-blue-50 rounded-[16px] p-4">
                          <div className="text-blue-600 mb-1">Inscritos</div>
                          <div className="text-gray-900">{worker.enrolledCourses}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay trabajadores asignados</p>
                  <p>Los trabajadores aparecerán aquí cuando se asignen a tu empresa</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
