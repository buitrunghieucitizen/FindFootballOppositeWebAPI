import { Link } from 'react-router-dom';
import {
  AdminLayout,
  Badge,
  SurfaceCard,
  initials,
  toneFromStatus,
} from '../components/portal-ui';
import { users } from '../data/portalMockData';

function UsersAdmin() {
  return (
    <AdminLayout
      title="Quản lý người dùng"
      subtitle="Bảng user đã được viết lại sạch bằng React, thay thế hoàn toàn cú pháp `Model.Any`, `for`, `foreach` và `onclick` server-side."
      actions={
        <>
          <Link className="portal-button" to="/admin/users/create">
            Thêm người dùng
          </Link>
          <Link className="portal-button ghost" to="/admin/overview">
            Về điều hành
          </Link>
        </>
      }
    >
      <div className="toolbar">
        <div className="search-shell">
          <input placeholder="Tìm theo tên, username hoặc số điện thoại..." />
        </div>
        <Badge tone="navy">{users.length} tài khoản mẫu</Badge>
      </div>

      <SurfaceCard title="Danh sách tài khoản" subtitle="Bảng này sẵn sàng nối API thật.">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Điện thoại</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <div className="row-inline">
                      <span className="table-avatar">{initials(user.fullName)}</span>
                      <div className="stack">
                        <strong>{user.fullName}</strong>
                        <span className="muted">{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.phone}</td>
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
                  <td>
                    <div className="row-inline">
                      <Link className="portal-button ghost" to={`/admin/users/${user.id}/roles`}>
                        Vai trò
                      </Link>
                      <Link className="portal-button ghost" to={`/admin/users/${user.id}/edit`}>
                        Sửa
                      </Link>
                    </div>
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

export default UsersAdmin;
