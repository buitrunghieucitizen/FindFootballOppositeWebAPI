import React from 'react';

const MatchesAdminjsx = () => {
    return (
        <>
            {/* model */} IEnumerable<FindFootballOppsite.Models.Match>
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Quản lý Trận đấu";
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

<div className="ff-dashboard-hero ff-animate-in" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
  <h2><i className="ti ti-calendar-event"></i> Quản Lý Trận Đấu</h2>
  <p>Theo dõi, thêm mới và quản lý các trận đấu trong hệ thống.</p>
</div>

<div className="ff-toolbar ff-animate-in">
  <form method="get" asp-action="Matches" className="ff-search-box">
    <i className="ti ti-search ff-search-icon"></i>
    <input type="text" name="search" value="{/* search */}" placeholder="Tìm theo trạng thái hoặc tên đội..." />
  </form>
  <div className="ff-toolbar-actions">
    <span className="ff-badge ff-badge-purple ff-badge-pill">{/* totalItems */} trận đấu</span>
    <a href="{/* Url.Action( */}"CreateMatch", "Admin")" className="ff-btn ff-btn-primary"><i className="ti ti-plus"></i> Thêm mới</a>
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
              <th>Đội nhà</th>
              <th style={{ textAlign: 'center' }}></th>
              <th>Đội khách</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* FOREACH: var match in Model */}
{
              var statusClass = match.MatchStatus switch {
                "Accepted" => "success",
                "Proposed" => "warning",
                "Completed" => "info",
                "Cancelled" => "danger",
                "CancelPending" => "danger",
                _ => "primary"
              };
              <tr>
                <td><span className="ff-badge ff-badge-purple">#{/* match.MatchId */}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.7rem', flexShrink: '0' }}>
                      {/* (match.HomeTeam */} != null ? match.HomeTeam.TeamName.Substring(0, 2) : "?")
                    </div>
                    <span style={{ fontWeight: '600' }}>{/* (match.HomeTeam */}?.TeamName ?? $"ID: {match.HomeTeamId}")</span>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}><span style={{ fontWeight: '800', color: 'var(--ff-text-muted)', fontSize: '0.78rem' }}>VS</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.7rem', flexShrink: '0' }}>
                      {/* (match.AwayTeam */} != null ? match.AwayTeam.TeamName.Substring(0, 2) : "?")
                    </div>
                    <span style={{ fontWeight: '600' }}>{/* (match.AwayTeam */}?.TeamName ?? (match.AwayTeamId.HasValue ? $"ID: {match.AwayTeamId}" : "Chờ đối thủ"))</span>
                  </div>
                </td>
                <td><span className="ff-badge ff-badge-{/* statusClass */} ff-badge-pill">{/* (match.MatchStatus */} ?? "—")</span></td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <a href="{/* Url.Action( */}"EditMatch", "Admin", new { id = match.MatchId })" className="ff-btn ff-btn-warning ff-btn-sm" title="Sửa"><i className="ti ti-edit"></i></a>
                    <a href="{/* Url.Action( */}"DeleteMatch", "Admin", new { id = match.MatchId })" className="ff-btn ff-btn-danger ff-btn-sm" title="Xóa" onclick="return confirm('Bạn có chắc chắn muốn xóa trận đấu này?');"><i className="ti ti-trash"></i></a>
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
            <a href="{/* Url.Action( */}"Matches", "Admin", new { search, page = currentPage - 1 })" className="{/* (currentPage */} <= 1 ? "disabled" : "")"><i className="ti ti-chevron-left"></i></a>
            {/* for */} (int i = 1; i <= totalPages; i++)
            {
              if (i == currentPage) { <span className="active">{/* i */}</span> }
              else { <a href="{/* Url.Action( */}"Matches", "Admin", new { search, page = i })">{/* i */}</a> }
            }
            <a href="{/* Url.Action( */}"Matches", "Admin", new { search, page = currentPage + 1 })" className="{/* (currentPage */} >= totalPages ? "disabled" : "")"><i className="ti ti-chevron-right"></i></a>
          </div>
        </div>
      }
    }
    else
    {
      <div className="ff-empty-state"><i className="ti ti-calendar-off"></i><p>Không tìm thấy trận đấu nào</p></div>
    }
  </div>
</div>

        </>
    );
};

export default MatchesAdminjsx;
