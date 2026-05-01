import { Link } from 'react-router-dom';
import {
  AdminLayout,
  Badge,
  SurfaceCard,
  toneFromStatus,
} from '../components/portal-ui';
import { matches } from '../data/portalMockData';

function MatchesAdmin() {
  return (
    <AdminLayout
      title="Quản lý trận đấu"
      subtitle="Bảng trận được chuyển từ switch C# và vòng lặp Razor sang React table có badge trạng thái."
      actions={
        <>
          <Link className="portal-button" to="/admin/matches/create">
            Tạo trận
          </Link>
          <Link className="portal-button ghost" to="/matches">
            Xem trang khách
          </Link>
        </>
      }
    >
      <SurfaceCard title="Danh sách trận" subtitle="Có thể nối CRUD thật sau khi backend sẵn sàng.">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Đội nhà</th>
                <th>Đội khách</th>
                <th>Giờ đá</th>
                <th>Trạng thái</th>
                <th>Sân</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id}>
                  <td>#{match.id}</td>
                  <td>{match.homeTeamName}</td>
                  <td>{match.awayTeamName}</td>
                  <td>{match.kickoffLabel}</td>
                  <td>
                    <Badge tone={toneFromStatus(match.matchStatus)}>{match.matchStatus}</Badge>
                  </td>
                  <td>{match.venueLabel}</td>
                  <td>
                    <Link className="portal-button ghost" to={`/admin/matches/${match.id}/edit`}>
                      Sửa trận
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </AdminLayout>
  );
}

export default MatchesAdmin;
