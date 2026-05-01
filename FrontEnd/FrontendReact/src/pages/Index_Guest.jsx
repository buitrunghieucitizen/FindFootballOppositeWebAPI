import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  MetricGrid,
  PageSection,
  PublicLayout,
  SurfaceCard,
  formatCurrency,
} from '../components/portal-ui';
import { publicService } from '../services/publicService';
import {
  FiUsers,
  FiTarget,
  FiMapPin,
  FiCalendar,
  FiRadio,
} from 'react-icons/fi';

function IndexGuest() {
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
      <PublicLayout title="Đang tải dữ liệu..." subtitle="Đang kết nối tới Backend...">
        <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
      </PublicLayout>
    );
  }

  if (!data) return null;

  const teams = data.teams || [];
  const recruitmentAds = data.recruitmentAds || [];
  const actorCapabilities = data.actorCapabilities || [];
  
  // Flatten pitches from stadiums for the 'pitchCatalog' equivalent
  const pitchCatalog = [];
  if (data.stadiums) {
    data.stadiums.forEach(stadium => {
      if (stadium.pitches) {
        stadium.pitches.forEach(pitch => {
          pitchCatalog.push({
            ...pitch,
            stadiumName: stadium.stadiumName,
            address: stadium.address,
            ownerName: stadium.ownerName,
            description: stadium.description
          });
        });
      }
    });
  }

  // Map backend metrics to the frontend metric grid format
  const publicMetrics = [
    { label: 'Số đội bóng', value: data.metrics?.teamCount || 0, icon: FiUsers, trend: '+12 đội mới', tone: 'teal' },
    { label: 'Cầu thủ tự do', value: data.metrics?.freeAgentCount || 0, icon: FiTarget, trend: 'Đang sẵn sàng', tone: 'amber' },
    { label: 'Sân khả dụng', value: data.metrics?.pitchCount || 0, icon: FiMapPin, trend: 'Khung giờ đa dạng', tone: 'navy' },
    { label: 'Kèo sắp tới', value: data.metrics?.upcomingMatchCount || 0, icon: FiCalendar, trend: 'Tuần này', tone: 'rose' },
  ];

  return (
    <PublicLayout
      title="Đặt sân, ghép đối, tuyển quân trên cùng một nhịp vận hành"
      subtitle="Frontend này đã được kết nối trực tiếp với ASP.NET Core Backend qua API."
      actions={
        <>
          <Link className="portal-button" to="/matches">
            Gạ đối ngay
          </Link>
          <Link className="portal-button ghost" to="/stadiums">
            Xem lịch sân
          </Link>
        </>
      }
    >
      <MetricGrid items={publicMetrics} />

      <PageSection
        eyebrow="Sân nổi bật"
        title="Sân bóng và khung giờ dễ chốt"
        subtitle="Các cụm sân dưới đây đang có mô phỏng lịch mở để đội trưởng xem nhanh và lên kèo."
      >
        <div className="card-grid">
          {pitchCatalog.slice(0, 3).map((pitch) => (
            <SurfaceCard
              key={pitch.pitchId}
              title={pitch.pitchName}
              subtitle={`${pitch.stadiumName} · ${pitch.address}`}
              aside={<Badge tone="amber">{pitch.availabilityLabel}</Badge>}
            >
              <ul className="meta-list">
                <li>Quy mô sân: {pitch.pitchSize} người.</li>
                <li>Đơn giá hiện tại: {formatCurrency(pitch.pricePerHour)} / giờ.</li>
                <li>Chủ sân: {pitch.ownerName}.</li>
                <li>{pitch.description}</li>
              </ul>
            </SurfaceCard>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Đội bóng"
        title="Đội đang hoạt động và sẵn sàng nhận kèo"
        subtitle="Được lấy dữ liệu trực tiếp từ Backend."
      >
        <div className="card-grid">
          {teams.slice(0, 3).map((team) => (
            <article className="team-card" key={team.teamId}>
              <div className="row-inline">
                <Badge tone={team.lookingForOpponent ? 'teal' : 'navy'}>
                  {team.lookingForOpponent ? 'Đang tìm đối' : 'Đội ổn định'}
                </Badge>
                <span className="muted">{team.qualityLevel}</span>
              </div>
              <h3>{team.teamName}</h3>
              <p className="muted">
                Captain: {team.captainName} · Khu vực {team.homeArea}
              </p>
              <ul className="meta-list">
                <li>{team.history}</li>
                <li>Phong độ gần đây: {team.recentForm}.</li>
                <li>Nhân sự nòng cốt: {team.members?.slice(0, 4).join(', ')}.</li>
              </ul>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Tuyển quân"
        title="Tin nổi bật đang chờ cầu thủ phản hồi"
        subtitle="Dữ liệu từ API Backend."
      >
        <div className="detail-grid">
          {recruitmentAds.slice(0, 2).map((ad) => (
            <article className="list-card" key={ad.adId}>
              <div className="row-inline">
                <Badge tone="rose">{ad.urgencyLabel}</Badge>
                <Badge tone="sand">{ad.positionNeeded}</Badge>
              </div>
              <strong>{ad.title}</strong>
              <p className="muted">{ad.content}</p>
              <ul className="meta-list">
                <li>Đội đăng: {ad.teamName}.</li>
                <li>Bối cảnh trận: {ad.matchLabel}.</li>
              </ul>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Vai trò"
        title="Ai dùng hệ thống này và họ làm gì"
        subtitle="Phân quyền chi tiết trên Backend."
      >
        <div className="card-grid">
          {actorCapabilities.slice(0, 3).map((actor) => (
            <SurfaceCard
              key={actor.actorName}
              title={actor.actorName}
              subtitle={actor.summary}
            >
              <ul className="plain-list">
                {actor.capabilities?.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </SurfaceCard>
          ))}
        </div>
      </PageSection>
    </PublicLayout>
  );
}

export default IndexGuest;
