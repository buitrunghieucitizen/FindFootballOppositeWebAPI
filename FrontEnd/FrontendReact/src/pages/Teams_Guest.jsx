import React from 'react';

const TeamsGuestjsx = () => {
    return (
        <>
            {/* model */} PortalHubViewModel
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Đội bóng";
 */}

<section className="section-top ffo-page-banner">
    <div className="container">
        <div className="col-lg-10 offset-lg-1 col-xs-12 text-center">
            <div className="section-top-title wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.3s" data-wow-offset="0">
                <h1>Quản lý đội bóng & cầu thủ tự do</h1>
                <p>Đội trưởng duyệt thành viên, cầu thủ tìm đội, và hệ thống gom danh sách cầu thủ đang rảnh.</p>
            </div>
        </div>
    </div>
</section>

<section className="our_team section-padding">
    <div className="container">
        <div className="section-title text-center wow zoomIn">
            <h2>Danh sách đội bóng</h2>
            <div></div>
        </div>
        <div className="row text-center">
            {/* FOREACH: var team in Model.Teams */}
{
                <div className="col-lg-4 col-sm-6 col-xs-12 wow fadeInUp">
                    <div className="single_team ffo-single-team">
                        <div style={{ overflow: 'hidden' }}>
                            <img src="~/assets/img/team/team-{/* ((team.TeamId */} % 4) + 1).jpg" className="img-fluid" alt="{/* team.TeamName */}" />
                        </div>
                        <h3>{/* team.TeamName */}</h3>
                        <p>{/* team.CaptainName */} — {/* team.QualityLevel */}</p>
                        <ul className="ffo-mini-list text-left mt-3" style={{ padding: '0 20px 20px' }}>
                            <li>{/* team.History */}</li>
                            <li>Khu vực: {/* team.HomeArea */}</li>
                            <li>{/* team.RecentForm */}</li>
                            <li>Thành viên: {/* string.Join( */}", ", team.Members)</li>
                        </ul>
                    </div>
                </div>
            }
        </div>
    </div>
</section>

<section className="section-padding" style={{ background: 'var(--ffo-bg)' }}>
    <div className="container">
        <div className="section-title text-center wow zoomIn">
            <h2>Cầu thủ tự do đang rảnh</h2>
            <div></div>
        </div>
        <div className="row">
            {/* foreach */} (var player in Model.Players.Where(player => player.IsFreeAgent))
            {
                <div className="col-lg-4 col-sm-6 col-xs-12 wow fadeInUp" style={{ marginBottom: '30px' }}>
                    <div className="ffo-info-card">
                        <span className="ffo-status ffo-status-alt">Cầu thủ tự do</span>
                        <h3>{/* player.FullName */}</h3>
                        <ul className="ffo-mini-list">
                            <li>Vị trí: {/* player.PreferredPosition */}</li>
                            <li>Khu vực: {/* player.ActiveArea */}</li>
                            <li>{/* player.AvailabilityNote */}</li>
                            <li>Vai trò: {/* string.Join( */}", ", player.Roles)</li>
                        </ul>
                    </div>
                </div>
            }
        </div>
    </div>
</section>

        </>
    );
};

export default TeamsGuestjsx;
