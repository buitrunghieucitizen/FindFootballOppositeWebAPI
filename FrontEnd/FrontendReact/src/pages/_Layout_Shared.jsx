import React from 'react';

const LayoutSharedjsx = () => {
    return (
        <>
            <!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="FindFootball - Nền tảng đặt sân, ghép đội và tuyển quân bóng đá" />
    <title>{/* ViewData[ */}"Title"] - FindFootball</title>
    <link rel="stylesheet" href="~/assets/bootstrap/css/bootstrap.min.css" />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght{/* 300 */};400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="~/assets/fonts/font-awesome.min.css" />
    <link rel="stylesheet" href="~/assets/fonts/themify-icons.css" />
    <link rel="stylesheet" href="~/assets/owlcarousel/css/owl.carousel.css" />
    <link rel="stylesheet" href="~/assets/owlcarousel/css/owl.theme.css" />
    <link rel="stylesheet" href="~/assets/css/fonts.css" />
    <link rel="stylesheet" href="~/assets/css/prettyPhoto.css" />
    <link rel="stylesheet" href="~/assets/css/magnific-popup.css" />
    <link rel="stylesheet" href="~/assets/css/animate.css" />
    <link rel="stylesheet" href="~/assets/css/slick.css" />
    <link rel="stylesheet" href="~/assets/css/menu.css" />
    <link rel="stylesheet" href="~/assets/css/style.css" />
    <link rel="stylesheet" href="~/assets/css/responsive.css" />
    <link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />
</head>
<body data-spy="scroll" data-offset="80">
    <div className="preloader">
        <div className="status">
            <div className="status-mes"></div>
        </div>
    </div>

    <div className="site-mobile-menu site-navbar-target">
        <div className="site-mobile-menu-header">
            <div className="site-mobile-menu-close mt-3">
                <span className="icon-close2 js-menu-toggle"></span>
            </div>
        </div>
        <div className="site-mobile-menu-body"></div>
    </div>

    <header className="site-navbar js-sticky-header site-navbar-target" role="banner">
        <div className="container">
            <div className="row align-items-center">
                <div className="col-6 col-xl-2">
                    <h1 className="mb-0 site-logo">
                        <a asp-controller="Home" asp-action="Index">
                            <img src="~/assets/img/logo.png" alt="FindFootball" />
                        </a>
                    </h1>
                </div>
                <div className="col-12 col-md-10 d-none d-xl-block">
                    <nav className="site-navigation position-relative text-right" role="navigation">
                        <ul className="site-menu main-menu js-clone-nav mr-auto d-none d-lg-block">
                            <li><a asp-controller="Home" asp-action="Index" className="nav-link">Trang chủ</a></li>
                            <li><a asp-controller="Home" asp-action="Teams" className="nav-link">Đội bóng</a></li>
                            <li><a asp-controller="Home" asp-action="Stadiums" className="nav-link">Sân bóng</a></li>
                            <li><a asp-controller="Home" asp-action="Matches" className="nav-link">Trận đấu</a></li>
                            <li><a asp-controller="Home" asp-action="Recruitment" className="nav-link">Tuyển quân</a></li>
                            <li><a asp-controller="Home" asp-action="Operations" className="nav-link">Vận hành</a></li>
                            <li className="has-children">
                                {/* IF: User.Identity.IsAuthenticated */}
{
                                    <a href="#" className="nav-link">Chào, {/* User.Identity.Name */}</a>
                                    <ul className="dropdown">
                                        {/* RAZOR BLOCK: 
                                            var role = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
                                         */}
                                        {/* IF: role == "Admin" */}
{
                                            <li><a asp-controller="Home" asp-action="Admin" className="nav-link">Dashboard Admin</a></li>
                                        }
                                        else if (role == "StadiumOwner")
                                        {
                                            <li><a asp-controller="Home" asp-action="StadiumOwner" className="nav-link">Dashboard Chủ Sân</a></li>
                                        }
                                        else if (role == "Captain")
                                        {
                                            <li><a asp-controller="Home" asp-action="Captain" className="nav-link">Dashboard Đội Trưởng</a></li>
                                        }
                                        <li><a asp-controller="Home" asp-action="Privacy" className="nav-link">Cơ sở dữ liệu</a></li>
                                        <li>
                                            <form method="post" asp-controller="Account" asp-action="Logout">
                                                <button type="submit" className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', paddingLeft: '20px' }}>Đăng xuất</button>
                                            </form>
                                        </li>
                                    </ul>
                                }
                                else
                                {
                                    <a href="#" className="nav-link">Tài khoản</a>
                                    <ul className="dropdown">
                                        <li><a asp-controller="Account" asp-action="Login" className="nav-link">Đăng nhập</a></li>
                                        <li><a asp-controller="Account" asp-action="Register" className="nav-link">Đăng ký</a></li>
                                        <li><a asp-controller="Home" asp-action="Privacy" className="nav-link">Cơ sở dữ liệu</a></li>
                                    </ul>
                                }
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="col-6 d-inline-block d-xl-none ml-md-0 py-3" style={{ position: 'relative', top: '3px' }}>
                    <a href="#" className="site-menu-toggle js-menu-toggle float-right"><span className="icon-menu h3"></span></a>
                </div>
            </div>
        </div>
    </header>

    {/* IF: TempData["SuccessMessage"] != null */}
{
        <div id="ffo-toast" style={{ position: 'fixed', top: '100px', right: '20px', zIndex: '9999', padding: '16px 40px 16px 20px', borderRadius: '12px', background: 'linear-gradient(135deg,#0d9488,#0ea5e9)', color: '#fff', fontWeight: '600', boxShadow: '0 10px 40px rgba(13,148,136,.3)', animation: 'authFadeIn .4s ease-out' }}>
            {/* TempData[ */}"SuccessMessage"]
            <button type="button" onclick="this.parentElement.style.display='none';" style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'rgba(255,255,255,.8)' }}>&times;</button>
        </div>
    }

    {/* RenderBody() */}

    <footer className="footer-area">
        <div className="container">
            <div className="row">
                <div className="col-md-12 text-center">
                    <div className="footer_social">
                        <ul>
                            <li><a data-toggle="tooltip" data-placement="top" title="Facebook" href="#"><i className="fa fa-facebook"></i></a></li>
                            <li><a data-toggle="tooltip" data-placement="top" title="Instagram" href="#"><i className="fa fa-instagram"></i></a></li>
                            <li><a data-toggle="tooltip" data-placement="top" title="Youtube" href="#"><i className="fa fa-youtube"></i></a></li>
                            <li><a data-toggle="tooltip" data-placement="top" title="Zalo" href="#"><i className="fa fa-comments"></i></a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="row footer-padding">
                <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="single_footer">
                        <h4>FindFootball</h4>
                        <div className="footer_contact">
                            <ul>
                                <li><i className="fa fa-futbol-o"></i> <span>Đặt sân và ghép đội trên cùng một nền tảng</span></li>
                                <li><i className="fa fa-phone"></i> <span>Hotline: 0900 000 000</span></li>
                                <li><i className="fa fa-envelope"></i> <span>support{/* findfootball.vn */}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="single_footer">
                        <h4>Cầu thủ</h4>
                        <div className="footer_contact">
                            <ul>
                                <li><a asp-controller="Home" asp-action="Teams">Tìm đội bóng</a></li>
                                <li><a asp-controller="Home" asp-action="Recruitment">Tìm kèo đá bù</a></li>
                                {/* IF: !User.Identity.IsAuthenticated */}
{
                                    <li><a asp-controller="Account" asp-action="Register">Đăng ký tài khoản</a></li>
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="single_footer">
                        <h4>Đội trưởng</h4>
                        <div className="footer_contact">
                            <ul>
                                <li><a asp-controller="Home" asp-action="Matches">Gà đối</a></li>
                                <li><a asp-controller="Home" asp-action="Stadiums">Đặt sân</a></li>
                                <li><a asp-controller="Home" asp-action="Recruitment">Tuyển quân</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="single_footer">
                        <h4>Quản trị</h4>
                        <div className="footer_contact">
                            <ul>
                                <li><a asp-controller="Home" asp-action="Operations">Ma trận vai trò</a></li>
                                <li><a asp-controller="Home" asp-action="Privacy">Hướng dẫn cài đặt CSDL</a></li>
                                <li><a asp-controller="Home" asp-action="Stadiums">Vận hành cụm sân</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row text-center">
                <div className="col-md-12 col-sm-12 col-xs-12 wow zoomIn">
                    <p className="footer_copyright">FindFootball &copy; 2026 — Nền tảng quản lý bóng đá phủi.</p>
                </div>
            </div>
        </div>
    </footer>

    <script src="~/assets/js/jquery-1.12.4.min.js"></script>
    <script src="~/assets/bootstrap/js/bootstrap.min.js"></script>
    <script src="~/assets/js/modernizr-2.8.3.min.js"></script>
    <script src="~/assets/js/jquery.stellar.min.js"></script>
    <script src="~/assets/js/menu.js"></script>
    <script src="~/assets/js/jquery.sticky.js"></script>
    <script src="~/assets/owlcarousel/js/owl.carousel.min.js"></script>
    <script src="~/assets/js/jquery.magnific-popup.min.js"></script>
    <script src="~/assets/js/slick.min.js"></script>
    <script src="~/assets/js/jquery.mixitup.js"></script>
    <script src="~/assets/js/jquery.prettyPhoto.js"></script>
    <script src="~/assets/js/scrolltopcontrol.js"></script>
    <script src="~/assets/js/wow.min.js"></script>
    <script src="~/assets/js/scripts.js"></script>
    <script src="~/js/site.js" asp-append-version="true"></script>
    {/* await */} RenderSectionAsync("Scripts", required: false)
</body>
</html>

        </>
    );
};

export default LayoutSharedjsx;
