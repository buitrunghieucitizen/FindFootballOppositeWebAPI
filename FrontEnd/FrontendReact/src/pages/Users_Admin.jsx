import React from 'react';

const UsersAdminjsx = () => {
    return (
        <>
            {/* model */} IEnumerable<FindFootballOppsite.Models.User>
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Quản lý Người dùng";
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
    var currentPage = (int)(ViewBag.CurrentPage ?? 1);
    var totalPages = (int)(ViewBag.TotalPages ?? 1);
    var totalItems = (int)(ViewBag.TotalItems ?? 0);
    var search = ViewBag.Search as string ?? "";
 */}

{/* IF: TempData["SuccessMessage"] != null */}
{
    <div className="ff-toast"><i className="ti ti-circle-check"></i> {/* TempData[ */}"SuccessMessage"]</div>
}

{/*  Page Header  */}
<div className="ff-dashboard-hero ff-animate-in">
  <h2><i className="ti ti-users"></i> Quản Lý Người Dùng</h2>
  <p>Quản lý tài khoản, phân quyền và theo dõi người dùng trên hệ thống.</p>
</div>

{/*  Toolbar  */}
<div className="ff-toolbar ff-animate-in">
  <form method="get" asp-action="Users" className="ff-search-box">
    <i className="ti ti-search ff-search-icon"></i>
    <input type="text" name="search" value="{/* search */}" placeholder="Tìm theo tên, username hoặc SĐT..." />
  </form>
  <div className="ff-toolbar-actions">
    <span className="ff-badge ff-badge-primary ff-badge-pill">{/* totalItems */} người dùng</span>
    <a href="{/* Url.Action( */}"CreateUser", "Admin")" className="ff-btn ff-btn-primary"><i className="ti ti-plus"></i> Thêm mới</a>
  </div>
</div>

{/*  Table Card  */}
<div className="ff-card ff-animate-in" style={{ height: 'auto' }}>
  <div className="ff-card-body" style={{ padding: '0' }}>
    {/* if */} (Model.Any())
    {
      <div className="table-responsive">
        <table className="ff-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Người dùng</th>
              <th>SĐT</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* FOREACH: var user in Model */}
{
              <tr>
                <td><span className="ff-badge ff-badge-primary">#{/* user.UserId */}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.78rem', flexShrink: '0' }}>
                      {/* (user.FullName */}?.Length > 0 ? user.FullName.Substring(0, 1).ToUpper() : "?")
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{/* user.FullName */}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ff-text-muted)' }}>{/* user.Username */}</div>
                    </div>
                  </div>
                </td>
                <td>{/* (user.Phone */} ?? "—")</td>
                <td>
                  {/* if */} (user.Roles != null && user.Roles.Any())
                  {
                    {/* FOREACH: var r in user.Roles */}
{
                      var cls = r.RoleName == "Admin" ? "danger" : r.RoleName == "Captain" ? "purple" : r.RoleName == "StadiumOwner" ? "warning" : "info";
                      <span className="ff-badge ff-badge-{/* cls */} me-1">{/* r.RoleName */}</span>
                    }
                  }
                  else
                  {
                    <span className="ff-badge ff-badge-primary" style={{ opacity: '.4' }}>Chưa gán</span>
                  }
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--ff-text-muted)' }}>{/* (user.CreatedAt */}?.ToString("dd/MM/yyyy") ?? "—")</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <a href="{/* Url.Action( */}"EditUserRole", "Admin", new { id = user.UserId })" className="ff-btn ff-btn-info ff-btn-sm" title="Phân quyền"><i className="ti ti-key"></i></a>
                    <a href="{/* Url.Action( */}"EditUser", "Admin", new { id = user.UserId })" className="ff-btn ff-btn-warning ff-btn-sm" title="Sửa"><i className="ti ti-edit"></i></a>
                    <a href="{/* Url.Action( */}"DeleteUser", "Admin", new { id = user.UserId })" className="ff-btn ff-btn-danger ff-btn-sm" title="Xóa" onclick="return confirm('Bạn có chắc chắn muốn xóa người dùng này?');"><i className="ti ti-trash"></i></a>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      {/*  Pagination  */}
      {/* IF: totalPages > 1 */}
{
        <div className="ff-pagination" style={{ padding: '12px 20px' }}>
          <div className="ff-pagination-info">Trang {/* currentPage */} / {/* totalPages */} · {/* totalItems */} kết quả</div>
          <div className="ff-pagination-pages">
            <a href="{/* Url.Action( */}"Users", "Admin", new { search, page = currentPage - 1 })" className="{/* (currentPage */} <= 1 ? "disabled" : "")"><i className="ti ti-chevron-left"></i></a>
            {/* for */} (int i = 1; i <= totalPages; i++)
            {
              if (i == currentPage)
              {
                <span className="active">{/* i */}</span>
              }
              else
              {
                <a href="{/* Url.Action( */}"Users", "Admin", new { search, page = i })">{/* i */}</a>
              }
            }
            <a href="{/* Url.Action( */}"Users", "Admin", new { search, page = currentPage + 1 })" className="{/* (currentPage */} >= totalPages ? "disabled" : "")"><i className="ti ti-chevron-right"></i></a>
          </div>
        </div>
      }
    }
    else
    {
      <div className="ff-empty-state">
        <i className="ti ti-users-minus"></i>
        <p>Không tìm thấy người dùng nào{/* (string.IsNullOrEmpty(search) */} ? "" : $" cho từ khóa \"{search}\"")</p>
      </div>
    }
  </div>
</div>

        </>
    );
};

export default UsersAdminjsx;
