import React from 'react';

const EditUserRoleAdminjsx = () => {
    return (
        <>
            {/* model */} FindFootballOppsite.Models.User
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Phân quyền người dùng";
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
    var roles = ViewBag.Roles as IEnumerable<FindFootballOppsite.Models.Role>;
    var userRoleIds = ViewBag.UserRoleIds as IEnumerable<int>;
 */}

<div className="ff-dashboard-hero ff-animate-in">
  <h2><i className="ti ti-key"></i> Phân Quyền Người Dùng</h2>
  <p>Gán vai trò cho {/* Model.FullName */} ({/* Model.Username) */}</p>
</div>

<a href="{/* Url.Action( */}"Users", "Admin")" className="ff-btn ff-btn-outline mb-3 ff-animate-in"><i className="ti ti-arrow-left"></i> Quay lại danh sách</a>

<div className="ff-form-card ff-animate-in">
  <div className="ff-card-header"><h5><i className="ti ti-key"></i> Chọn vai trò</h5></div>
  <div className="ff-card-body">
    <form asp-action="EditUserRole" method="post">
      <input type="hidden" name="id" value="{/* Model.UserId */}" />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {/* IF: roles != null */}
{
          {/* FOREACH: var role in roles */}
{
            var isChecked = userRoleIds != null && userRoleIds.Contains(role.RoleId);
            var iconClass = role.RoleName switch {
              "Admin" => "ti-shield-lock",
              "Captain" => "ti-flag-3",
              "StadiumOwner" => "ti-building-stadium",
              _ => "ti-user"
            };
            var bgColor = role.RoleName switch {
              "Admin" => "rgba(239,68,68,0.08)",
              "Captain" => "rgba(139,92,246,0.08)",
              "StadiumOwner" => "rgba(245,158,11,0.08)",
              _ => "rgba(37,99,235,0.08)"
            };
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: 'var(--ff-radius-sm)', border: '1px solid var(--ff-border)', cursor: 'pointer', transition: 'all 0.2s', background: '{/* (isChecked */} ? bgColor :' }}transparent");">
              <input type="checkbox" name="roleIds" value="{/* role.RoleId */}" {/* (isChecked */} ? "checked" : "") style={{ width: '18px', height: '18px', accentColor: 'var(--ff-primary)' }} />
              <i className="ti {/* iconClass */}" style={{ fontSize: '1.2rem', opacity: '0.7' }}></i>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{/* role.RoleName */}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ff-text-muted)' }}>
                  {/* (role.RoleName */} switch {
                    "Admin" => "Quản trị hệ thống, toàn quyền",
                    "Captain" => "Đội trưởng, quản lý đội và kèo đấu",
                    "StadiumOwner" => "Chủ sân, quản lý cụm sân bóng",
                    "Player" => "Cầu thủ, tham gia đội và trận đấu",
                    _ => "Vai trò trong hệ thống"
                  })
                </div>
              </div>
            </label>
          }
        }
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" className="ff-btn ff-btn-success ff-btn-lg"><i className="ti ti-check"></i> Cập nhật phân quyền</button>
        <a href="{/* Url.Action( */}"Users", "Admin")" className="ff-btn ff-btn-outline ff-btn-lg">Hủy</a>
      </div>
    </form>
  </div>
</div>

        </>
    );
};

export default EditUserRoleAdminjsx;
