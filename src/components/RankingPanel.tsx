import { useEffect, useState } from 'react';
import { rankingsAPI } from '../utils/api';
import { Trophy, TrendingUp, Award, Medal } from 'lucide-react';

export function RankingPanel() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [monthlyRankings, setMonthlyRankings] = useState<any[]>([]);
  const [view, setView] = useState<'all' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      const [allTime, monthly] = await Promise.all([
        rankingsAPI.getAll(),
        rankingsAPI.getMonthly()
      ]);
      setRankings(allTime.rankings || []);
      setMonthlyRankings(monthly.rankings || []);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentRankings = view === 'monthly' ? monthlyRankings : rankings;
  const topThree = currentRankings.slice(0, 3);
  const rest = currentRankings.slice(3, 10);

  const getTrophyColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900">Ranking</h2>
            <p className="text-gray-500">Competencia estilo Duolingo</p>
          </div>
        </div>
      </div>

      {/* Toggle View */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-[20px]">
        <button
          onClick={() => setView('monthly')}
          className={`flex-1 py-3 rounded-[16px] transition-all ${
            view === 'monthly'
              ? 'bg-white shadow-md text-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-5 h-5 mx-auto mb-1" />
          <span className="block">Mensual</span>
        </button>
        <button
          onClick={() => setView('all')}
          className={`flex-1 py-3 rounded-[16px] transition-all ${
            view === 'all'
              ? 'bg-white shadow-md text-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Award className="w-5 h-5 mx-auto mb-1" />
          <span className="block">Todo el tiempo</span>
        </button>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[24px] p-6">
          <div className="flex items-end justify-center gap-4 mb-4">
            {/* Second Place */}
            {topThree[1] && (
              <div className="flex flex-col items-center flex-1">
                <Medal className={`w-8 h-8 ${getTrophyColor(2)} mb-2`} />
                <div className="w-full bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-[20px] p-4 text-center h-28 flex flex-col justify-end">
                  <p className="text-white truncate">{topThree[1].name}</p>
                  <p className="text-white">{view === 'monthly' ? topThree[1].monthlyPoints : topThree[1].points} pts</p>
                </div>
              </div>
            )}

            {/* First Place */}
            {topThree[0] && (
              <div className="flex flex-col items-center flex-1">
                <Trophy className={`w-10 h-10 ${getTrophyColor(1)} mb-2`} />
                <div className="w-full bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-[20px] p-4 text-center h-36 flex flex-col justify-end">
                  <p className="text-white truncate">{topThree[0].name}</p>
                  <p className="text-white">{view === 'monthly' ? topThree[0].monthlyPoints : topThree[0].points} pts</p>
                </div>
              </div>
            )}

            {/* Third Place */}
            {topThree[2] && (
              <div className="flex flex-col items-center flex-1">
                <Medal className={`w-7 h-7 ${getTrophyColor(3)} mb-2`} />
                <div className="w-full bg-gradient-to-t from-amber-600 to-amber-700 rounded-t-[20px] p-4 text-center h-24 flex flex-col justify-end">
                  <p className="text-white truncate">{topThree[2].name}</p>
                  <p className="text-white">{view === 'monthly' ? topThree[2].monthlyPoints : topThree[2].points} pts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of Rankings */}
      {rest.length > 0 && (
        <div className="space-y-3">
          {rest.map((user) => (
            <div
              key={user.userId}
              className="bg-white rounded-[20px] p-4 border-2 border-gray-100 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                    {user.rank}
                  </div>
                  <div>
                    <p className="text-gray-900">{user.name}</p>
                    <p className="text-gray-500">{user.completedCourses} cursos completados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-indigo-600">{view === 'monthly' ? user.monthlyPoints : user.points} pts</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentRankings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No hay datos de ranking aún</p>
          <p>¡Completa cursos para aparecer aquí!</p>
        </div>
      )}
    </div>
  );
}
