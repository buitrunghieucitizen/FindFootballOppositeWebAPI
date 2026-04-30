import React from 'react';

const IndexGuestjsx = () => {
    return (
        <>
            {/* model */} PortalHubViewModel
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Trang chủ";
 */}

{/* IF: TempData["Success"] != null */}
{
    <div className="alert alert-success" role="alert">{/* TempData[ */}"Success"]</div>
}
{/* IF: TempData["Error"] != null */}
{
    <div className="alert alert-danger" role="alert">{/* TempData[ */}"Error"]</div>
}

<div className="ffo-page">
    {/*  HERO  */}
    <section id="home" className="home_bg ffo-home-hero" style={{ backgroundImage: 'url(/assets/img/bg/home-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center center' }}>
        <div className="container">
            <div className="row">
                <div className="col-lg-10 offset-lg-1 col-sm-12 col-xs-12 text-center">
                    <div className="hero-text">
                        <h2 className="wow fadeInUp" data-wow-delay=".2s">Đặt sân · Gạ đối · Tuyển quân<br/>Tất cả trên một nền tảng</h2>
                        <p className="wow fadeInUp" data-wow-delay=".4s">
                            Nền tảng giúp cầu thủ tìm đội, đội trưởng đặt sân và gạ đối,
                            chủ sân duyệt lịch, quản trị viên giám sát vận hành — tất cả trong một.
                        </p>
                        <div className="home_btn wow fadeInUp" data-wow-delay=".6s">
                            <a asp-controller="Home" asp-action="Matches" className="app-btn page-scroll home_btn_color_one">
                                <i className="fa fa-bolt" style={{ marginRight: '8px' }}></i>Gạ đối ngay
                            </a>
                            <a asp-controller="Home" asp-action="Stadiums" className="app-btn page-scroll home_btn_color_two">
                                <i className="fa fa-calendar" style={{ marginRight: '8px' }}></i>Xem lịch sân
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/*  METRICS  */}
    <div className="search_bar section-padding">
        <div className="container">
            <div className="row g-4">
                <div className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp" data-wow-delay=".1s">
                    <div className="ffo-quick-card">
                        <h3>{/* Model.Metrics.TeamCount */}</h3>
                        <p>Đội đang hoạt động</p>
                    </div>
                </div>
                <div className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp" data-wow-delay=".2s">
                    <div className="ffo-quick-card">
                        <h3>{/* Model.Metrics.PitchCount */}</h3>
                        <p>Sân đang khai thác</p>
                    </div>
                </div>
                <div className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp" data-wow-delay=".3s">
                    <div className="ffo-quick-card">
                        <h3>{/* Model.Metrics.UpcomingMatchCount */}</h3>
                        <p>Kèo sắp diễn ra</p>
                    </div>
                </div>
                <div className="col-lg-3 col-sm-6 col-xs-12 wow fadeInUp" data-wow-delay=".4s">
                    <div className="ffo-quick-card">
                        <h3>{/* Model.Metrics.FreeAgentCount */}</h3>
                        <p>Cầu thủ tự do</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/*  STADIUMS  */}
    <section className="template_property">
        <div className="container">
            <div className="section-title text-center wow zoomIn">
                <h2>Sân bóng & lịch đặt</h2>
                <div></div>
            </div>
            <div className="row">
                {/* FOREACH: var stadium in Model.Stadiums */}
{
                    {/* FOREACH: var pitch in stadium.Pitches */}
{
                        <div className="col-lg-4 col-sm-12 col-xs-12">
                            <div className="single_property ffo-single-property">
                                <div style={{ overflow: 'hidden' }}>
                                    <img src="~/assets/img/property/{/* ((pitch.PitchId */} % 6) + 1).jpg" className="img-fluid" alt="{/* pitch.PitchName */}" />
                                </div>
                                <div className="single_property_description text-center">
                                    <span><i className="fa fa-futbol-o"></i> Sân {/* pitch.PitchSize */} người</span>
                                    <span><i className="fa fa-map-marker"></i> {/* stadium.StadiumName */}</span>
                                    <span><i className="fa fa-clock-o"></i> {/* pitch.AvailabilityLabel */}</span>
                                </div>
                                <div className="single_property_content">
                                    <h4><a asp-controller="Home" asp-action="Stadiums">{/* pitch.PitchName */}</a></h4>
                                    <p>{/* stadium.Address */}</p>
                                    <ul className="ffo-mini-list">
                                        <li>Chủ sân: {/* stadium.OwnerName */}</li>
                                        <li>{/* stadium.UtilizationLabel */}</li>
                                    </ul>
                                </div>
                                <div className="single_property_price">
                                    Giá theo giờ <span>{/* pitch.PricePerHour.ToString( */}"N0") VNĐ</span>
                                </div>
                            </div>
                        </div>
                    }
                }
            </div>
        </div>
    </section>

    {/*  TEAMS  */}
    <section id="team" className="our_team section-padding">
        <div className="container">
            <div className="section-title text-center wow zoomIn">
                <h2>Đội bóng & cầu thủ tự do</h2>
                <div></div>
            </div>
            <div className="row text-center">
                {/* FOREACH: var team in Model.Teams */}
{
                    <div className="col-lg-4 col-sm-6 col-xs-12">
                        <div className="single_team ffo-single-team">
                            <div style={{ overflow: 'hidden' }}>
                                <img src="~/assets/img/team/team-{/* ((team.TeamId */} % 4) + 1).jpg" className="img-fluid" alt="{/* team.TeamName */}" />
                            </div>
                            <h3>{/* team.TeamName */}</h3>
                            <p>{/* team.CaptainName */} — {/* team.QualityLevel */}</p>
                            <ul className="list-inline">
                                <li>{/* team.HomeArea */}</li>
                                <li>{/* team.RecentForm */}</li>
                            </ul>
                        </div>
                    </div>
                }
                {/* foreach */} (var player in Model.Players.Where(player => player.IsFreeAgent))
                {
                    <div className="col-lg-4 col-sm-6 col-xs-12">
                        <div className="single_team ffo-single-team">
                            <div style={{ overflow: 'hidden' }}>
                                <img src="~/assets/img/team/{/* ((player.UserId */} % 4) + 1).png" className="img-fluid" alt="{/* player.FullName */}" />
                            </div>
                            <h3>{/* player.FullName */}</h3>
                            <p>{/* player.PreferredPosition */} — Đang rảnh</p>
                            <ul className="list-inline">
                                <li>{/* player.ActiveArea */}</li>
                                <li>{/* player.AvailabilityNote */}</li>
                            </ul>
                        </div>
                    </div>
                }
            </div>
        </div>
    </section>

    {/*  RECRUITMENT & ROLES  */}
    <section className="blog_area section-padding">
        <div className="container">
            <div className="section-title text-center wow zoomIn">
                <h2>Tin tuyển quân & vai trò hệ thống</h2>
                <div></div>
            </div>
            <div className="row">
                {/* FOREACH: var ad in Model.RecruitmentAds */}
{
                    <div className="col-lg-4 col-sm-6 col-xs-12">
                        <div className="single_blog wow fadeInUp">
                            <div style={{ overflow: 'hidden' }}>
                                <img src="~/assets/img/blog/blog-{/* ((ad.AdId */} % 3) + 1).jpg" className="img-fluid" alt="{/* ad.Title */}" />
                            </div>
                            <div className="blog_content">
                                <h3><a asp-controller="Home" asp-action="Recruitment">{/* ad.Title */}</a></h3>
                                <p>{/* ad.Content */}</p>
                                <ul className="ffo-mini-list">
                                    <li>{/* ad.TeamName */}</li>
                                    <li>{/* ad.PositionNeeded */}</li>
                                    <li>{/* ad.UrgencyLabel */}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                }
            </div>

            <div className="row mt-5">
                {/* FOREACH: var actor in Model.ActorCapabilities */}
{
                    <div className="col-lg-4 col-sm-6 col-xs-12 wow fadeInUp">
                        <div className="ffo-role-card">
                            <span className="ffo-status">{/* actor.ActorName */}</span>
                            <h3>{/* actor.Summary */}</h3>
                            <ul className="ffo-actor-list">
                                {/* FOREACH: var capability in actor.Capabilities */}
{
                                    <li>{/* capability */}</li>
                                }
                            </ul>
                        </div>
                    </div>
                }
            </div>
        </div>
    </section>
</div>

        </>
    );
};

export default IndexGuestjsx;
