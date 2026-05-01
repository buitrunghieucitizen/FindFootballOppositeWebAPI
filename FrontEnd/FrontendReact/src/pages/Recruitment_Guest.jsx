import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge, PageSection, PublicLayout, SurfaceCard } from '../components/portal-ui';
import { publicService } from '../services/publicService';

function RecruitmentGuest() {
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

  const recruitmentAds = data.recruitmentAds || [];
  const freeAgents = (data.players || []).filter(p => p.isFreeAgent);

  return (
    <PublicLayout
      title="Tuyển thành viên và gọi cầu thủ đá bù"
      subtitle="Dữ liệu này đang được tải trực tiếp từ Backend (C# ASP.NET Core) thông qua API."
      actions={
        <>
          <Link className="portal-button" to="/register">
            Đăng ký làm cầu thủ
          </Link>
          <Link className="portal-button ghost" to="/captain">
            Xem góc nhìn đội trưởng
          </Link>
        </>
      }
    >
      <PageSection
        eyebrow="Bài đăng"
        title="Tin tuyển quân đang mở"
        subtitle="Mỗi bài đăng hiển thị nhu cầu, đội tuyển và mức độ gấp."
      >
        <div className="card-grid">
          {recruitmentAds.map((ad) => (
            <SurfaceCard
              key={ad.adId}
              title={ad.title}
              subtitle={ad.content}
              aside={<Badge tone="rose">{ad.urgencyLabel}</Badge>}
            >
              <ul className="meta-list">
                <li>Đội đăng: {ad.teamName}.</li>
                <li>Vị trí cần: {ad.positionNeeded}.</li>
                <li>Bối cảnh trận: {ad.matchLabel}.</li>
              </ul>
            </SurfaceCard>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Nguồn cầu thủ"
        title="Danh sách cầu thủ tự do"
        subtitle="Giúp đội trưởng chọn nhanh người phù hợp theo vị trí và khu vực."
      >
        <div className="card-grid">
          {freeAgents.map((player) => (
            <article className="team-card" key={player.userId}>
              <div className="row-inline">
                <Badge tone="amber">{player.preferredPosition}</Badge>
                <Badge tone="navy">{player.activeArea}</Badge>
              </div>
              <h3>{player.fullName}</h3>
              <p className="muted">{player.teamName}</p>
              <ul className="meta-list">
                <li>{player.availabilityNote}</li>
                <li>Role có thể đảm nhận: {player.roles?.join(', ')}.</li>
              </ul>
            </article>
          ))}
        </div>
      </PageSection>
    </PublicLayout>
  );
}

export default RecruitmentGuest;
