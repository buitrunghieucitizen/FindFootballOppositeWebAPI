import { Link } from 'react-router-dom';
import {
  AdminLayout,
  Badge,
  MetricGrid,
  SurfaceCard,
  initials,
  toneFromStatus,
} from '../components/portal-ui';
import {
  adminMetrics,
  matches,
  notifications,
  recruitmentAds,
  stadiums,
  teams,
  users,
} from '../data/portalMockData';

function AdminAdmin() {
  return (
    <AdminLayout
      title="Trung tâm điều hành hệ thống"
      subtitle="Màn này thay cho dashboard admin cũ với metric, bảng tài khoản, tình trạng sân và các cảnh báo nội dung."
      actions={
        <>
          <Link className="portal-button" to="/admin/users/create">
            Thêm người dùng
          </Link>
          <Link className="portal-button ghost" to="/admin/stadiums/create">
            Thêm cụm sân
          </Link>
        </>
      }
    >
      <MetricGrid items={adminMetrics} />

      <div className="dashboard-grid">
        <SurfaceCard title="Người dùng mới nhất" subtitle="Preview của module Users">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 4).map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="row-inline">
                        <span className="table-avatar">{initials(user.fullName)}</span>
                        <div className="stack">
                          <strong>{user.fullName}</strong>
                          <span className="muted">{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="row-inline">
                        {user.roles.map((role) => (
                          <Badge key={role} tone={toneFromStatus(role)}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td>{user.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Thông báo vận hành" subtitle="Những việc admin cần xử lý trong ngày">
          <ul className="plain-list">
            {notifications.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <p className="muted">
                  Gửi tới {item.recipientName}: {item.message}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>

      <div className="detail-grid">
        <SurfaceCard title="Đội thể thao nổi bật" subtitle="Giữ lại nội dung điều hành nhưng render bằng card React">
          <ul className="plain-list">
            {teams.slice(0, 3).map((team) => (
              <li key={team.id}>
                <strong>{team.name}</strong>
                <p className="muted">
                  {team.captain} · {team.homeArea} · {team.recentForm}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard title="Cụm sân hoạt động" subtitle="Tổng hợp ngắn để điều phối">
          <ul className="plain-list">
            {stadiums.map((stadium) => (
              <li key={stadium.id}>
                <strong>{stadium.name}</strong>
                <p className="muted">
                  {stadium.ownerName} · {stadium.utilizationLabel}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>

      <div className="detail-grid">
        <SurfaceCard title="Tin tuyển quân cần để ý" subtitle="Nguồn dữ liệu dùng chung với trang Recruitment">
          <ul className="plain-list">
            {recruitmentAds.map((ad) => (
              <li key={ad.id}>
                <strong>{ad.title}</strong>
                <p className="muted">
                  {ad.teamName} · {ad.positionNeeded} · {ad.urgencyLabel}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard title="Lịch trận mới nhất" subtitle="Trạng thái trận đã chuẩn hóa sang badge">
          <ul className="plain-list">
            {matches.map((match) => (
              <li key={match.id}>
                <div className="row-inline">
                  <strong>
                    {match.homeTeamName} vs {match.awayTeamName}
                  </strong>
                  <Badge tone={toneFromStatus(match.matchStatus)}>{match.matchStatus}</Badge>
                </div>
                <p className="muted">
                  {match.kickoffLabel} · {match.venueLabel}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>
    </AdminLayout>
  );
}

export default AdminAdmin;
