import React from 'react';

const EditStadiumAdminjsx = () => {
    return (
        <>
            {/* model */} FindFootballOppsite.Models.Stadium
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Sửa Sân bóng";
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
 */}

<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg,#d97706,#dc2626)' }}>
  <h2><i className="ti ti-map-pin-cog"></i> Sửa Sân Bóng #{/* Model.StadiumId */}</h2>
  <p>Cập nhật thông tin {/* Model.StadiumName */}</p>
</div>

<a href="{/* Url.Action( */}"Stadiums", "Admin")" className="ff-btn ff-btn-outline mb-3"><i className="ti ti-arrow-left"></i> Quay lại</a>

<div className="ff-form-card">
  <div className="ff-card-header"><h5><i className="ti ti-map-pin-cog"></i> Chỉnh sửa</h5></div>
  <div className="ff-card-body">
    <form asp-action="EditStadium" method="post">
      <input type="hidden" asp-htmlFor="StadiumId" />
      <input type="hidden" asp-htmlFor="CreatedAt" />
      <input type="hidden" asp-htmlFor="OwnerId" />
      <div className="ff-form-group"><label asp-htmlFor="StadiumName">Tên Sân</label><input asp-htmlFor="StadiumName" required /></div>
      <div className="ff-form-group"><label asp-htmlFor="Address">Địa chỉ</label><input asp-htmlFor="Address" required /></div>
      <div className="ff-form-group"><label asp-htmlFor="Description">Mô tả</label><textarea asp-htmlFor="Description" rows="3"></textarea></div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <button type="submit" className="ff-btn ff-btn-warning ff-btn-lg"><i className="ti ti-check"></i> Cập nhật</button>
        <a href="{/* Url.Action( */}"Stadiums", "Admin")" className="ff-btn ff-btn-outline ff-btn-lg">Hủy</a>
      </div>
    </form>
  </div>
</div>

        </>
    );
};

export default EditStadiumAdminjsx;
