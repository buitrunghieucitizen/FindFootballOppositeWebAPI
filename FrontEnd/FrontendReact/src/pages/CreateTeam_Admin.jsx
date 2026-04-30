import React from 'react';

const CreateTeamAdminjsx = () => {
    return (
        <>
            {/* model */} FindFootballOppsite.Models.Team
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Thêm Đội bóng";
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
 */}

<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
  <h2><i className="ti ti-shield-plus"></i> Thêm Đội Bóng Mới</h2>
  <p>Đăng ký đội bóng mới vào hệ thống FindFootball.</p>
</div>

<a href="{/* Url.Action( */}"Teams", "Admin")" className="ff-btn ff-btn-outline mb-3 ff-animate-in"><i className="ti ti-arrow-left"></i> Quay lại danh sách</a>

<div className="ff-form-card ff-animate-in">
  <div className="ff-card-header"><h5><i className="ti ti-shield-plus"></i> Thông tin đội bóng</h5></div>
  <div className="ff-card-body">
    <form asp-action="CreateTeam" method="post">
      <div className="ff-form-group">
        <label asp-htmlFor="TeamName">Tên Đội bóng <span style={{ color: 'var(--ff-danger)' }}>*</span></label>
        <input asp-htmlFor="TeamName" placeholder="VD: FC Lập Trình" required />
        <span asp-validation-htmlFor="TeamName" style={{ fontSize: '0.78rem', color: 'var(--ff-danger)' }}></span>
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="CaptainId">ID Đội trưởng</label>
        <input asp-htmlFor="CaptainId" type="number" placeholder="ID người dùng làm đội trưởng" />
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
        <textarea asp-htmlFor="History" rows="3" placeholder="Giới thiệu về đội bóng..."></textarea>
      </div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <button type="submit" className="ff-btn ff-btn-success ff-btn-lg"><i className="ti ti-check"></i> Lưu đội bóng</button>
        <a href="{/* Url.Action( */}"Teams", "Admin")" className="ff-btn ff-btn-outline ff-btn-lg">Hủy</a>
      </div>
    </form>
  </div>
</div>

        </>
    );
};

export default CreateTeamAdminjsx;
