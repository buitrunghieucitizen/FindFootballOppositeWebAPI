import { Link } from 'react-router-dom';
import { AuthLayout, DemoInput } from '../components/portal-ui';

function LoginAuthentication() {
  return (
    <AuthLayout
      title="Đăng nhập để tiếp tục điều phối đội thể thao và lịch sân"
      subtitle="Mẫu form này dùng JSX thuần, đã loại bỏ hoàn toàn `ViewData.ModelState`, `asp-action` và phần render lỗi kiểu Razor."
      asideTitle="Tài khoản demo đang có"
      asideItems={[
        'Admin để quản lý người dùng, sân thể thao và trận đấu.',
        'Captain để ghép đối, điểm danh thành viên và đăng tin tuyển quân.',
        'StadiumOwner để duyệt slot sân và hợp đồng đặt sân cố định.',
      ]}
    >
      <div className="stack">
        <SurfaceHeader />
        <div className="form-grid">
          <DemoInput
            label="Tên đăng nhập"
            placeholder="khoi.admin hoặc long.fc"
            defaultValue="khoi.admin"
          />
          <DemoInput
            label="Vai trò đăng nhập"
            as="select"
            defaultValue="Admin"
            options={[
              { value: 'Admin', label: 'Admin' },
              { value: 'StadiumOwner', label: 'StadiumOwner' },
              { value: 'Captain', label: 'Captain' },
              { value: 'Player', label: 'Player' },
            ]}
          />
          <DemoInput
            label="Mật khẩu"
            type="password"
            defaultValue="react-clean-build"
            span="full"
          />
        </div>
        <div className="form-actions">
          <button className="portal-button" type="button">
            Đăng nhập demo
          </button>
          <Link className="portal-button ghost" to="/register">
            Chưa có tài khoản
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

function SurfaceHeader() {
  return (
    <div className="stack">
      <div className="row-inline">
        <span className="portal-badge tone-teal">Access</span>
        <span className="muted">Form frontend chưa nối API</span>
      </div>
      <h2>Chào mừng quay lại</h2>
      <p className="muted">
        Từ đây bạn có thể tiếp tục nối action thật vào auth service mà không phải dọn
        thêm lỗi cú pháp JSX nữa.
      </p>
    </div>
  );
}

export default LoginAuthentication;
