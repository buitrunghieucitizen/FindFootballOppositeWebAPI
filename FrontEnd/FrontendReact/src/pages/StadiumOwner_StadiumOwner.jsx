import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AdminLayout,
  Badge,
  MetricGrid,
  SurfaceCard,
  formatCurrency,
  toneFromStatus,
} from '../components/portal-ui';
import { publicService } from '../services/publicService';
import { useAuth } from '../contexts/AuthContext';
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiDollarSign,
} from 'react-icons/fi';

function StadiumOwnerStadiumOwner() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await publicService.getPortalData();
        if (result) {
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Đang tải dữ liệu..." subtitle="Đang kết nối tới Backend..." user={user}>
        <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const stadiums = data.stadiums || [];
  const upcomingSchedules = data.upcomingSchedules || [];
  const recurringBookings = data.recurringBookings || [];

  // Map backend metrics
  const ownerMetrics = [
    { label: 'Doanh thu dự kiến', value: '12.5M', icon: FiDollarSign, trend: '+15% so với tuần trước', tone: 'teal' },
    { label: 'Tỉ lệ lấp đầy', value: '78%', icon: FiMapPin, trend: 'Tăng 5%', tone: 'amber' },
    { label: 'Booking chờ duyệt', value: recurringBookings.filter(b => !b.isApproved).length || 0, icon: FiClock, trend: 'Cần xử lý', tone: 'rose' },
    { label: 'Trận đấu hôm nay', value: upcomingSchedules.length || 0, icon: FiCalendar, trend: 'Lịch đã chốt', tone: 'navy' },
  ];

  return (
    <AdminLayout
      title="Bảng điều khiển chủ sân"
      subtitle="Dữ liệu này đang được tải trực tiếp từ ASP.NET Core Backend qua API."
      user={user}
      actions={
        <>
          <Link className="portal-button" to="/admin/stadiums">
            Mở quản trị sân
          </Link>
          <Link className="portal-button ghost" to="/stadiums">
            Xem landing sân
          </Link>
        </>
      }
    >
      <MetricGrid items={ownerMetrics} />

      <div className="card-grid">
        {stadiums.map((stadium) => (
          <SurfaceCard
            key={stadium.stadiumId}
            title={stadium.stadiumName}
            subtitle={`${stadium.address} · ${stadium.utilizationLabel}`}
            aside={<Badge tone="amber">{stadium.ownerName}</Badge>}
          >
            <ul className="plain-list">
              {stadium.pitches?.map((pitch) => (
                <li key={pitch.pitchId}>
                  <strong>{pitch.pitchName}</strong>
                  <p className="muted">
                    Sân {pitch.pitchSize} · {formatCurrency(pitch.pricePerHour)} · {pitch.availabilityLabel}
                  </p>
                </li>
              ))}
            </ul>
          </SurfaceCard>
        ))}
      </div>

      <div className="detail-grid">
        <SurfaceCard title="Lịch đặt sắp tới" subtitle="Các slot chủ sân cần theo dõi">
          <ul className="plain-list">
            {upcomingSchedules.map((schedule, idx) => (
              <li key={idx}>
                <div className="row-inline">
                  <strong>{schedule.pitchName}</strong>
                  <Badge tone={toneFromStatus(schedule.status)}>{schedule.status}</Badge>
                </div>
                <p className="muted">
                  {schedule.windowLabel} · {schedule.bookedByName}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
        <SurfaceCard title="Hợp đồng tuần" subtitle="Các booking lặp cần duy trì">
          <ul className="plain-list">
            {recurringBookings.map((booking, idx) => (
              <li key={idx}>
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

export default StadiumOwnerStadiumOwner;
