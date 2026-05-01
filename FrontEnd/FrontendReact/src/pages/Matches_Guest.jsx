import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  PageSection,
  PublicLayout,
  SurfaceCard,
  toneFromStatus,
} from '../components/portal-ui';
import { publicService } from '../services/publicService';

function MatchesGuest() {
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

  const matches = data.matches || [];
  const recruitmentAds = data.recruitmentAds || [];

  return (
    <PublicLayout
      title="Kèo đấu, ghép đối và lịch ra sân"
      subtitle="Dữ liệu này đang được tải trực tiếp từ Backend (C# ASP.NET Core) thông qua API."
      actions={
        <>
          <Link className="portal-button" to="/teams">
            Tìm đội phù hợp
          </Link>
          <Link className="portal-button ghost" to="/recruitment">
            Tìm người đá bù
          </Link>
        </>
      }
    >
      <PageSection
        eyebrow="Lịch trận"
        title="Các kèo hiện có trên hệ thống"
        subtitle="Giữ lại ý nghĩa home team, away team, status và venue nhưng lấy từ API."
      >
        <div className="card-grid">
          {matches.map((match) => (
            <SurfaceCard
              key={match.matchId}
              title={`${match.homeTeamName} vs ${match.awayTeamName}`}
              subtitle={match.kickoffLabel}
              aside={<Badge tone={toneFromStatus(match.matchStatus)}>{match.matchStatus}</Badge>}
            >
              <ul className="meta-list">
                <li>Sân thi đấu: {match.venueLabel}.</li>
                <li>Điểm danh: {match.attendanceSummary}.</li>
              </ul>
            </SurfaceCard>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Bổ sung quân số"
        title="Những bài tuyển quân liên quan trực tiếp tới trận"
        subtitle="Dùng để lấp chỗ trống nhanh cho các kèo proposed hoặc đá bù."
      >
        <div className="detail-grid">
          {recruitmentAds.map((ad) => (
            <article className="list-card" key={ad.adId}>
              <div className="row-inline">
                <Badge tone="rose">{ad.urgencyLabel}</Badge>
                <Badge tone="sand">{ad.positionNeeded}</Badge>
              </div>
              <strong>{ad.teamName}</strong>
              <p className="muted">{ad.title}</p>
              <p>{ad.content}</p>
            </article>
          ))}
        </div>
      </PageSection>
    </PublicLayout>
  );
}

export default MatchesGuest;
