import { CrudPage } from '../components/portal-ui';
import { sampleSelections } from '../data/portalMockData';

function EditTeamAdmin() {
  const team = sampleSelections.primaryTeam;

  return (
    <CrudPage
      title={`Sửa đội thể thao #${team.id}`}
      subtitle="Mẫu chỉnh sửa đội đã được chuyển sang React hoàn chỉnh."
      secondaryTo="/admin-dashboard"
      primaryLabel="Lưu đội thể thao"
      fields={[
        { label: 'Tên đội', defaultValue: team.name },
        { label: 'Captain phụ trách', defaultValue: team.captain },
        { label: 'Khu vực hoạt động', defaultValue: team.homeArea },
        {
          label: 'Mức chất lượng',
          as: 'select',
          defaultValue: team.quality,
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
          defaultValue: team.members.join(', '),
        },
        {
          label: 'Mô tả đội',
          as: 'textarea',
          span: 'full',
          defaultValue: `${team.history} Phong độ hiện tại: ${team.recentForm}.`,
        },
      ]}
      asideTitle="Lưu ý vận hành đội"
      asideItems={[
        'Nếu đổi captain, nên gửi thông báo cho đội viên hiện tại.',
        'Phong độ có thể được tính từ lịch sử trận thay vì nhập tay.',
        'Trạng thái tìm đối nên đồng bộ với trang Matches và Recruitment.',
      ]}
    />
  );
}

export default EditTeamAdmin;
