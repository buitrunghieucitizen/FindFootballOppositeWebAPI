import { CrudPage } from '../components/portal-ui';
import { sampleSelections, teams } from '../data/portalMockData';

function EditMatchAdmin() {
  const match = sampleSelections.primaryMatch;

  return (
    <CrudPage
      title={`Sửa trận #${match.id}`}
      subtitle="Trang cập nhật trạng thái trận đã được React hóa đầy đủ."
      secondaryTo="/admin/matches"
      primaryLabel="Lưu trận đấu"
      fields={[
        {
          label: 'Đội nhà',
          as: 'select',
          defaultValue: match.homeTeamName,
          options: teams.map((team) => ({ value: team.name, label: team.name })),
        },
        {
          label: 'Đội khách',
          as: 'select',
          defaultValue: match.awayTeamName,
          options: [
            ...teams.map((team) => ({ value: team.name, label: team.name })),
            { value: 'Chờ đối thủ', label: 'Chờ đối thủ' },
          ],
        },
        { label: 'Khung giờ', defaultValue: match.kickoffLabel },
        { label: 'Sân thi đấu', defaultValue: match.venueLabel },
        {
          label: 'Trạng thái',
          as: 'select',
          defaultValue: match.matchStatus,
          options: [
            { value: 'Proposed', label: 'Proposed' },
            { value: 'Accepted', label: 'Accepted' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ],
        },
        {
          label: 'Ghi chú điểm danh',
          as: 'textarea',
          span: 'full',
          defaultValue: match.attendanceSummary,
        },
      ]}
      asideTitle="Luồng cập nhật trận"
      asideItems={[
        'Khi status chuyển Completed, nên khóa sửa roster và venue.',
        'Nếu đổi venue, cần kiểm tra xung đột slot sân.',
        'Nếu còn trạng thái Proposed, recruitment có thể vẫn được mở.',
      ]}
    />
  );
}

export default EditMatchAdmin;
