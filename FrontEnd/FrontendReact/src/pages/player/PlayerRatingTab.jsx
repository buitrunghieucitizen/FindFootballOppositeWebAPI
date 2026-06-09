import { useState, useEffect } from 'react';
import playerService from '../../services/playerService';
import { FiStar, FiAward, FiCalendar, FiUser, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function PlayerRatingTab() {
  const [matches, setMatches] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null); // { type: 'player' | 'team', id: string, name: string }
  const [activeSide, setActiveSide] = useState('home'); // 'home' or 'away'

  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchRes, teamRes] = await Promise.all([
        playerService.getMatches(),
        playerService.getMyTeam()
      ]);
      setMatches(matchRes.data || []);
      setTeamMembers(teamRes.data.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (e) => {
    e.preventDefault();
    if (!selectedTarget || !selectedMatch) return;
    try {
      setSubmitting(true);
      const matchDate = selectedMatch.schedule?.startTime ? new Date(selectedMatch.schedule.startTime) : new Date();
      
      if (selectedTarget.type === 'player') {
        await playerService.ratePlayer(selectedTarget.id, {
          score: parseInt(score, 10),
          month: matchDate.getMonth() + 1,
          year: matchDate.getFullYear(),
          comment
        });
      } else {
        // Mock API call for rating team
        console.log('Rated team', selectedTarget.id, score, comment);
      }
      
      alert('Đánh giá thành công!');
      setSelectedTarget(null);
      setScore(5);
      setComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi đánh giá (có thể bạn đã đánh giá trong tháng này rồi).');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 dark:text-slate-400 animate-pulse">Đang tải dữ liệu...</div>;

  if (!selectedMatch) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6 p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
            <FiAward size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Đánh Giá Đồng Đội Theo Trận Đấu</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Chọn một trận đấu để đánh giá các cầu thủ đã tham gia</p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            Chưa có trận đấu nào để đánh giá.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {matches.map(m => (
              <div 
                key={m.matchId} 
                onClick={() => setSelectedMatch(m)}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 dark:text-slate-300 rounded-md">
                    Trận đấu #{m.matchId}
                  </span>
                  <FiCalendar className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                </div>
                <div className="flex items-center justify-center gap-4 py-2">
                  <span className="font-bold text-slate-800 dark:text-white text-center flex-1">{m.homeTeamName}</span>
                  <span className="px-3 py-1 bg-slate-800 text-white rounded-lg text-sm font-bold">
                    {m.matchStatus === 'Completed' ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white text-center flex-1">{m.awayTeamName}</span>
                </div>
                {m.schedule && (
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center border-t border-slate-100 dark:border-slate-700/50 pt-3">
                    {new Date(m.schedule.startTime).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!selectedTarget) {
    // Mock opponent members if we don't have them
    const opponentMembers = [
      { playerId: 'opp-1', playerName: 'Cầu thủ đối phương 1', roleInTeam: 'Tiền đạo' },
      { playerId: 'opp-2', playerName: 'Cầu thủ đối phương 2', roleInTeam: 'Hậu vệ' }
    ];
    const displayMembers = activeSide === 'home' ? teamMembers : opponentMembers;
    const currentTeamName = activeSide === 'home' ? selectedMatch.homeTeamName : selectedMatch.awayTeamName;

    return (
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6 p-4">
        <button 
          onClick={() => setSelectedMatch(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white dark:text-white transition-colors mb-6 font-medium"
        >
          <FiArrowLeft /> Quay lại danh sách trận đấu
        </button>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-amber-900">Trận: {selectedMatch.homeTeamName} vs {selectedMatch.awayTeamName}</h3>
              <p className="text-sm text-amber-700 mt-1">Chọn đối tượng để đánh giá</p>
            </div>
            <button 
              onClick={() => setSelectedTarget({ type: 'team', id: activeSide === 'home' ? 'home-team' : 'away-team', name: currentTeamName })}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold shadow hover:bg-amber-600 transition-colors"
            >
              Đánh giá toàn đội
            </button>
          </div>
          <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-amber-200 dark:border-amber-800">
            <button 
              onClick={() => setActiveSide('home')} 
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${activeSide === 'home' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900'}`}
            >
              Đội mình ({selectedMatch.homeTeamName})
            </button>
            <button 
              onClick={() => setActiveSide('away')} 
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${activeSide === 'away' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900'}`}
            >
              Đội đối thủ ({selectedMatch.awayTeamName})
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayMembers.map(member => (
            <div 
              key={member.playerId}
              onClick={() => setSelectedTarget({ type: 'player', id: member.playerId, name: member.playerName })}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <FiUser />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{member.playerName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{member.roleInTeam}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6 p-4">
      <button 
        onClick={() => setSelectedTarget(null)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white dark:text-white transition-colors mb-6 font-medium"
      >
        <FiArrowLeft /> Quay lại danh sách
      </button>

      <form onSubmit={handleRate} className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="text-center mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <FiAward size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Đánh giá {selectedTarget.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Trận: {selectedMatch.homeTeamName} vs {selectedMatch.awayTeamName}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 text-center">Đánh Giá (1-5 Sao)</label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                type="button"
                key={star}
                onClick={() => setScore(star)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all transform hover:scale-110 ${score >= star ? 'bg-amber-100 text-amber-500 scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
              >
                <FiStar size={24} className={score >= star ? 'fill-amber-500' : ''} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Nhận Xét (Không bắt buộc)</label>
          <textarea 
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none min-h-[120px] resize-none transition-all"
            placeholder="Nhập lời khen hoặc góp ý về phong độ của đồng đội..."
          />
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? 'Đang gửi...' : <><FiCheckCircle /> Gửi Đánh Giá</>}
        </button>
      </form>
    </div>
  );
}
