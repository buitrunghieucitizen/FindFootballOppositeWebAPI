import React from 'react';

const EditTeamAdminjsx = () => {
    return (
        <>
            {/* model */} FindFootballOppsite.Models.Team
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Sửa Đội bóng";
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
 */}

<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
  <h2><i className="ti ti-shield-check"></i> Sửa Thông Tin Đội Bóng</h2>
  <p>Cập nhật đội bóng #{/* Model.TeamId */} — {/* Model.TeamName */}</p>
</div>

<a href="{/* Url.Action( */}"Teams", "Admin")" className="ff-btn ff-btn-outline mb-3 ff-animate-in"><i className="ti ti-arrow-left"></i> Quay lại danh sách</a>

<div className="ff-form-card ff-animate-in">
  <div className="ff-card-header"><h5><i className="ti ti-shield-check"></i> Chỉnh sửa thông tin</h5></div>
  <div className="ff-card-body">
    <form asp-action="EditTeam" method="post">
      <input type="hidden" asp-htmlFor="TeamId" />
      <input type="hidden" asp-htmlFor="CreatedAt" />
      <div className="ff-form-group">
        <label asp-htmlFor="TeamName">Tên Đội bóng <span style={{ color: 'var(--ff-danger)' }}>*</span></label>
        <input asp-htmlFor="TeamName" required />
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="CaptainId">ID Đội trưởng</label>
        <input asp-htmlFor="CaptainId" type="number" />
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="QualityLevel">Trình độ</label>
        <select asp-htmlFor="QualityLevel">
          <option value="">— Chọn trình độ —</option>
          <option value="Gà">Gà (Mới chơi)</option>
          <option value="Trung bình">Trung bình</option>
          <option value="Khá">Khá</option>
          <option value="Giỏi">Giỏi</option>
        </select>
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="History">Mô tả đội</label>
        <textarea asp-htmlFor="History" rows="3"></textarea>
      </div>
      <div className="ff-form-group">
        <label>Trạng thái</label>
        <div className="ff-check">
          <input asp-htmlFor="IsDisbanded" type="checkbox" />
          <span>Đã giải tán</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <button type="submit" className="ff-btn ff-btn-success ff-btn-lg"><i className="ti ti-check"></i> Cập nhật</button>
        <a href="{/* Url.Action( */}"Teams", "Admin")" className="ff-btn ff-btn-outline ff-btn-lg">Hủy</a>
      </div>
    </form>
  </div>
</div>

        </>
    );
};

export default EditTeamAdminjsx;
