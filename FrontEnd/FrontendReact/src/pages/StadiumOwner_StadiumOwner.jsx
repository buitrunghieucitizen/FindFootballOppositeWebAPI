import React from 'react';

const StadiumOwnerStadiumOwnerjsx = () => {
    return (
        <>
            {/* model */} PortalHubViewModel
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Trang Chủ Sân";
    Layout = "_AdminLayout";
 */}

{/*  Hero Header  */}
<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)' }}>
  <h2><i className="ti ti-building-stadium"></i> Bảng Điều Khiển Chủ Sân</h2>
  <p>Quản lý cụm sân, theo dõi lịch đặt, duyệt booking và giám sát công suất khai thác.</p>
  <span className="ff-hero-badge"><i className="ti ti-chart-bar"></i> Báo cáo vận hành</span>
</div>

{/*  Stat Cards  */}
<div className="row g-3 mb-4">
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-warning-soft"><i className="ti ti-building"></i></div>
      <div className="ff-stat-value">{/* Model.Metrics.StadiumCount */}</div>
      <div className="ff-stat-label">Cụm Sân</div>
    </div>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-success-soft"><i className="ti ti-soccer-field"></i></div>
      <div className="ff-stat-value">{/* Model.Metrics.PitchCount */}</div>
      <div className="ff-stat-label">Tổng Sân Con</div>
    </div>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-primary-soft"><i className="ti ti-calendar-check"></i></div>
      <div className="ff-stat-value">{/* Model.UpcomingSchedules.Count */}</div>
      <div className="ff-stat-label">Lịch Sắp Tới</div>
    </div>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-info-soft"><i className="ti ti-repeat"></i></div>
      <div className="ff-stat-value">{/* Model.RecurringBookings.Count */}</div>
      <div className="ff-stat-label">Hợp Đồng Cố Định</div>
    </div>
  </div>
</div>

{/*  Stadium Details  */}
{/* FOREACH: var stadium in Model.Stadiums */}
{
<div className="row g-3 mb-4 ff-animate-in">
  <div className="col-12">
    <div className="ff-card">
      <div className="ff-card-header">
        <h5><i className="ti ti-building-stadium"></i> {/* stadium.StadiumName */}</h5>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="ff-badge ff-badge-success ff-badge-pill"><span className="ff-live-dot" style={{ width: '6px', height: '6px', marginRight: '4px' }}></span> Đang hoạt động</span>
        </div>
      </div>
      <div className="ff-card-body">
        {/*  Stadium Info Bar  */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', marginBottom: '24px', padding: '16px 20px', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: 'var(--ff-radius-sm)', border: '1px solid #fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="ti ti-map-pin" style={{ fontSize: '1.2rem', color: 'var(--ff-warning-dark)' }}></i>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ff-text-muted)', textTransform: 'uppercase' }}>Địa chỉ</div>
              <div style={{ fontWeight: '600', color: 'var(--ff-text)', fontSize: '0.9rem' }}>{/* stadium.Address */}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="ti ti-user" style={{ fontSize: '1.2rem', color: 'var(--ff-warning-dark)' }}></i>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ff-text-muted)', textTransform: 'uppercase' }}>Chủ sân</div>
              <div style={{ fontWeight: '600', color: 'var(--ff-text)', fontSize: '0.9rem' }}>{/* stadium.OwnerName */}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="ti ti-chart-pie" style={{ fontSize: '1.2rem', color: 'var(--ff-warning-dark)' }}></i>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ff-text-muted)', textTransform: 'uppercase' }}>Công suất</div>
              <div style={{ fontWeight: '600', color: 'var(--ff-success-dark)', fontSize: '0.9rem' }}>{/* stadium.UtilizationLabel */}</div>
            </div>
          </div>
        </div>

        {/*  Pitch Grid  */}
        <h6 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', marginBottom: '14px' }}>Danh Sách Sân Con</h6>
        <div className="row g-3">
          {/* FOREACH: var pitch in stadium.Pitches */}
{
            <div className="col-md-4">
              <div className="ff-pitch-card">
                <div className="pitch-icon">
                  <i className="ti ti-soccer-field"></i>
                </div>
                <div className="pitch-name">{/* pitch.PitchName */}</div>
                <div className="pitch-type">Sân {/* pitch.PitchSize */} người</div>
                <div className="pitch-price">{/* pitch.PricePerHour.ToString( */}"N0") VNĐ/giờ</div>
                <div style={{ marginTop: '10px' }}>
                  <span className="ff-badge ff-badge-info ff-badge-pill">{/* pitch.AvailabilityLabel */}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  </div>
</div>
}

{/*  Bookings Row  */}
<div className="row g-3 mb-4">
  {/*  Individual Bookings  */}
  <div className="col-xl-6 ff-animate-in">
    <div className="ff-card">
      <div className="ff-card-header">
        <h5><i className="ti ti-calendar-time"></i> Lịch Đặt Lẻ</h5>
        <span className="ff-badge ff-badge-primary ff-badge-pill">{/* Model.UpcomingSchedules.Count */} lịch</span>
      </div>
      <div className="ff-card-body">
        {/* FOREACH: var schedule in Model.UpcomingSchedules */}
{
          <div className="ff-list-item">
            <div className="ff-list-icon" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(139,92,246,0.1))', color: 'var(--ff-primary)' }}>
              <i className="ti ti-calendar-event"></i>
            </div>
            <div className="ff-list-content">
              <h6>{/* schedule.PitchName */}</h6>
              <p><i className="ti ti-clock" style={{ fontSize: '0.82rem' }}></i> {/* schedule.WindowLabel */}</p>
              <p>Người đặt: <strong>{/* schedule.BookedByName */}</strong> · {/* schedule.TypeLabel */}</p>
            </div>
            <span className="ff-badge {/* (schedule.Status */} == "Đã xác nhận" ? "ff-badge-success" : "ff-badge-warning") ff-badge-pill">{/* schedule.Status */}</span>
          </div>
        }
      </div>
    </div>
  </div>

  {/*  Recurring Bookings  */}
  <div className="col-xl-6 ff-animate-in">
    <div className="ff-card">
      <div className="ff-card-header">
        <h5><i className="ti ti-repeat"></i> Hợp Đồng Cố Định Hàng Tuần</h5>
        <span className="ff-badge ff-badge-success ff-badge-pill">{/* Model.RecurringBookings.Count */} hợp đồng</span>
      </div>
      <div className="ff-card-body">
        {/* FOREACH: var booking in Model.RecurringBookings */}
{
          <div className="ff-list-item">
            <div className="ff-list-icon" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))', color: 'var(--ff-success)' }}>
              <i className="ti ti-repeat"></i>
            </div>
            <div className="ff-list-content">
              <h6>{/* booking.PitchName */} — {/* booking.WeeklySlot */}</h6>
              <p>Đội: <strong>{/* booking.TeamName */}</strong></p>
              <p>Thời hạn: {/* booking.DateRange */}</p>
            </div>
            <span className="ff-badge {/* (booking.IsApproved */} ? "ff-badge-success" : "ff-badge-warning") ff-badge-pill">{/* (booking.IsApproved */} ? "✓ Đã duyệt" : "⏳ Chờ duyệt")</span>
          </div>
        }
      </div>
    </div>
  </div>
</div>

        </>
    );
};

export default StadiumOwnerStadiumOwnerjsx;
