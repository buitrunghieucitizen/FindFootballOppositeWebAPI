import { Link } from 'react-router-dom';
import { PageSection, PublicLayout, SurfaceCard } from '../components/portal-ui';
import { databaseSchema } from '../data/portalMockData';

function PrivacyGuest() {
  return (
    <PublicLayout
      title="Cấu trúc dữ liệu và phạm vi thông tin"
      subtitle="Trang thay cho phần ViewData/Privacy cũ, dùng để mô tả các bảng lõi mà frontend này đang mô phỏng."
      actions={
        <>
          <Link className="portal-button" to="/operations">
            Xem ma trận vận hành
          </Link>
          <Link className="portal-button ghost" to="/admin/users">
            Xem dữ liệu quản trị
          </Link>
        </>
      }
    >
      <PageSection
        eyebrow="Schema"
        title="Các bảng chính của hệ thống"
        subtitle="Tên bảng được giữ dạng kỹ thuật để tiện nối backend hoặc ORM ở bước tiếp theo."
      >
        <div className="card-grid">
          {databaseSchema.map((table) => (
            <SurfaceCard key={table.name} title={table.name} subtitle={table.purpose}>
              <ul className="plain-list">
                {table.fields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </SurfaceCard>
          ))}
        </div>
      </PageSection>
    </PublicLayout>
  );
}

export default PrivacyGuest;
