import React from 'react';

const EditMatchAdminjsx = () => {
    return (
        <>
            {/* model */} FindFootballOppsite.Models.Match
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Sửa Trận đấu";
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
 */}

<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
  <h2><i className="ti ti-calendar-event"></i> Sửa Trận Đấu #{/* Model.MatchId */}</h2>
  <p>Cập nhật thông tin trận đấu.</p>
</div>

<a href="{/* Url.Action( */}"Matches", "Admin")" className="ff-btn ff-btn-outline mb-3"><i className="ti ti-arrow-left"></i> Quay lại</a>

<div className="ff-form-card">
  <div className="ff-card-header"><h5><i className="ti ti-calendar-event"></i> Chỉnh sửa</h5></div>
  <div className="ff-card-body">
    <form asp-action="EditMatch" method="post">
      <input type="hidden" asp-htmlFor="MatchId" />
      <div className="ff-form-group"><label asp-htmlFor="HomeTeamId">ID Đội nhà</label><input asp-htmlFor="HomeTeamId" type="number" /></div>
      <div className="ff-form-group"><label asp-htmlFor="AwayTeamId">ID Đội khách</label><input asp-htmlFor="AwayTeamId" type="number" /></div>
      <div className="ff-form-group"><label asp-htmlFor="ScheduleId">ID Lịch sân</label><input asp-htmlFor="ScheduleId" type="number" /></div>
      <div className="ff-form-group">
        <label asp-htmlFor="MatchStatus">Trạng thái</label>
        <select asp-htmlFor="MatchStatus">
          <option value="Proposed">Đề xuất</option>
          <option value="Accepted">Đã chấp nhận</option>
          <option value="Completed">Hoàn thành</option>
          <option value="CancelPending">Chờ hủy</option>
          <option value="Cancelled">Đã hủy</option>
        </select>
      </div>
      <div className="ff-form-group"><label asp-htmlFor="CancelReason">Lý do hủy</label><textarea asp-htmlFor="CancelReason" rows="2" placeholder="Nếu có..."></textarea></div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <button type="submit" className="ff-btn ff-btn-primary ff-btn-lg"><i className="ti ti-check"></i> Cập nhật</button>
        <a href="{/* Url.Action( */}"Matches", "Admin")" className="ff-btn ff-btn-outline ff-btn-lg">Hủy</a>
      </div>
    </form>
  </div>
</div>

        </>
    );
};

export default EditMatchAdminjsx;
