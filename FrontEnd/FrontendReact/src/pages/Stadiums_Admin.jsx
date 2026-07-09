import { Link } from 'react-router-dom';
import {
  AdminLayout,
  Badge,
  SurfaceCard,
  formatCurrency,
} from '../components/portal-ui';
import { stadiums } from '../data/portalMockData';

function StadiumsAdmin() {
  return (
    <AdminLayout
      title="Quản lý sân thể thao"
      subtitle="Mỗi cụm sân được render thành card quản trị rõ ràng, thay thế table Razor lẫn link `Url.Action` cũ."
      actions={
        <>
          <Link className="portal-button" to="/admin/stadiums/create">
            Thêm cụm sân
          </Link>
          <Link className="portal-button ghost" to="/stadium-owner">
            Góc nhìn chủ sân
          </Link>
        </>
      }
    >
      <div className="card-grid">
        {stadiums.map((stadium) => (
          <SurfaceCard
            key={stadium.id}
            title={stadium.name}
            subtitle={`${stadium.ownerName} · ${stadium.address}`}
            aside={<Badge tone="amber">{stadium.utilizationLabel}</Badge>}
          >
            <ul className="meta-list">
              <li>{stadium.description}</li>
              {stadium.pitches.map((pitch) => (
                <li key={pitch.id}>
                  {pitch.name} · Sân {pitch.size} · {formatCurrency(pitch.pricePerHour)} ·{' '}
                  {pitch.availabilityLabel}
                </li>
              ))}
            </ul>
            <div className="hero-actions">
              <Link className="portal-button ghost" to={`/admin/stadiums/${stadium.id}`}>
                Chi tiết
              </Link>
              <Link className="portal-button ghost" to={`/admin/stadiums/${stadium.id}/edit`}>
                Sửa
              </Link>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </AdminLayout>
  );
}

export default StadiumsAdmin;
