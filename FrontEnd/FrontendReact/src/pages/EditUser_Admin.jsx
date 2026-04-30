import React from 'react';

const EditUserAdminjsx = () => {
    return (
        <>
            {/* model */} FindFootballOppsite.Models.User
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Sửa Người dùng";
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
 */}

<div className="ff-dashboard-hero ff-animate-in">
  <h2><i className="ti ti-user-edit"></i> Sửa Thông Tin Người Dùng</h2>
  <p>Cập nhật thông tin tài khoản #{/* Model.UserId */}</p>
</div>

<a href="{/* Url.Action( */}"Users", "Admin")" className="ff-btn ff-btn-outline mb-3 ff-animate-in"><i className="ti ti-arrow-left"></i> Quay lại danh sách</a>

<div className="ff-form-card ff-animate-in">
  <div className="ff-card-header"><h5><i className="ti ti-user-edit"></i> Chỉnh sửa thông tin</h5></div>
  <div className="ff-card-body">
    <form asp-action="EditUser" method="post">
      <input type="hidden" asp-htmlFor="UserId" />
      <input type="hidden" asp-htmlFor="CreatedAt" />
      <div className="ff-form-group">
        <label asp-htmlFor="Username">Tên đăng nhập</label>
        <input asp-htmlFor="Username" required />
        <span asp-validation-htmlFor="Username" style={{ fontSize: '0.78rem', color: 'var(--ff-danger)' }}></span>
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="FullName">Họ và Tên</label>
        <input asp-htmlFor="FullName" required />
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="Phone">Số điện thoại</label>
        <input asp-htmlFor="Phone" />
      </div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <button type="submit" className="ff-btn ff-btn-primary ff-btn-lg"><i className="ti ti-check"></i> Cập nhật</button>
        <a href="{/* Url.Action( */}"Users", "Admin")" className="ff-btn ff-btn-outline ff-btn-lg">Hủy</a>
      </div>
    </form>
  </div>
</div>

        </>
    );
};

export default EditUserAdminjsx;
