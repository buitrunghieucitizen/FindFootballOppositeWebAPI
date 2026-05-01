import { Link } from 'react-router-dom';
import { EmptyState, PublicLayout } from '../components/portal-ui';

function ErrorShared() {
  return (
    <PublicLayout
      title="Không tìm thấy trang bạn đang mở"
      subtitle="Route này đóng vai trò thay cho trang lỗi cũ, nhưng đã được viết lại hoàn toàn bằng React thay vì view Razor."
      actions={
        <>
          <Link className="portal-button" to="/">
            Về trang chủ
          </Link>
          <Link className="portal-button ghost" to="/admin-dashboard">
            Mở dashboard
          </Link>
        </>
      }
    >
      <EmptyState
        title="Route không tồn tại"
        description="Kiểm tra lại đường dẫn hoặc quay về một trong các màn chính đã được cấu hình trong React Router."
        action={
          <div className="hero-actions">
            <Link className="portal-button ghost" to="/teams">
              Đội bóng
            </Link>
            <Link className="portal-button ghost" to="/stadiums">
              Sân bóng
            </Link>
          </div>
        }
      />
    </PublicLayout>
  );
}

export default ErrorShared;
