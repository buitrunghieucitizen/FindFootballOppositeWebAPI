import { CrudPage } from '../components/portal-ui';
import { sampleSelections } from '../data/portalMockData';

function EditStadiumAdmin() {
  const stadium = sampleSelections.primaryStadium;

  return (
    <CrudPage
      title={`Sửa cụm sân #${stadium.id}`}
      subtitle="Mẫu cập nhật cụm sân sau migration sang React."
      secondaryTo="/admin-dashboard"
      primaryLabel="Lưu cụm sân"
      fields={[
        { label: 'Tên cụm sân', defaultValue: stadium.name },
        { label: 'Chủ sân', defaultValue: stadium.ownerName },
        { label: 'Địa chỉ', defaultValue: stadium.address },
        { label: 'Công suất hiện tại', defaultValue: stadium.utilizationLabel },
        {
          label: 'Mô tả cụm sân',
          as: 'textarea',
          span: 'full',
          defaultValue: stadium.description,
        },
        {
          label: 'Danh sách sân con',
          as: 'textarea',
          span: 'full',
          defaultValue: stadium.pitches
            .map(
              (pitch) =>
                `${pitch.name} - Sân ${pitch.size} - ${pitch.pricePerHour} - ${pitch.availabilityLabel}`,
            )
            .join('\n'),
        },
      ]}
      asideTitle="Điều cần đồng bộ"
      asideItems={[
        'Giá sân con nên đồng bộ với module booking.',
        'Mọi thay đổi availability hiển thị cần dựa trên lịch thực tế.',
        'Địa chỉ và mô tả nên dùng chung cho landing page công khai.',
      ]}
    />
  );
}

export default EditStadiumAdmin;
