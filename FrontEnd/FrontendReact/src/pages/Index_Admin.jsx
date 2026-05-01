import { Link } from 'react-router-dom';
import { AdminLayout, MetricGrid, SurfaceCard } from '../components/portal-ui';
import { adminMetrics, adminShortcuts } from '../data/portalMockData';

function IndexAdmin() {
  return (
    <AdminLayout
      title="Bảng điều hướng quản trị"
      subtitle="Đây là màn vào nhanh cho admin sau khi các view Razor cũ đã được chuyển sang route và JSX phía client."
      actions={
        <>
          <Link className="portal-button" to="/admin/overview">
            Mở điều hành chi tiết
          </Link>
          <Link className="portal-button ghost" to="/">
            Xem trang khách
          </Link>
        </>
      }
    >
      <MetricGrid items={adminMetrics} />
      <div className="card-grid">
        {adminShortcuts.map((item) => (
          <Link className="quick-link" key={item.to} to={item.to}>
            <span className="section-eyebrow">Shortcut</span>
            <h3>{item.title}</h3>
            <p className="muted">{item.description}</p>
          </Link>
        ))}
      </div>
      <SurfaceCard
        title="Tình trạng migration"
        subtitle="Các module quản trị đã không còn `Url.Action`, `Model.Any()` hoặc block C# chen trong JSX."
      >
        <ul className="plain-list">
          <li>Route quản trị đã map sang React Router.</li>
          <li>Bảng và form đều dùng dữ liệu mẫu đồng nhất.</li>
          <li>Có thể nối API CRUD thật mà không cần dọn lại syntax cũ.</li>
        </ul>
      </SurfaceCard>
    </AdminLayout>
  );
}

export default IndexAdmin;
