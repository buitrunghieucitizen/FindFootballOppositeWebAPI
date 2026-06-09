import { CrudPage } from '../components/portal-ui';
import { teams } from '../data/portalMockData';

function CreateMatchAdmin() {
  return (
    <CrudPage
      title="Thêm trận đấu"
      subtitle="Mẫu tạo trận mới sau khi thay toàn bộ block C# bằng React form."
      secondaryTo="/admin-dashboard"
      fields={[
        {
          label: 'Đội nhà',
          as: 'select',
          defaultValue: teams[0].name,
          options: teams.map((team) => ({ value: team.name, label: team.name })),
        },
        {
          label: 'Đội khách',
          as: 'select',
          defaultValue: teams[1].name,
          options: [
            ...teams.map((team) => ({ value: team.name, label: team.name })),
            { value: 'Chờ đối thủ', label: 'Chờ đối thủ' },
          ],
        },
        { label: 'Khung giờ', placeholder: '19:30 · 03/05/2026' },
        { label: 'Sân thi đấu', placeholder: 'Sân Sao Biển - Sân 7A' },
        {
          label: 'Trạng thái',
          as: 'select',
          defaultValue: 'Proposed',
          options: [
            { value: 'Proposed', label: 'Proposed' },
            { value: 'Accepted', label: 'Accepted' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ],
        },
        {
          label: 'Ghi chú vận hành',
          as: 'textarea',
          span: 'full',
          placeholder: 'Ví dụ: đang chờ xác nhận sân, thiếu thủ môn...',
        },
      ]}
      asideTitle="Điểm lưu ý khi tạo trận"
      asideItems={[
        'Nếu chưa có đội khách, cho phép lưu trạng thái Proposed.',
        'Kickoff và venue nên chuẩn hóa kiểu dữ liệu ở backend thật.',
        'Attendance summary có thể tính từ danh sách xác nhận thành viên.',
      ]}
    />
  );
}

export default CreateMatchAdmin;
