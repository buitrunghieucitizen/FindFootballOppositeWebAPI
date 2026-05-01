import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge, PageSection, PublicLayout, SurfaceCard } from '../components/portal-ui';
import { publicService } from '../services/publicService';

function TeamsGuest() {
  const [data, setData] = useState({ teams: [], players: [] });
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

  const teams = data.teams || [];
  const freeAgents = (data.players || []).filter(p => p.isFreeAgent);

  return (
    <PublicLayout
      title="Quản lý đội bóng và cầu thủ tự do"
      subtitle="Dữ liệu này đang được tải trực tiếp từ Backend (C# ASP.NET Core) thông qua API."
      actions={
        <>
          <Link className="portal-button" to="/recruitment">
            Xem tin tuyển quân
          </Link>
          <Link className="portal-button ghost" to="/captain">
            Mở dashboard đội trưởng
          </Link>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <>
          <PageSection
            eyebrow="Đội bóng"
            title="Các đội đang hoạt động"
            subtitle="Mỗi đội giữ lại những thông tin quan trọng: captain, khu vực, phong độ và nhu cầu ghép đối."
          >
            <div className="card-grid">
              {teams.map((team) => (
                <SurfaceCard
                  key={team.teamId}
                  title={team.teamName}
                  subtitle={`${team.captainName} · ${team.homeArea}`}
                  aside={
                    <Badge tone={team.lookingForOpponent ? 'teal' : 'navy'}>
                      {team.qualityLevel}
                    </Badge>
                  }
                >
                  <ul className="meta-list">
                    <li>{team.history}</li>
                    <li>Phong độ: {team.recentForm}.</li>
                    <li>Thành viên chính: {team.members?.join(', ')}.</li>
                    <li>
                      Trạng thái kèo: {team.lookingForOpponent ? 'Đang mở ghép đối.' : 'Đang ưu tiên nội bộ.'}
                    </li>
                  </ul>
                </SurfaceCard>
              ))}
            </div>
          </PageSection>

          <PageSection
            eyebrow="Cầu thủ rảnh"
            title="Nguồn bổ sung nhanh cho các kèo đá bù"
            subtitle="Những cầu thủ đang bật trạng thái tự do."
          >
            <div className="card-grid">
              {freeAgents.map((player) => (
                <article className="team-card" key={player.userId}>
                  <div className="row-inline">
                    <Badge tone="amber">{player.preferredPosition}</Badge>
                    <Badge tone="sand">{player.activeArea}</Badge>
                  </div>
                  <h3>{player.fullName}</h3>
                  <p className="muted">{player.teamName}</p>
                  <ul className="meta-list">
                    <li>{player.availabilityNote}</li>
                    <li>Vai trò: {player.roles?.join(', ')}.</li>
                  </ul>
                </article>
              ))}
            </div>
          </PageSection>
        </>
      )}
    </PublicLayout>
  );
}

export default TeamsGuest;
