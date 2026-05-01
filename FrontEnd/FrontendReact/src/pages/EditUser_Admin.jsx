import { CrudPage } from '../components/portal-ui';
import { sampleSelections } from '../data/portalMockData';

function EditUserAdmin() {
  const user = sampleSelections.primaryUser;

  return (
    <CrudPage
      title={`Sửa người dùng #${user.id}`}
      subtitle="Mẫu cập nhật tài khoản đã được chuyển sang JSX sạch."
      secondaryTo="/admin/users"
      primaryLabel="Lưu thay đổi"
      fields={[
        { label: 'Họ và tên', defaultValue: user.fullName },
        { label: 'Tên đăng nhập', defaultValue: user.username },
        { label: 'Số điện thoại', defaultValue: user.phone },
        {
          label: 'Vai trò chính',
          as: 'select',
          defaultValue: user.roles[0],
          options: [
            { value: 'Player', label: 'Player' },
            { value: 'Captain', label: 'Captain' },
            { value: 'StadiumOwner', label: 'StadiumOwner' },
            { value: 'Admin', label: 'Admin' },
          ],
        },
        { label: 'Ngày tạo', defaultValue: user.createdAt },
        {
          label: 'Ghi chú nội bộ',
          as: 'textarea',
          span: 'full',
          defaultValue: 'Tài khoản mẫu sau migration. Chưa gắn API update thật.',
        },
      ]}
      asideTitle="Kiểm tra trước khi lưu"
      asideItems={[
        'Nếu đổi role, cần đồng bộ lại các màn dashboard liên quan.',
        'Số điện thoại nên có chuẩn normalize trước khi lưu thật.',
        'Audit log nên ghi nhận ai cập nhật và thời điểm cập nhật.',
      ]}
    />
  );
}

export default EditUserAdmin;
