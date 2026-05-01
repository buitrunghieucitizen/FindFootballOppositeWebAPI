import { CrudPage } from '../components/portal-ui';
import { sampleSelections } from '../data/portalMockData';

function EditUserRoleAdmin() {
  const user = sampleSelections.primaryUser;

  return (
    <CrudPage
      title={`Phân quyền cho ${user.fullName}`}
      subtitle="Trang này thay cho form phân role C# cũ bằng select và textarea React."
      secondaryTo="/admin/users"
      primaryLabel="Cập nhật vai trò"
      fields={[
        { label: 'Tài khoản', defaultValue: user.username },
        {
          label: 'Vai trò chính',
          as: 'select',
          defaultValue: 'Captain',
          options: [
            { value: 'Player', label: 'Player' },
            { value: 'Captain', label: 'Captain' },
            { value: 'StadiumOwner', label: 'StadiumOwner' },
            { value: 'Admin', label: 'Admin' },
          ],
        },
        {
          label: 'Vai trò phụ hoặc scope',
          as: 'textarea',
          span: 'full',
          defaultValue: 'Có thể thêm scope như captain.team_id hoặc owner.stadium_id khi nối backend.',
        },
      ]}
      asideTitle="Nguyên tắc phân quyền"
      asideItems={[
        'Một user có thể có nhiều scope nhưng cần một role chính rõ ràng.',
        'Frontend hiện chỉ mô phỏng; backend thật nên enforce theo token claims.',
        'Mọi thay đổi quyền nên có audit trail để truy vết vận hành.',
      ]}
    />
  );
}

export default EditUserRoleAdmin;
