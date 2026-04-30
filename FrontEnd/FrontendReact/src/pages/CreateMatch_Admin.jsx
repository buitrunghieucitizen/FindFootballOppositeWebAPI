import React from 'react';

const CreateMatchAdminjsx = () => {
    return (
        <>
            {/* model */} FindFootballOppsite.Models.Match
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Thêm Trận đấu";
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
 */}

<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
  <h2><i className="ti ti-calendar-plus"></i> Thêm Trận Đấu Mới</h2>
  <p>Tạo kèo đấu mới cho các đội bóng.</p>
</div>

<a href="{/* Url.Action( */}"Matches", "Admin")" className="ff-btn ff-btn-outline mb-3"><i className="ti ti-arrow-left"></i> Quay lại</a>

<div className="ff-form-card">
  <div className="ff-card-header"><h5><i className="ti ti-calendar-plus"></i> Thông tin trận đấu</h5></div>
  <div className="ff-card-body">
    <form asp-action="CreateMatch" method="post">
      <div className="ff-form-group"><label asp-htmlFor="HomeTeamId">ID Đội nhà</label><input asp-htmlFor="HomeTeamId" type="number" placeholder="ID đội nhà" /></div>
      <div className="ff-form-group"><label asp-htmlFor="AwayTeamId">ID Đội khách</label><input asp-htmlFor="AwayTeamId" type="number" placeholder="ID đội khách" /></div>
      <div className="ff-form-group"><label asp-htmlFor="ScheduleId">ID Lịch sân</label><input asp-htmlFor="ScheduleId" type="number" placeholder="Có thể để trống" /></div>
      <div className="ff-form-group">
        <label asp-htmlFor="MatchStatus">Trạng thái</label>
        <select asp-htmlFor="MatchStatus">
          <option value="Proposed">Đề xuất</option>
          <option value="Accepted">Đã chấp nhận</option>
          <option value="Completed">Hoàn thành</option>
          <option value="Cancelled">Đã hủy</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <button type="submit" className="ff-btn ff-btn-primary ff-btn-lg"><i className="ti ti-check"></i> Lưu trận đấu</button>
        <a href="{/* Url.Action( */}"Matches", "Admin")" className="ff-btn ff-btn-outline ff-btn-lg">Hủy</a>
      </div>
    </form>
  </div>
</div>

        </>
    );
};

export default CreateMatchAdminjsx;
