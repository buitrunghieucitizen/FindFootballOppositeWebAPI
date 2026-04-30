import React from 'react';

const MatchesGuestjsx = () => {
    return (
        <>
            {/* model */} PortalHubViewModel
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Trận đấu";
 */}

<section className="section-top ffo-page-banner">
    <div className="container">
        <div className="col-lg-10 offset-lg-1 col-xs-12 text-center">
            <div className="section-top-title wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.3s" data-wow-offset="0">
                <h1>Gà đối, bình chọn điểm danh & xử lý hủy kèo</h1>
                <p>Màn hình này mô tả luồng trận đấu, bình chọn trước trận và quy trình hủy kèo giữa hai đội.</p>
            </div>
        </div>
    </div>
</section>

<section className="section-padding">
    <div className="container">
        <div className="section-title text-center wow zoomIn">
            <h2>Bảng kèo</h2>
            <div></div>
        </div>
        <div className="row">
            {/* FOREACH: var match in Model.Matches */}
{
                <div className="col-lg-6 col-sm-12 col-xs-12 wow fadeInUp">
                    <div className="ffo-match-card">
                        <span className="ffo-status">{/* match.MatchStatus */}</span>
                        <h3>{/* match.HomeTeamName */} vs {/* match.AwayTeamName */}</h3>
                        <div className="ffo-match-meta"><i className="fa fa-calendar" style={{ marginRight: '6px' }}></i>{/* match.KickoffLabel */}</div>
                        <ul className="ffo-mini-list">
                            <li>{/* match.VenueLabel */}</li>
                            <li>{/* match.BookingSummary */}</li>
                            <li>{/* match.AttendanceSummary */}</li>
                            <li>{/* match.CancelFlowSummary */}</li>
                        </ul>
                    </div>
                </div>
            }
        </div>
    </div>
</section>

<section className="section-padding" style={{ background: 'var(--ffo-bg)' }}>
    <div className="container">
        <div className="row">
            <div className="col-lg-6 col-sm-12 col-xs-12 wow fadeInLeft" style={{ marginBottom: '30px' }}>
                <div className="ffo-info-card">
                    <span className="ffo-status">Bình chọn trận</span>
                    <h3>Đội trưởng quản lý bình chọn trước trận</h3>
                    <ul className="ffo-mini-list">
                        <li>Tạo bình chọn cho từng thành viên trong đội</li>
                        <li>Có mặt / Vắng mặt / Chưa phản hồi</li>
                        <li>Đẩy tin tuyển quân khi đội thiếu người</li>
                    </ul>
                </div>
            </div>
            <div className="col-lg-6 col-sm-12 col-xs-12 wow fadeInRight" style={{ marginBottom: '30px' }}>
                <div className="ffo-info-card">
                    <span className="ffo-status ffo-status-alt">Quy trình hủy kèo</span>
                    <h3>Hủy kèo cần lý do và đối thủ xác nhận</h3>
                    <ul className="ffo-mini-list">
                        <li>Lưu lại đội khởi tạo yêu cầu hủy</li>
                        <li>Ghi nhận lý do hủy kèo</li>
                        <li>Chủ sân mở lại slot nếu lịch đã được khóa</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

        </>
    );
};

export default MatchesGuestjsx;
