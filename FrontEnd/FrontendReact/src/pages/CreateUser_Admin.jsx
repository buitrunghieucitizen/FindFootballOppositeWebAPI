import { CrudPage } from '../components/portal-ui';

function CreateUserAdmin() {
  return (
    <CrudPage
      title="Thêm người dùng"
      subtitle="Biểu mẫu mẫu để tạo tài khoản mới trong module admin."
      secondaryTo="/admin/users"
      fields={[
        { label: 'Họ và tên', placeholder: 'Nguyễn Văn A' },
        { label: 'Tên đăng nhập', placeholder: 'nguyenvana' },
        { label: 'Số điện thoại', placeholder: '09xx xxx xxx' },
        {
          label: 'Vai trò',
          as: 'select',
          defaultValue: 'Player',
          options: [
            { value: 'Player', label: 'Player' },
            { value: 'Captain', label: 'Captain' },
            { value: 'StadiumOwner', label: 'StadiumOwner' },
            { value: 'Admin', label: 'Admin' },
          ],
        },
        { label: 'Mật khẩu tạm', type: 'password', defaultValue: 'temporary-password' },
        {
          label: 'Ghi chú',
          as: 'textarea',
          span: 'full',
          placeholder: 'Ghi chú về nguồn đăng ký hoặc trạng thái xác minh...',
        },
      ]}
      asideTitle="Điểm cần có"
      asideItems={[
        'Username và số điện thoại cần kiểm tra trùng lặp.',
        'Vai trò khởi tạo nên khớp với luồng sử dụng chính.',
        'Sau khi nối API thật, thêm validation cho password và uniqueness.',
      ]}
    />
  );
}

export default CreateUserAdmin;
