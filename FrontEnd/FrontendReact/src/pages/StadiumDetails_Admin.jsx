import React from 'react';

const StadiumDetailsAdminjsx = () => {
    return (
        <>
            {/* model */} FindFootballOppsite.Models.Stadium
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Chi tiết Sân bóng";
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
 */}

<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg,#d97706,#dc2626)' }}>
  <h2><i className="ti ti-building-stadium"></i> {/* Model.StadiumName */}</h2>
  <p>Chi tiết cụm sân bóng #{/* Model.StadiumId */}</p>
</div>

<a href="{/* Url.Action( */}"Stadiums", "Admin")" className="ff-btn ff-btn-outline mb-3"><i className="ti ti-arrow-left"></i> Quay lại</a>

<div className="ff-card ff-animate-in" style={{ height: 'auto', maxWidth: '700px' }}>
  <div className="ff-card-header"><h5><i className="ti ti-info-circle"></i> Thông tin chi tiết</h5></div>
  <div className="ff-card-body">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', marginBottom: '4px' }}>Tên sân</div>
        <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{/* Model.StadiumName */}</div>
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', marginBottom: '4px' }}>ID</div>
        <div><span className="ff-badge ff-badge-warning">#{/* Model.StadiumId */}</span></div>
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', marginBottom: '4px' }}>Chủ sân</div>
        <div style={{ fontWeight: '600' }}>{/* (Model.Owner */}?.FullName ?? (Model.OwnerId.HasValue ? $"ID: {Model.OwnerId}" : "—"))</div>
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', marginBottom: '4px' }}>Ngày tạo</div>
        <div>{/* (Model.CreatedAt */}?.ToString("dd/MM/yyyy HH:mm") ?? "—")</div>
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', marginBottom: '4px' }}>Địa chỉ</div>
        <div><i className="ti ti-map-pin" style={{ color: 'var(--ff-warning)' }}></i> {/* Model.Address */}</div>
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', marginBottom: '4px' }}>Mô tả</div>
        <div style={{ color: 'var(--ff-text-muted)', fontSize: '0.88rem' }}>{/* (Model.Description */} ?? "Chưa có mô tả")</div>
      </div>
    </div>

    {/* if */} (Model.Pitches != null && Model.Pitches.Any())
    {
      <h6 style={{ marginTop: '24px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ff-text-muted)', marginBottom: '12px' }}>Sân con ({/* Model.Pitches.Count) */}</h6>
      <div className="row g-3">
        {/* FOREACH: var pitch in Model.Pitches */}
{
          <div className="col-md-4">
            <div className="ff-pitch-card">
              <div className="pitch-icon"><i className="ti ti-soccer-field"></i></div>
              <div className="pitch-name">{/* pitch.PitchName */}</div>
              <div className="pitch-type">Sân {/* pitch.PitchSize */} người</div>
              <div className="pitch-price">{/* pitch.PricePerHour.ToString( */}"N0") VNĐ/giờ</div>
            </div>
          </div>
        }
      </div>
    }

    <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
      <a href="{/* Url.Action( */}"EditStadium", "Admin", new { id = Model.StadiumId })" className="ff-btn ff-btn-warning"><i className="ti ti-edit"></i> Sửa</a>
      <a href="{/* Url.Action( */}"Stadiums", "Admin")" className="ff-btn ff-btn-outline">Quay lại danh sách</a>
    </div>
  </div>
</div>

        </>
    );
};

export default StadiumDetailsAdminjsx;
