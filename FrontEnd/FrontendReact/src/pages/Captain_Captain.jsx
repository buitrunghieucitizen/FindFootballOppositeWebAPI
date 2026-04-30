import React from 'react';

const CaptainCaptainjsx = () => {
    return (
        <>
            {/* model */} PortalHubViewModel
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Trang Đội Trưởng";
    Layout = "_AdminLayout";
 */}

{/*  Hero Header  */}
<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)' }}>
  <h2><i className="ti ti-flag-3"></i> Bảng Điều Khiển Đội Trưởng</h2>
  <p>Quản lý đội hình, gạ đối, tuyển quân và theo dõi lịch thi đấu của đội bạn.</p>
  <span className="ff-hero-badge"><i className="ti ti-trophy"></i> Mùa giải 2026</span>
</div>

{/*  Stat Cards  */}
<div className="row g-3 mb-4">
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-success-soft"><i className="ti ti-shield"></i></div>
      <div className="ff-stat-value">{/* Model.Teams.Count */}</div>
      <div className="ff-stat-label">Đội Bóng Của Bạn</div>
    </div>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-primary-soft"><i className="ti ti-calendar-event"></i></div>
      <div className="ff-stat-value">{/* Model.Matches.Count */}</div>
      <div className="ff-stat-label">Kèo Đấu</div>
    </div>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-warning-soft"><i className="ti ti-speakerphone"></i></div>
      <div className="ff-stat-value">{/* Model.RecruitmentAds.Count */}</div>
      <div className="ff-stat-label">Tin Tuyển Quân</div>
    </div>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-purple-soft"><i className="ti ti-user-search"></i></div>
      <div className="ff-stat-value">{/* Model.Metrics.FreeAgentCount */}</div>
      <div className="ff-stat-label">Cầu Thủ Tự Do</div>
    </div>
  </div>
</div>

{/*  Main Content  */}
<div className="row g-3 mb-4">
  {/*  Team Management  */}
  <div className="col-xl-6 ff-animate-in">
    <div className="ff-card">
      <div className="ff-card-header">
        <h5><i className="ti ti-shield-check"></i> Đội Bóng Của Bạn</h5>
      </div>
      <div className="ff-card-body">
        {/* foreach */} (var team in Model.Teams.Where(t => t.CaptainName != null))
        {
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', borderRadius: 'var(--ff-radius-sm)', padding: '20px', marginBottom: '14px', border: '1px solid #d1fae5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'linear-gradient(135deg,#059669,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem' }}>
                <i className="ti ti-shield"></i>
              </div>
              <div>
                <h4 style={{ margin: '0', fontWeight: '700', color: 'var(--ff-text)', fontSize: '1.15rem' }}>{/* team.TeamName */}</h4>
                <span style={{ fontSize: '0.82rem', color: 'var(--ff-text-muted)' }}>Khu vực: {/* team.HomeArea */}</span>
              </div>
              {/* IF: team.LookingForOpponent */}
{
                <span className="ff-badge ff-badge-success ff-badge-pill ms-auto"><i className="ti ti-search"></i> Đang tìm đối</span>
              }
            </div>
            <div className="row g-2">
              <div className="col-4">
                <div style={{ textAlign: 'center', padding: '10px', background: '#fff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ff-text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Trình độ</div>
                  <div style={{ fontWeight: '700', color: 'var(--ff-text)', fontSize: '0.95rem' }}>{/* team.QualityLevel */}</div>
                </div>
              </div>
              <div className="col-4">
                <div style={{ textAlign: 'center', padding: '10px', background: '#fff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ff-text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Thành viên</div>
                  <div style={{ fontWeight: '700', color: 'var(--ff-text)', fontSize: '0.95rem' }}>{/* team.Members.Count */}</div>
                </div>
              </div>
              <div className="col-4">
                <div style={{ textAlign: 'center', padding: '10px', background: '#fff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ff-text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Phong độ</div>
                  <div style={{ fontWeight: '700', color: 'var(--ff-success)', fontSize: '0.85rem' }}>{/* team.RecentForm.Split( */}':').Last().Trim()</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--ff-text-muted)', fontWeight: '500' }}>Thành viên:</span>
              {/* FOREACH: var member in team.Members */}
{
                <span className="ff-badge ff-badge-primary me-1 mt-1">{/* member */}</span>
              }
            </div>
          </div>
        }
      </div>
    </div>
  </div>

  {/*  Match Management  */}
  <div className="col-xl-6 ff-animate-in">
    <div className="ff-card">
      <div className="ff-card-header">
        <h5><i className="ti ti-swords"></i> Kèo Đấu (Gạ Đối)</h5>
        <span className="ff-badge ff-badge-primary ff-badge-pill">{/* Model.Matches.Count */} trận</span>
      </div>
      <div className="ff-card-body">
        {/* FOREACH: var match in Model.Matches */}
{
          <div className="ff-match-card">
            <div className="ff-match-vs">
              <div className="ff-match-team">
                <div className="team-avatar" style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
                  {/* match.HomeTeamName.Substring(0 */}, 2)
                </div>
                <div className="team-name">{/* match.HomeTeamName */}</div>
              </div>
              <div className="ff-match-divider">VS</div>
              <div className="ff-match-team">
                <div className="team-avatar" style={{ background: 'linear-gradient(135deg,#dc2626,#f59e0b)' }}>
                  {/* (match.AwayTeamName.Length */} >= 2 ? match.AwayTeamName.Substring(0, 2) : match.AwayTeamName)
                </div>
                <div className="team-name">{/* match.AwayTeamName */}</div>
              </div>
            </div>
            <div className="ff-match-info">
              <span className="ff-badge {/* (match.MatchStatus */} == "Đã chấp nhận" ? "ff-badge-success" : "ff-badge-warning") ff-badge-pill">{/* match.MatchStatus */}</span>
              <span><i className="ti ti-clock"></i> {/* match.KickoffLabel */}</span>
              <span><i className="ti ti-map-pin"></i> {/* match.VenueLabel */}</span>
            </div>
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--ff-border)', fontSize: '0.82rem', color: 'var(--ff-text-muted)' }}>
              <i className="ti ti-users" style={{ color: 'var(--ff-success)' }}></i> {/* match.AttendanceSummary */}
            </div>
          </div>
        }
      </div>
    </div>
  </div>
</div>

{/*  Bottom Row  */}
<div className="row g-3 mb-4">
  {/*  Recruitment  */}
  <div className="col-xl-6 ff-animate-in">
    <div className="ff-card">
      <div className="ff-card-header">
        <h5><i className="ti ti-speakerphone"></i> Tuyển Quân & Đá Bù</h5>
      </div>
      <div className="ff-card-body">
        {/* FOREACH: var ad in Model.RecruitmentAds */}
{
          <div className="ff-list-item">
            <div className="ff-list-icon" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))', color: 'var(--ff-warning)' }}>
              <i className="ti ti-speakerphone"></i>
            </div>
            <div className="ff-list-content">
              <h6>{/* ad.Title */}</h6>
              <p>{/* ad.Content */}</p>
              <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="ff-badge ff-badge-purple">{/* ad.PositionNeeded */}</span>
                <span className="ff-badge ff-badge-danger">{/* ad.UrgencyLabel */}</span>
                <span className="ff-badge ff-badge-info">{/* ad.MatchLabel */}</span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  </div>

  {/*  Schedule  */}
  <div className="col-xl-6 ff-animate-in">
    <div className="ff-card">
      <div className="ff-card-header">
        <h5><i className="ti ti-calendar"></i> Lịch Sân</h5>
      </div>
      <div className="ff-card-body">
        <h6 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', marginBottom: '12px' }}>Đặt lẻ sắp tới</h6>
        {/* foreach */} (var schedule in Model.UpcomingSchedules.Where(s => s.BookedByName.Contains("FC")))
        {
          <div className="ff-list-item">
            <div className="ff-list-icon" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(37,99,235,0.1))', color: 'var(--ff-info)' }}>
              <i className="ti ti-calendar-time"></i>
            </div>
            <div className="ff-list-content">
              <h6>{/* schedule.PitchName */} — {/* schedule.WindowLabel */}</h6>
              <p>{/* schedule.BookedByName */}</p>
            </div>
            <span className="ff-badge ff-badge-info ff-badge-pill">{/* schedule.Status */}</span>
          </div>
        }

        <h6 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', margin: '18px 0 12px' }}>Lịch cố định hàng tuần</h6>
        {/* FOREACH: var booking in Model.RecurringBookings */}
{
          <div className="ff-list-item">
            <div className="ff-list-icon" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))', color: 'var(--ff-success)' }}>
              <i className="ti ti-repeat"></i>
            </div>
            <div className="ff-list-content">
              <h6>{/* booking.PitchName */} — {/* booking.WeeklySlot */}</h6>
              <p>Đội: {/* booking.TeamName */} · {/* booking.DateRange */}</p>
            </div>
            <span className="ff-badge {/* (booking.IsApproved */} ? "ff-badge-success" : "ff-badge-warning") ff-badge-pill">{/* (booking.IsApproved */} ? "Đã duyệt" : "Chờ duyệt")</span>
          </div>
        }
      </div>
    </div>
  </div>
</div>

        </>
    );
};

export default CaptainCaptainjsx;
