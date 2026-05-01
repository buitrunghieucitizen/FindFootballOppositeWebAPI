import { CrudPage } from '../components/portal-ui';

function CreateStadiumAdmin() {
  return (
    <CrudPage
      title="Thêm cụm sân"
      subtitle="Mẫu tạo sân mới theo cấu trúc frontend React."
      secondaryTo="/admin/stadiums"
      fields={[
        { label: 'Tên cụm sân', placeholder: 'Sân Đông Dương' },
        { label: 'Chủ sân', placeholder: 'Nguyễn Hải Nam' },
        { label: 'Địa chỉ', placeholder: 'Số nhà, đường, quận' },
        { label: 'Mức giá tham chiếu', placeholder: '650000' },
        {
          label: 'Mô tả cụm sân',
          as: 'textarea',
          span: 'full',
          placeholder: 'Ví dụ: có 2 sân 7, bãi xe, nhà thay đồ, đèn LED...',
        },
        {
          label: 'Danh sách sân con',
          as: 'textarea',
          span: 'full',
          defaultValue: 'Sân 7A - 650000 - Trống 20:30\nSân 7B - 620000 - Kín khung vàng',
        },
      ]}
      asideTitle="Checklist cho module sân"
      asideItems={[
        'Giá nên tách riêng theo từng sân con nếu có khác biệt.',
        'Cần map owner với user role StadiumOwner khi backend sẵn sàng.',
        'Availability nên tính động từ booking và recurring booking.',
      ]}
    />
  );
}

export default CreateStadiumAdmin;
