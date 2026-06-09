import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AdminLayout,
  Badge,
  MetricGrid,
  SurfaceCard,
  toneFromStatus,
} from '../components/portal-ui';
import { publicService } from '../services/publicService';
import { useAuth } from '../contexts/AuthContext';
import {
  FiUsers,
  FiTarget,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';

function CaptainCaptain() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await publicService.getPortalData();
        if (result) {
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Đang tải dữ liệu..." subtitle="Đang kết nối tới Backend..." user={user}>
        <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const teams = data.teams || [];
  const freeAgents = (data.players || []).filter(p => p.isFreeAgent);
  const matches = data.matches || [];
  const recruitmentAds = data.recruitmentAds || [];
  const upcomingSchedules = data.upcomingSchedules || [];
  const recurringBookings = data.recurringBookings || [];

  const captainMetrics = [
    { label: 'Thành viên', value: '18', icon: FiUsers, trend: '+2 tuần này', tone: 'teal' },
    { label: 'Quỹ đội', value: '2.5M', icon: FiTarget, trend: 'Đủ sân 3 trận', tone: 'amber' },
    { label: 'Trận thắng', value: '65%', icon: FiMapPin, trend: 'Phong độ cao', tone: 'navy' },
    { label: 'Kèo tiếp theo', value: 'Tối thứ 5', icon: FiCalendar, trend: 'Đã chốt sân', tone: 'rose' },
  ];

  return (
    <AdminLayout
      title="Bảng điều khiển đội trưởng"
      subtitle="Dữ liệu này đang được tải trực tiếp từ ASP.NET Core Backend qua API."
      user={user}
      actions={
        <>
          <Link className="portal-button" to="/teams">
            Xem trang đội thể thao
          </Link>
          <Link className="portal-button ghost" to="/recruitment">
            Tìm người đá bù
          </Link>
        </>
      }
    >
      <MetricGrid items={captainMetrics} />

      <div className="detail-grid">
        <SurfaceCard title="Đội của bạn" subtitle="Danh sách nhân sự và phong độ gần nhất">
          <ul className="plain-list">
            {teams.slice(0, 2).map((team) => (
              <li key={team.teamId}>
                <div className="row-inline">
                  <strong>{team.teamName}</strong>
                  <Badge tone={team.lookingForOpponent ? 'teal' : 'navy'}>
                    {team.qualityLevel}
                  </Badge>
                </div>
                <p className="muted">
                  {team.homeArea} · {team.recentForm}
                </p>
                <p className="muted">Nhân sự: {team.members?.join(', ')}</p>
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard title="Kèo đấu gần nhất" subtitle="Tình trạng ghép đối và điểm danh">
          <ul className="plain-list">
            {matches.map((match) => (
              <li key={match.matchId}>
                <div className="row-inline">
                  <strong>
                    {match.homeTeamName} vs {match.awayTeamName}
                  </strong>
                  <Badge tone={toneFromStatus(match.matchStatus)}>{match.matchStatus}</Badge>
                </div>
                <p className="muted">
                  {match.kickoffLabel} · {match.venueLabel}
                </p>
                <p className="muted">{match.attendanceSummary}</p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>

      <div className="detail-grid">
        <SurfaceCard title="Tin tuyển quân đang mở" subtitle="Những vị trí còn thiếu">
          <ul className="plain-list">
            {recruitmentAds.map((ad) => (
              <li key={ad.adId}>
                <div className="row-inline">
                  <strong>{ad.teamName}</strong>
                  <Badge tone="rose">{ad.positionNeeded}</Badge>
                </div>
                <p className="muted">
                  {ad.title} · {ad.urgencyLabel}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard title="Nguồn cầu thủ tự do" subtitle="Có thể gọi bổ sung ngay">
          <ul className="plain-list">
            {freeAgents.map((player) => (
              <li key={player.userId}>
                <strong>{player.fullName}</strong>
                <p className="muted">
                  {player.preferredPosition} · {player.activeArea}
                </p>
                <p className="muted">{player.availabilityNote}</p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>

      <div className="detail-grid">
        <SurfaceCard title="Lịch sân ngắn hạn" subtitle="Các slot cần đội xác nhận">
          <ul className="plain-list">
            {upcomingSchedules.map((schedule, idx) => (
              <li key={idx}>
                <strong>{schedule.pitchName}</strong>
                <p className="muted">
                  {schedule.windowLabel} · {schedule.bookedByName} · {schedule.status}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard title="Booking tuần" subtitle="Lịch lặp cần theo dõi">
          <ul className="plain-list">
            {recurringBookings.map((booking, idx) => (
              <li key={idx}>
                <strong>{booking.teamName}</strong>
                <p className="muted">
                  {booking.pitchName} · {booking.weeklySlot} · {booking.dateRange}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>
    </AdminLayout>
  );
}

export default CaptainCaptain;
