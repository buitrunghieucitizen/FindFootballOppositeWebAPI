import { Link } from 'react-router-dom';
import {
  AdminLayout,
  Badge,
  SurfaceCard,
  formatCurrency,
  toneFromStatus,
} from '../components/portal-ui';
import {
  recurringBookings,
  sampleSelections,
  upcomingSchedules,
} from '../data/portalMockData';

function StadiumDetailsAdmin() {
  const stadium = sampleSelections.primaryStadium;

  return (
    <AdminLayout
      title={`Chi tiết ${stadium.name}`}
      subtitle="Màn chi tiết này thay cho view Razor cũ bằng card và list React dễ đọc hơn."
      actions={
        <>
          <Link className="portal-button" to={`/admin/stadiums/${stadium.id}/edit`}>
            Sửa cụm sân
          </Link>
          <Link className="portal-button ghost" to="/admin/stadiums">
            Quay lại danh sách
          </Link>
        </>
      }
    >
      <div className="detail-grid">
        <SurfaceCard title="Thông tin cụm sân" subtitle={stadium.description}>
          <ul className="meta-list">
            <li>Chủ sân: {stadium.ownerName}.</li>
            <li>Địa chỉ: {stadium.address}.</li>
            <li>Công suất hiện tại: {stadium.utilizationLabel}.</li>
          </ul>
        </SurfaceCard>
        <SurfaceCard title="Sân con" subtitle="Giá và trạng thái hiện tại">
          <ul className="plain-list">
            {stadium.pitches.map((pitch) => (
              <li key={pitch.id}>
                <div className="row-inline">
                  <strong>{pitch.name}</strong>
                  <Badge tone="amber">Sân {pitch.size}</Badge>
                </div>
                <p className="muted">
                  {formatCurrency(pitch.pricePerHour)} · {pitch.availabilityLabel}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>

      <div className="detail-grid">
        <SurfaceCard title="Booking ngắn hạn" subtitle="Những slot gần ngày diễn ra">
          <ul className="plain-list">
            {upcomingSchedules.map((schedule) => (
              <li key={schedule.id}>
                <div className="row-inline">
                  <strong>{schedule.pitchName}</strong>
                  <Badge tone={toneFromStatus(schedule.status)}>{schedule.status}</Badge>
                </div>
                <p className="muted">
                  {schedule.windowLabel} · {schedule.bookedByName} · {schedule.typeLabel}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
        <SurfaceCard title="Hợp đồng cố định" subtitle="Các booking lặp theo tuần">
          <ul className="plain-list">
            {recurringBookings.map((booking) => (
              <li key={booking.id}>
                <div className="row-inline">
                  <strong>{booking.teamName}</strong>
                  <Badge tone={booking.isApproved ? 'teal' : 'amber'}>
                    {booking.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                  </Badge>
                </div>
                <p className="muted">
                  {booking.pitchName} · {booking.weeklySlot} · {booking.dateRange}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>
    </AdminLayout>
  );
}

export default StadiumDetailsAdmin;
