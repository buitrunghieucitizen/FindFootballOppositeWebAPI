import { Link } from 'react-router-dom';
import { AdminLayout, Badge, SurfaceCard } from '../components/portal-ui';
import { teams } from '../data/portalMockData';

function TeamsAdmin() {
  return (
    <AdminLayout
      title="Quản lý đội bóng"
      subtitle="Thay cho bảng Razor cũ bằng card React tập trung vào captain, khu vực và trạng thái tìm đối."
      actions={
        <>
          <Link className="portal-button" to="/admin/teams/create">
            Thêm đội
          </Link>
          <Link className="portal-button ghost" to="/captain">
            Xem dashboard captain
          </Link>
        </>
      }
    >
      <div className="card-grid">
        {teams.map((team) => (
          <SurfaceCard
            key={team.id}
            title={team.name}
            subtitle={`${team.captain} · ${team.homeArea}`}
            aside={
              <Badge tone={team.lookingForOpponent ? 'teal' : 'navy'}>
                {team.lookingForOpponent ? 'Đang tìm đối' : 'Đã ổn định'}
              </Badge>
            }
          >
            <ul className="meta-list">
              <li>Chất lượng đội: {team.quality}.</li>
              <li>Phong độ: {team.recentForm}.</li>
              <li>Nhân sự chính: {team.members.join(', ')}.</li>
              <li>{team.history}</li>
            </ul>
            <div className="hero-actions">
              <Link className="portal-button ghost" to={`/admin/teams/${team.id}/edit`}>
                Sửa đội
              </Link>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </AdminLayout>
  );
}

export default TeamsAdmin;
