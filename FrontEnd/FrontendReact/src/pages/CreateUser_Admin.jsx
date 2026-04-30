import React from 'react';

const CreateUserAdminjsx = () => {
    return (
        <>
            {/* model */} FindFootballOppsite.Models.User
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Thêm Người dùng";
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
 */}

<div className="ff-dashboard-hero ff-animate-in">
  <h2><i className="ti ti-user-plus"></i> Thêm Người Dùng Mới</h2>
  <p>Tạo tài khoản mới trên hệ thống FindFootball.</p>
</div>

<a href="{/* Url.Action( */}"Users", "Admin")" className="ff-btn ff-btn-outline mb-3 ff-animate-in"><i className="ti ti-arrow-left"></i> Quay lại danh sách</a>

<div className="ff-form-card ff-animate-in">
  <div className="ff-card-header"><h5><i className="ti ti-user-plus"></i> Thông tin người dùng</h5></div>
  <div className="ff-card-body">
    <form asp-action="CreateUser" method="post">
      <div className="ff-form-group">
        <label asp-htmlFor="Username">Tên đăng nhập <span style={{ color: 'var(--ff-danger)' }}>*</span></label>
        <input asp-htmlFor="Username" placeholder="Nhập tên đăng nhập..." required />
        <span asp-validation-htmlFor="Username" style={{ fontSize: '0.78rem', color: 'var(--ff-danger)' }}></span>
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="PasswordHash">Mật khẩu <span style={{ color: 'var(--ff-danger)' }}>*</span></label>
        <input asp-htmlFor="PasswordHash" type="password" placeholder="Tối thiểu 8 ký tự..." required />
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="FullName">Họ và Tên <span style={{ color: 'var(--ff-danger)' }}>*</span></label>
        <input asp-htmlFor="FullName" placeholder="Nhập họ và tên..." required />
      </div>
      <div className="ff-form-group">
        <label asp-htmlFor="Phone">Số điện thoại</label>
        <input asp-htmlFor="Phone" placeholder="0987654321" />
      </div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <button type="submit" className="ff-btn ff-btn-primary ff-btn-lg"><i className="ti ti-check"></i> Lưu người dùng</button>
        <a href="{/* Url.Action( */}"Users", "Admin")" className="ff-btn ff-btn-outline ff-btn-lg">Hủy</a>
      </div>
    </form>
  </div>
</div>

        </>
    );
};

export default CreateUserAdminjsx;
