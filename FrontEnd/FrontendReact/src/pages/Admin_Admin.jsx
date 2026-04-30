import React from 'react';

const AdminAdminjsx = () => {
    return (
        <>
            {/* model */} PortalHubViewModel
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Trang Quản Trị Viên";
    Layout = "_AdminLayout";
 */}

{/*  Hero Header  */}
<div className="ff-dashboard-hero ff-animate-in">
  <h2><i className="ti ti-shield-check"></i> Trung Tâm Điều Hành Hệ Thống</h2>
  <p>Giám sát toàn bộ hoạt động của nền tảng FindFootball — người dùng, đội bóng, sân bóng và nội dung.</p>
  <span className="ff-hero-badge"><span className="ff-live-dot"></span> Hệ thống đang hoạt động</span>
</div>

{/*  Stat Cards Row  */}
<div className="row g-3 mb-4">
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-primary-soft"><i className="ti ti-users"></i></div>
      <div className="ff-stat-value">{/* Model.Metrics.PlayerCount */}</div>
      <div className="ff-stat-label">Tổng Người Dùng</div>
      <span className="ff-stat-trend up"><i className="ti ti-trending-up"></i> +2 tuần này</span>
    </div>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-success-soft"><i className="ti ti-shield"></i></div>
      <div className="ff-stat-value">{/* Model.Metrics.TeamCount */}</div>
      <div className="ff-stat-label">Đội Bóng</div>
      <span className="ff-stat-trend up"><i className="ti ti-trending-up"></i> Đang hoạt động</span>
    </div>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-warning-soft"><i className="ti ti-map-pin"></i></div>
      <div className="ff-stat-value">{/* Model.Metrics.StadiumCount */}</div>
      <div className="ff-stat-label">Cụm Sân Bóng</div>
      <span className="ff-stat-trend up"><i className="ti ti-trending-up"></i> {/* Model.Metrics.PitchCount */} sân con</span>
    </div>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <div className="ff-stat-card">
      <div className="ff-stat-icon bg-info-soft"><i className="ti ti-calendar-event"></i></div>
      <div className="ff-stat-value">{/* Model.Metrics.UpcomingMatchCount */}</div>
      <div className="ff-stat-label">Trận Sắp Diễn Ra</div>
      <span className="ff-stat-trend up"><i className="ti ti-trending-up"></i> {/* Model.Metrics.ActiveRecruitmentCount */} tin tuyển</span>
    </div>
  </div>
</div>

{/*  Quick Actions  */}
<div className="row g-3 mb-4">
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <a href="{/* Url.Action( */}"Users", "Admin")" className="ff-quick-action">
      <div className="ff-qa-icon bg-primary-soft"><i className="ti ti-users"></i></div>
      <div className="ff-qa-text">
        <h6>Quản lý Người Dùng</h6>
        <p>Phân quyền & quản lý tài khoản</p>
      </div>
      <i className="ti ti-chevron-right ff-qa-arrow"></i>
    </a>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <a href="{/* Url.Action( */}"Teams", "Admin")" className="ff-quick-action">
      <div className="ff-qa-icon bg-success-soft"><i className="ti ti-shield"></i></div>
      <div className="ff-qa-text">
        <h6>Quản lý Đội Bóng</h6>
        <p>Giám sát đội & thành viên</p>
      </div>
      <i className="ti ti-chevron-right ff-qa-arrow"></i>
    </a>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <a href="{/* Url.Action( */}"Stadiums", "Admin")" className="ff-quick-action">
      <div className="ff-qa-icon bg-warning-soft"><i className="ti ti-map-pin"></i></div>
      <div className="ff-qa-text">
        <h6>Quản lý Sân Bóng</h6>
        <p>Cụm sân & báo giá</p>
      </div>
      <i className="ti ti-chevron-right ff-qa-arrow"></i>
    </a>
  </div>
  <div className="col-md-6 col-xl-3 ff-animate-in">
    <a href="{/* Url.Action( */}"Matches", "Admin")" className="ff-quick-action">
      <div className="ff-qa-icon bg-info-soft"><i className="ti ti-calendar-event"></i></div>
      <div className="ff-qa-text">
        <h6>Quản lý Trận Đấu</h6>
        <p>Kèo đấu & lịch thi đấu</p>
      </div>
      <i className="ti ti-chevron-right ff-qa-arrow"></i>
    </a>
  </div>
</div>

{/*  Main Content Row  */}
<div className="row g-3 mb-4">
  {/*  User Table  */}
  <div className="col-xl-7 ff-animate-in">
    <div className="ff-card">
      <div className="ff-card-header">
        <h5><i className="ti ti-users"></i> Tài Khoản & Phân Quyền</h5>
        <span className="ff-badge ff-badge-primary ff-badge-pill">{/* Model.Players.Count */} người</span>
      </div>
      <div className="ff-card-body" style={{ padding: '0' }}>
        <div className="table-responsive">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Username</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {/* FOREACH: var player in Model.Players */}
{
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.78rem' }}>
                        {/* player.FullName.Substring(0 */}, 1)
                      </div>
                      <span style={{ fontWeight: '600' }}>{/* player.FullName */}</span>
                    </div>
                  </td>
                  <td><code style={{ fontSize: '0.82rem' }}>{/* player.Username */}</code></td>
                  <td>
                    {/* FOREACH: var r in player.Roles */}
{
                      <span className="ff-badge ff-badge-{/* (r */} == "Admin" ? "danger" : r == "Captain" ? "purple" : r == "StadiumOwner" ? "warning" : "primary") me-1">{/* r */}</span>
                    }
                  </td>
                  <td><span className="ff-badge ff-badge-success ff-badge-pill"><span className="ff-live-dot" style={{ width: '6px', height: '6px', marginRight: '4px' }}></span> Online</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  {/*  Teams & Stadiums  */}
  <div className="col-xl-5 ff-animate-in">
    <div className="ff-card">
      <div className="ff-card-header">
        <h5><i className="ti ti-shield"></i> Đội Bóng & Sân Bóng</h5>
      </div>
      <div className="ff-card-body">
        <h6 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', marginBottom: '12px' }}>Đội Bóng</h6>
        {/* FOREACH: var team in Model.Teams */}
{
          <div className="ff-list-item">
            <div className="ff-list-icon" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))', color: 'var(--ff-success)' }}>
              <i className="ti ti-shield-check"></i>
            </div>
            <div className="ff-list-content">
              <h6>{/* team.TeamName */}</h6>
              <p>Đội trưởng: {/* team.CaptainName */} · {/* team.QualityLevel */} · {/* team.Members.Count */} thành viên</p>
            </div>
            <span className="ff-badge ff-badge-success ff-badge-pill">{/* (team.LookingForOpponent */} ? "Đang tìm kèo" : "Đang ổn")</span>
          </div>
        }

        <h6 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', marginBottom: '12px', marginTop: '20px' }}>Sân Bóng</h6>
        {/* FOREACH: var stadium in Model.Stadiums */}
{
          <div className="ff-list-item">
            <div className="ff-list-icon" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))', color: 'var(--ff-warning)' }}>
              <i className="ti ti-map-pin"></i>
            </div>
            <div className="ff-list-content">
              <h6>{/* stadium.StadiumName */}</h6>
              <p>Chủ sân: {/* stadium.OwnerName */} · {/* stadium.Address */}</p>
              <div className="ff-progress-bar" style={{ width: '70%' }}>
                <div className="ff-progress-fill fill-success" style={{ width: '78%' }}></div>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--ff-text-muted)' }}>{/* stadium.UtilizationLabel */}</span>
            </div>
          </div>
        }
      </div>
    </div>
  </div>
</div>

{/*  Notifications & Moderation Row  */}
<div className="row g-3 mb-4">
  <div className="col-xl-6 ff-animate-in">
    <div className="ff-card">
      <div className="ff-card-header">
        <h5><i className="ti ti-bell-ringing"></i> Thông Báo Hệ Thống</h5>
        <span className="ff-badge ff-badge-danger ff-badge-pill">{/* Model.Notifications.Count */} mới</span>
      </div>
      <div className="ff-card-body">
        {/* FOREACH: var notif in Model.Notifications */}
{
          <div className="ff-list-item">
            <div className="ff-list-icon" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(139,92,246,0.1))', color: 'var(--ff-primary)' }}>
              <i className="ti ti-bell"></i>
            </div>
            <div className="ff-list-content">
              <h6>{/* notif.Title */}</h6>
              <p>Gửi tới: <strong>{/* notif.RecipientName */}</strong> — {/* notif.Message */}</p>
            </div>
          </div>
        }
      </div>
    </div>
  </div>

  <div className="col-xl-6 ff-animate-in">
    <div className="ff-card">
      <div className="ff-card-header">
        <h5><i className="ti ti-speakerphone"></i> Kiểm Duyệt Tuyển Quân</h5>
        <span className="ff-badge ff-badge-warning ff-badge-pill">{/* Model.RecruitmentAds.Count */} bài đăng</span>
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
              <p>Đội: <strong>{/* ad.TeamName */}</strong> · Vị trí: {/* ad.PositionNeeded */}</p>
              <span className="ff-badge ff-badge-danger mt-1">{/* ad.UrgencyLabel */}</span>
            </div>
          </div>
        }
      </div>
    </div>
  </div>
</div>

        </>
    );
};

export default AdminAdminjsx;
