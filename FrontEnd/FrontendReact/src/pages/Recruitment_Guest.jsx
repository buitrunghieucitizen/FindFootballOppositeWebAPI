import React from 'react';

const RecruitmentGuestjsx = () => {
    return (
        <>
            {/* model */} PortalHubViewModel
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Tuyển quân";
 */}

<section className="section-top ffo-page-banner">
    <div className="container">
        <div className="col-lg-10 offset-lg-1 col-xs-12 text-center">
            <div className="section-top-title wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.3s" data-wow-offset="0">
                <h1>Tuyển thành viên và cầu thủ đá bù</h1>
                <p>Đội trưởng đăng bài tuyển quân, cầu thủ bật trạng thái tự do để được tìm thấy nhanh khi đội thiếu người.</p>
            </div>
        </div>
    </div>
</section>

<section className="blog_area section-padding">
    <div className="container">
        <div className="section-title text-center wow zoomIn">
            <h2>Tin tuyển quân</h2>
            <div></div>
        </div>
        <div className="row">
            {/* FOREACH: var ad in Model.RecruitmentAds */}
{
                <div className="col-lg-6 col-sm-12 col-xs-12 wow fadeInUp" style={{ marginBottom: '30px' }}>
                    <div className="single_blog">
                        <div style={{ overflow: 'hidden' }}>
                            <img src="~/assets/img/blog/blog-{/* ((ad.AdId */} % 3) + 1).jpg" className="img-fluid" alt="{/* ad.Title */}" />
                        </div>
                        <div className="blog_content">
                            <h3><a href="#">{/* ad.Title */}</a></h3>
                            <p>{/* ad.Content */}</p>
                            <ul className="ffo-mini-list">
                                <li>Đội: {/* ad.TeamName */}</li>
                                <li>Vị trí cần: {/* ad.PositionNeeded */}</li>
                                <li>Cho trận: {/* ad.MatchLabel */}</li>
                                <li>Mức độ: {/* ad.UrgencyLabel */}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            }
        </div>
    </div>
</section>

<section className="our_team section-padding" style={{ background: 'var(--ffo-bg)' }}>
    <div className="container">
        <div className="section-title text-center wow zoomIn">
            <h2>Danh sách cầu thủ tự do</h2>
            <div></div>
        </div>
        <div className="row text-center">
            {/* foreach */} (var player in Model.Players.Where(player => player.IsFreeAgent))
            {
                <div className="col-lg-4 col-sm-6 col-xs-12 wow fadeInUp">
                    <div className="single_team ffo-single-team">
                        <div style={{ overflow: 'hidden' }}>
                            <img src="~/assets/img/team/{/* ((player.UserId */} % 4) + 1).png" className="img-fluid" alt="{/* player.FullName */}" />
                        </div>
                        <h3>{/* player.FullName */}</h3>
                        <p>{/* player.PreferredPosition */}</p>
                        <ul className="ffo-mini-list text-left mt-3" style={{ padding: '0 20px 20px' }}>
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

export default RecruitmentGuestjsx;
