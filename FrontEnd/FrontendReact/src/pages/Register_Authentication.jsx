import { Link } from 'react-router-dom';
import { AuthLayout, DemoInput } from '../components/portal-ui';

function RegisterAuthentication() {
  return (
    <AuthLayout
      title="Tạo tài khoản mới cho cầu thủ hoặc đội trưởng"
      subtitle="Form đăng ký đã được chuyển thành React hợp lệ, sẵn sàng gắn validation client hoặc API register thật."
      asideTitle="Thông tin nên thu thập"
      asideItems={[
        'Họ tên đầy đủ, số điện thoại và username duy nhất.',
        'Vai trò khởi tạo: Player hoặc Captain.',
        'Mật khẩu và xác nhận mật khẩu cho bước nối auth backend.',
      ]}
    >
      <div className="stack">
        <div className="stack">
          <div className="row-inline">
            <span className="portal-badge tone-amber">Onboarding</span>
            <span className="muted">Phiên bản React sạch để nối service</span>
          </div>
          <h2>Đăng ký tài khoản</h2>
        </div>
        <div className="form-grid">
          <DemoInput label="Họ và tên" placeholder="Nguyễn Văn A" />
          <DemoInput label="Tên đăng nhập" placeholder="van.a" />
          <DemoInput label="Số điện thoại" placeholder="09xx xxx xxx" />
          <DemoInput
            label="Vai trò"
            as="select"
            defaultValue="Player"
            options={[
              { value: 'Player', label: 'Player' },
              { value: 'Captain', label: 'Captain' },
            ]}
          />
          <DemoInput label="Mật khẩu" type="password" defaultValue="strong-password" />
          <DemoInput label="Xác nhận mật khẩu" type="password" defaultValue="strong-password" />
        </div>
        <div className="form-actions">
          <button className="portal-button" type="button">
            Tạo tài khoản demo
          </button>
          <Link className="portal-button ghost" to="/login">
            Đã có tài khoản
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default RegisterAuthentication;
