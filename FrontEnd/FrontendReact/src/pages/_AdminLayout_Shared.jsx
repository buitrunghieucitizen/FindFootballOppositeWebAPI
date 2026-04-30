import React from 'react';

const AdminLayoutSharedjsx = () => {
    return (
        <>
            <!DOCTYPE html>
<html lang="en">
<head>
  <title>{/* ViewData[ */}"Title"] - Dashboard</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimal-ui">
  {/*  [Google Font] Family  */}
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Public+Sans:wght{/* 300 */};400;500;600;700&display=swap" id="main-font-link">
  {/*  [Tabler Icons]  */}
  <link rel="stylesheet" href="~/assets/assets_for_admin_stadiumOwner_Captain/fonts/tabler-icons.min.css" >
  {/*  [Feather Icons]  */}
  <link rel="stylesheet" href="~/assets/assets_for_admin_stadiumOwner_Captain/fonts/feather.css" >
  {/*  [Font Awesome Icons]  */}
  <link rel="stylesheet" href="~/assets/assets_for_admin_stadiumOwner_Captain/fonts/fontawesome.css" >
  {/*  [Material Icons]  */}
  <link rel="stylesheet" href="~/assets/assets_for_admin_stadiumOwner_Captain/fonts/material.css" >
  {/*  [Template CSS Files]  */}
  <link rel="stylesheet" href="~/assets/assets_for_admin_stadiumOwner_Captain/css/style.css" id="main-style-link" >
  <link rel="stylesheet" href="~/assets/assets_for_admin_stadiumOwner_Captain/css/style-preset.css" >
  <link rel="stylesheet" href="~/assets/css/dashboard.css" />
  
  {/* RenderSection( */}"Styles", required: false)
</head>
<body data-pc-preset="preset-1" data-pc-sidebar-theme="light" data-pc-sidebar-caption="true" data-pc-direction="ltr" data-pc-theme="light">
  {/* RAZOR BLOCK: 
      var role = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
      var dashboardAction = role switch {
          "Admin" => "Admin",
          "StadiumOwner" => "StadiumOwner",
          "Captain" => "Captain",
          _ => "Index"
       */};
  }
  {/*  [ Pre-loader ] start  */}
  <div className="loader-bg">
    <div className="loader-track">
      <div className="loader-fill"></div>
    </div>
  </div>

  {/*  [ Sidebar Menu ] start  */}
  <nav className="pc-sidebar">
    <div className="navbar-wrapper">
      <div className="m-header">
        <a href="{/* Url.Action(dashboardAction */}, "Home")" className="b-brand text-primary">
          <img src="~/assets/img/logo.png" className="img-fluid logo-lg" alt="FindFootball Logo" style={{ maxHeight: '50px' }} />
        </a>
      </div>
      <div className="navbar-content">
        <ul className="pc-navbar">
          <li className="pc-item pc-caption">
            <label>Navigation</label>
            <i className="ti ti-dashboard"></i>
          </li>
          {/* IF: role == "Admin" */}
{
              <li className="pc-item">
                <a href="{/* Url.Action( */}"Admin", "Home")" className="pc-link"><span className="pc-micon"><i className="ti ti-dashboard"></i></span><span className="pc-mtext">Dashboard</span></a>
              </li>
              <li className="pc-item">
                <a href="{/* Url.Action( */}"Users", "Admin")" className="pc-link"><span className="pc-micon"><i className="ti ti-users"></i></span><span className="pc-mtext">Quản lý Người Dùng</span></a>
              </li>
              <li className="pc-item">
                <a href="{/* Url.Action( */}"Teams", "Admin")" className="pc-link"><span className="pc-micon"><i className="ti ti-shield"></i></span><span className="pc-mtext">Quản lý Đội Bóng</span></a>
              </li>
              <li className="pc-item">
                <a href="{/* Url.Action( */}"Stadiums", "Admin")" className="pc-link"><span className="pc-micon"><i className="ti ti-map-pin"></i></span><span className="pc-mtext">Quản lý Sân Bóng</span></a>
              </li>
              <li className="pc-item">
                <a href="{/* Url.Action( */}"Matches", "Admin")" className="pc-link"><span className="pc-micon"><i className="ti ti-calendar-event"></i></span><span className="pc-mtext">Quản lý Trận Đấu</span></a>
              </li>
          }
          else if (role == "StadiumOwner")
          {
              <li className="pc-item">
                <a href="{/* Url.Action( */}"StadiumOwner", "Home")" className="pc-link"><span className="pc-micon"><i className="ti ti-building"></i></span><span className="pc-mtext">Stadium Owner Dashboard</span></a>
              </li>
          }
          else if (role == "Captain")
          {
              <li className="pc-item">
                <a href="{/* Url.Action( */}"Captain", "Home")" className="pc-link"><span className="pc-micon"><i className="ti ti-flag"></i></span><span className="pc-mtext">Captain Dashboard</span></a>
              </li>
          }
        </ul>
      </div>
    </div>
  </nav>

  {/*  [ Header Topbar ] start  */}
  <header className="pc-header">
    <div className="header-wrapper"> 
      <div className="ms-auto">
        <ul className="list-unstyled">
          <li className="dropdown pc-h-item header-user-profile">
            <a className="pc-head-link dropdown-toggle arrow-none me-0" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" data-bs-auto-close="outside" aria-expanded="false">
              <img src="~/assets/assets_for_admin_stadiumOwner_Captain/images/user/avatar-2.jpg" alt="user-image" className="user-avtar" />
              <span>{/* User.Identity.Name */}</span>
            </a>
            <div className="dropdown-menu dropdown-user-profile dropdown-menu-end pc-h-dropdown">
              <div className="dropdown-header">
                <div className="d-flex mb-1">
                  <div className="flex-shrink-0">
                    <img src="~/assets/assets_for_admin_stadiumOwner_Captain/images/user/avatar-2.jpg" alt="user-image" className="user-avtar wid-35" />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1">{/* User.Identity.Name */}</h6>
                    <span>Dashboard User</span>
                  </div>
                  <form method="post" asp-controller="Account" asp-action="Logout" style={{ display: 'inline' }}>
                      <button type="submit" className="pc-head-link bg-transparent" style={{ border: 'none' }}><i className="ti ti-power text-danger"></i></button>
                  </form>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </header>
  {/*  [ Header ] end  */}

  {/*  [ Main Content ] start  */}
  <div className="pc-container">
    <div className="pc-content">
      {/* RenderBody() */}
    </div>
  </div>

  {/*  Required Js  */}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.11.8/umd/popper.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/simplebar/6.2.5/simplebar.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.min.js"></script>
  <script src="~/assets/assets_for_admin_stadiumOwner_Captain/js/fonts/custom-font.js"></script>
  <script src="~/assets/assets_for_admin_stadiumOwner_Captain/js/pcoded.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/feather-icons/4.29.1/feather.min.js"></script>
  
  <script>layout_change('light');</script>
  <script>change_box_container('false');</script>
  <script>layout_rtl_change('false');</script>
  <script>preset_change("preset-1");</script>
  <script>font_change("Public-Sans");</script>
  
  {/* RenderSection( */}"Scripts", required: false)
</body>
</html>

        </>
    );
};

export default AdminLayoutSharedjsx;
