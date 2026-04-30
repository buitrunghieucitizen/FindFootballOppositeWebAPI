import React from 'react';

const TeamsAdminjsx = () => {
    return (
        <>
            {/* model */} IEnumerable<FindFootballOppsite.Models.Team>
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Quản lý Đội bóng";
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

<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
  <h2><i className="ti ti-shield"></i> Quản Lý Đội Bóng</h2>
  <p>Thêm, sửa, xóa và giám sát các đội bóng trong hệ thống.</p>
</div>

<div className="ff-toolbar ff-animate-in">
  <form method="get" asp-action="Teams" className="ff-search-box">
    <i className="ti ti-search ff-search-icon"></i>
    <input type="text" name="search" value="{/* search */}" placeholder="Tìm theo tên đội hoặc trình độ..." />
  </form>
  <div className="ff-toolbar-actions">
    <span className="ff-badge ff-badge-success ff-badge-pill">{/* totalItems */} đội bóng</span>
    <a href="{/* Url.Action( */}"CreateTeam", "Admin")" className="ff-btn ff-btn-success"><i className="ti ti-plus"></i> Thêm mới</a>
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
              <th>Tên đội</th>
              <th>Đội trưởng</th>
              <th>Trình độ</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* FOREACH: var team in Model */}
{
              <tr>
                <td><span className="ff-badge ff-badge-success">#{/* team.TeamId */}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg,#059669,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem', flexShrink: '0' }}>
                      <i className="ti ti-shield"></i>
                    </div>
                    <span style={{ fontWeight: '600' }}>{/* team.TeamName */}</span>
                  </div>
                </td>
                <td>{/* (team.Captain */} != null ? team.Captain.FullName : (team.CaptainId.HasValue ? $"ID: {team.CaptainId}" : "—"))</td>
                <td><span className="ff-badge ff-badge-purple ff-badge-pill">{/* (team.QualityLevel */} ?? "—")</span></td>
                <td>
                  {/* IF: team.IsDisbanded == true */}
{
                    <span className="ff-badge ff-badge-danger ff-badge-pill">Đã giải tán</span>
                  }
                  else
                  {
                    <span className="ff-badge ff-badge-success ff-badge-pill"><span className="ff-live-dot" style={{ width: '6px', height: '6px', marginRight: '3px' }}></span> Hoạt động</span>
                  }
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--ff-text-muted)' }}>{/* (team.CreatedAt */}?.ToString("dd/MM/yyyy") ?? "—")</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <a href="{/* Url.Action( */}"EditTeam", "Admin", new { id = team.TeamId })" className="ff-btn ff-btn-warning ff-btn-sm" title="Sửa"><i className="ti ti-edit"></i></a>
                    <a href="{/* Url.Action( */}"DeleteTeam", "Admin", new { id = team.TeamId })" className="ff-btn ff-btn-danger ff-btn-sm" title="Xóa" onclick="return confirm('Bạn có chắc chắn muốn xóa đội bóng này?');"><i className="ti ti-trash"></i></a>
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
            <a href="{/* Url.Action( */}"Teams", "Admin", new { search, page = currentPage - 1 })" className="{/* (currentPage */} <= 1 ? "disabled" : "")"><i className="ti ti-chevron-left"></i></a>
            {/* for */} (int i = 1; i <= totalPages; i++)
            {
              if (i == currentPage) { <span className="active">{/* i */}</span> }
              else { <a href="{/* Url.Action( */}"Teams", "Admin", new { search, page = i })">{/* i */}</a> }
            }
            <a href="{/* Url.Action( */}"Teams", "Admin", new { search, page = currentPage + 1 })" className="{/* (currentPage */} >= totalPages ? "disabled" : "")"><i className="ti ti-chevron-right"></i></a>
          </div>
        </div>
      }
    }
    else
    {
      <div className="ff-empty-state"><i className="ti ti-shield-off"></i><p>Không tìm thấy đội bóng nào</p></div>
    }
  </div>
</div>

        </>
    );
};

export default TeamsAdminjsx;
