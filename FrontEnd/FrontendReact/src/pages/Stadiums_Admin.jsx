import React from 'react';

const StadiumsAdminjsx = () => {
    return (
        <>
            {/* model */} IEnumerable<FindFootballOppsite.Models.Stadium>
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Quản lý Sân bóng";
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

<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg,#d97706,#dc2626)' }}>
  <h2><i className="ti ti-map-pin"></i> Quản Lý Sân Bóng</h2>
  <p>Quản lý danh sách cụm sân, địa chỉ và thông tin chủ sân.</p>
</div>

<div className="ff-toolbar ff-animate-in">
  <form method="get" asp-action="Stadiums" className="ff-search-box">
    <i className="ti ti-search ff-search-icon"></i>
    <input type="text" name="search" value="{/* search */}" placeholder="Tìm theo tên sân hoặc địa chỉ..." />
  </form>
  <div className="ff-toolbar-actions">
    <span className="ff-badge ff-badge-warning ff-badge-pill">{/* totalItems */} sân bóng</span>
    <a href="{/* Url.Action( */}"CreateStadium", "Admin")" className="ff-btn ff-btn-warning"><i className="ti ti-plus"></i> Thêm mới</a>
  </div>
</div>

<div className="ff-card ff-animate-in" style={{ height: 'auto' }}>
  <div className="ff-card-body" style={{ padding: '0' }}>
    {/* if */} (Model.Any())
    {
      <div className="table-responsive">
        <table className="ff-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sân</th>
              <th>Địa chỉ</th>
              <th>Chủ sân</th>
              <th>Ngày tạo</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* FOREACH: var stadium in Model */}
{
              <tr>
                <td><span className="ff-badge ff-badge-warning">#{/* stadium.StadiumId */}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg,#d97706,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem', flexShrink: '0' }}>
                      <i className="ti ti-building-stadium"></i>
                    </div>
                    <span style={{ fontWeight: '600' }}>{/* stadium.StadiumName */}</span>
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem' }}><i className="ti ti-map-pin" style={{ color: 'var(--ff-warning)', fontSize: '0.85rem' }}></i> {/* (stadium.Address */} ?? "—")</td>
                <td>{/* (stadium.Owner */} != null ? stadium.Owner.FullName : (stadium.OwnerId.HasValue ? $"ID: {stadium.OwnerId}" : "—"))</td>
                <td style={{ fontSize: '0.82rem', color: 'var(--ff-text-muted)' }}>{/* (stadium.CreatedAt */}?.ToString("dd/MM/yyyy") ?? "—")</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <a href="{/* Url.Action( */}"StadiumDetails", "Admin", new { id = stadium.StadiumId })" className="ff-btn ff-btn-info ff-btn-sm" title="Chi tiết"><i className="ti ti-eye"></i></a>
                    <a href="{/* Url.Action( */}"EditStadium", "Admin", new { id = stadium.StadiumId })" className="ff-btn ff-btn-warning ff-btn-sm" title="Sửa"><i className="ti ti-edit"></i></a>
                    <a href="{/* Url.Action( */}"DeleteStadium", "Admin", new { id = stadium.StadiumId })" className="ff-btn ff-btn-danger ff-btn-sm" title="Xóa" onclick="return confirm('Bạn có chắc chắn muốn xóa sân bóng này?');"><i className="ti ti-trash"></i></a>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      {/* IF: totalPages > 1 */}
{
        <div className="ff-pagination" style={{ padding: '12px 20px' }}>
          <div className="ff-pagination-info">Trang {/* currentPage */} / {/* totalPages */} · {/* totalItems */} kết quả</div>
          <div className="ff-pagination-pages">
            <a href="{/* Url.Action( */}"Stadiums", "Admin", new { search, page = currentPage - 1 })" className="{/* (currentPage */} <= 1 ? "disabled" : "")"><i className="ti ti-chevron-left"></i></a>
            {/* for */} (int i = 1; i <= totalPages; i++)
            {
              if (i == currentPage) { <span className="active">{/* i */}</span> }
              else { <a href="{/* Url.Action( */}"Stadiums", "Admin", new { search, page = i })">{/* i */}</a> }
            }
            <a href="{/* Url.Action( */}"Stadiums", "Admin", new { search, page = currentPage + 1 })" className="{/* (currentPage */} >= totalPages ? "disabled" : "")"><i className="ti ti-chevron-right"></i></a>
          </div>
        </div>
      }
    }
    else
    {
      <div className="ff-empty-state"><i className="ti ti-map-pin-off"></i><p>Không tìm thấy sân bóng nào</p></div>
    }
  </div>
</div>

        </>
    );
};

export default StadiumsAdminjsx;
