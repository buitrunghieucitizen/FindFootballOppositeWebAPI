import { CrudPage } from '../components/portal-ui';

function CreateTeamAdmin() {
  return (
    <CrudPage
      title="Thêm đội bóng"
      subtitle="Khung form mới cho module đội bóng sau khi bỏ Razor syntax."
      secondaryTo="/admin/teams"
      fields={[
        { label: 'Tên đội', placeholder: 'FC Sunset' },
        { label: 'Captain phụ trách', placeholder: 'Nguyễn Văn B' },
        { label: 'Khu vực hoạt động', placeholder: 'Quận 7' },
        {
          label: 'Mức chất lượng',
          as: 'select',
          defaultValue: 'Hạng B',
          options: [
            { value: 'Hạng A phủi', label: 'Hạng A phủi' },
            { value: 'Hạng A-', label: 'Hạng A-' },
            { value: 'Hạng B+', label: 'Hạng B+' },
            { value: 'Hạng B', label: 'Hạng B' },
          ],
        },
        {
          label: 'Danh sách thành viên',
          as: 'textarea',
          span: 'full',
          defaultValue: 'Tách tên thành viên bằng dấu phẩy để tiện mapping về sau.',
        },
        {
          label: 'Mô tả chiến thuật',
          as: 'textarea',
          span: 'full',
          placeholder: 'Ví dụ: đá biên nhanh, ưu tiên pressing tầm cao...',
        },
      ]}
      asideTitle="Thông tin đội nên có"
      asideItems={[
        'Captain cần là một user đã tồn tại hoặc có thể map sau.',
        'Danh sách thành viên nên tách khỏi chuỗi text khi nối API thật.',
        'Nên lưu thêm cờ lookingForOpponent để phục vụ trang ghép đối.',
      ]}
    />
  );
}

export default CreateTeamAdmin;
