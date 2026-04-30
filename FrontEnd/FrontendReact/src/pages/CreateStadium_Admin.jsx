import React from 'react';

const CreateStadiumAdminjsx = () => {
    return (
        <>
            {/* model */} FindFootballOppsite.Models.Stadium
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Thêm Sân bóng";
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
 */}

<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg,#d97706,#dc2626)' }}>
  <h2><i className="ti ti-map-pin-plus"></i> Thêm Sân Bóng Mới</h2>
  <p>Đăng ký cụm sân bóng mới vào hệ thống.</p>
</div>

<a href="{/* Url.Action( */}"Stadiums", "Admin")" className="ff-btn ff-btn-outline mb-3 ff-animate-in"><i className="ti ti-arrow-left"></i> Quay lại danh sách</a>

<div className="ff-form-card ff-animate-in">
  <div className="ff-card-header"><h5><i className="ti ti-map-pin-plus"></i> Thông tin sân bóng</h5></div>
  <div className="ff-card-body">
    <form asp-action="CreateStadium" method="post">
      <div className="ff-form-group">
        <label asp-htmlFor="StadiumName">Tên Sân bóng <span style={{ color: 'var(--ff-danger)' }}>*</span></label>
        <input asp-htmlFor="StadiumName" placeholder="VD: Cụm Sân Chuyên Việt" required />
        <span asp-validation-htmlFor="StadiumName" style={{ fontSize: '0.78rem', color: 'var(--ff-danger)' }}></span>
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="OwnerId">ID Chủ sân</label>
        <input asp-htmlFor="OwnerId" type="number" placeholder="ID người dùng làm chủ sân" />
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="Address">Địa chỉ <span style={{ color: 'var(--ff-danger)' }}>*</span></label>
        <input asp-htmlFor="Address" placeholder="VD: Cầu Giấy, Hà Nội" required />
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="Description">Mô tả</label>
        <textarea asp-htmlFor="Description" rows="3" placeholder="Thông tin chi tiết về cụm sân..."></textarea>
      </div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <button type="submit" className="ff-btn ff-btn-warning ff-btn-lg"><i className="ti ti-check"></i> Lưu sân bóng</button>
        <a href="{/* Url.Action( */}"Stadiums", "Admin")" className="ff-btn ff-btn-outline ff-btn-lg">Hủy</a>
      </div>
    </form>
  </div>
</div>

        </>
    );
};

export default CreateStadiumAdminjsx;
