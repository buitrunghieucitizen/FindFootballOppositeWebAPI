import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  PageSection,
  PublicLayout,
  SurfaceCard,
  formatCurrency,
} from '../components/portal-ui';
import { publicService } from '../services/publicService';

function StadiumsGuest() {
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
      <PublicLayout title="Đang tải dữ liệu..." subtitle="Đang kết nối tới Backend...">
        <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
      </PublicLayout>
    );
  }

  if (!data) return null;

  const recurringBookings = data.recurringBookings || [];
  const upcomingSchedules = data.upcomingSchedules || [];

  // Flatten pitches from stadiums for the 'pitchCatalog' equivalent
  const pitchCatalog = [];
  if (data.stadiums) {
    data.stadiums.forEach(stadium => {
      if (stadium.pitches) {
        stadium.pitches.forEach(pitch => {
          pitchCatalog.push({
            ...pitch,
            stadiumName: stadium.stadiumName,
            address: stadium.address,
            ownerName: stadium.ownerName,
            utilizationLabel: stadium.utilizationLabel
          });
        });
      }
    });
  }

  return (
    <PublicLayout
      title="Sân bóng, sân con và lịch đặt theo tuần"
      subtitle="Dữ liệu này đang được tải trực tiếp từ Backend (C# ASP.NET Core) thông qua API."
      actions={
        <>
          <Link className="portal-button" to="/stadium-owner">
            Mở dashboard chủ sân
          </Link>
          <Link className="portal-button ghost" to="/matches">
            Xem kèo đã chốt sân
          </Link>
        </>
      }
    >
      <PageSection
        eyebrow="Kho sân"
        title="Danh sách sân đang khai thác"
        subtitle="Lấy từ danh sách Stadiums và Pitches của API."
      >
        <div className="card-grid">
          {pitchCatalog.map((pitch) => (
            <SurfaceCard
              key={pitch.pitchId}
              title={pitch.pitchName}
              subtitle={`${pitch.stadiumName} · ${pitch.address}`}
              aside={<Badge tone="teal">{pitch.availabilityLabel}</Badge>}
            >
              <ul className="meta-list">
                <li>Sân {pitch.pitchSize} người.</li>
                <li>Giá giờ: {formatCurrency(pitch.pricePerHour)}.</li>
                <li>Công suất cụm: {pitch.utilizationLabel}.</li>
                <li>Phụ trách: {pitch.ownerName}.</li>
              </ul>
            </SurfaceCard>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Lịch cố định"
        title="Hợp đồng đặt sân hàng tuần"
        subtitle="Chủ sân và đội trưởng có thể nhìn nhanh các slot lặp theo tuần."
      >
        <div className="detail-grid">
          <SurfaceCard title="Booking cố định" subtitle="Các đội đã chốt theo chu kỳ">
            <ul className="plain-list">
              {recurringBookings.map((booking, idx) => (
                <li key={idx}>
                  <strong>{booking.teamName}</strong> · {booking.pitchName} · {booking.weeklySlot} ·{' '}
                  {booking.dateRange}
                </li>
              ))}
            </ul>
          </SurfaceCard>
          <SurfaceCard title="Lịch ngắn hạn" subtitle="Những slot gần ngày thi đấu">
            <ul className="plain-list">
              {upcomingSchedules.map((schedule, idx) => (
                <li key={idx}>
                  <strong>{schedule.pitchName}</strong> · {schedule.windowLabel} · {schedule.bookedByName} ·{' '}
                  {schedule.status}
                </li>
              ))}
            </ul>
          </SurfaceCard>
        </div>
      </PageSection>
    </PublicLayout>
  );
}

export default StadiumsGuest;
