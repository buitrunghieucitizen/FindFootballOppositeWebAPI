import React from 'react';

const StadiumsGuestjsx = () => {
    return (
        <>
            {/* model */} PortalHubViewModel
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Sân bóng";
 */}

<section className="section-top ffo-page-banner">
    <div className="container">
        <div className="col-lg-10 offset-lg-1 col-xs-12 text-center">
            <div className="section-top-title wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.3s" data-wow-offset="0">
                <h1>Sân bóng, sân con & lịch đặt cố định</h1>
                <p>Chủ sân quản lý cụm sân, đội trưởng xem lịch trống và đặt lịch cố định hàng tuần.</p>
            </div>
        </div>
    </div>
</section>

<section className="template_property section-padding">
    <div className="container">
        <div className="section-title text-center wow zoomIn">
            <h2>Danh sách sân</h2>
            <div></div>
        </div>
        <div className="row">
            {/* FOREACH: var stadium in Model.Stadiums */}
{
                {/* FOREACH: var pitch in stadium.Pitches */}
{
                    <div className="col-lg-4 col-sm-12 col-xs-12 wow fadeInUp">
                        <div className="single_property ffo-single-property">
                            <div style={{ overflow: 'hidden' }}>
                                <img src="~/assets/img/property/{/* ((pitch.PitchId */} % 6) + 1).jpg" className="img-fluid" alt="{/* pitch.PitchName */}" />
                            </div>
                            <div className="single_property_description text-center">
                                <span><i className="fa fa-map-marker"></i> {/* stadium.StadiumName */}</span>
                                <span><i className="fa fa-futbol-o"></i> Sân {/* pitch.PitchSize */} người</span>
                                <span><i className="fa fa-clock-o"></i> {/* pitch.AvailabilityLabel */}</span>
                            </div>
                            <div className="single_property_content">
                                <h4><a href="#">{/* pitch.PitchName */}</a></h4>
                                <p>{/* stadium.Description */}</p>
                                <ul className="ffo-mini-list">
                                    <li>Chủ sân: {/* stadium.OwnerName */}</li>
                                    <li>Địa chỉ: {/* stadium.Address */}</li>
                                    <li>{/* stadium.UtilizationLabel */}</li>
                                </ul>
                            </div>
                            <div className="single_property_price">
                                Giá đặt sân <span>{/* pitch.PricePerHour.ToString( */}"N0") VNĐ / giờ</span>
                            </div>
                        </div>
                    </div>
                }
            }
        </div>
    </div>
</section>

<section className="section-padding" style={{ background: 'var(--ffo-bg)' }}>
    <div className="container">
        <div className="row">
            <div className="col-lg-6 col-sm-12 col-xs-12 wow fadeInLeft" style={{ marginBottom: '30px' }}>
                <div className="ffo-info-card">
                    <span className="ffo-status">Lịch cố định</span>
                    <h3>Đặt sân hàng tuần</h3>
                    <ul className="ffo-mini-list">
                        {/* FOREACH: var booking in Model.RecurringBookings */}
{
                            <li>{/* booking.TeamName */} — {/* booking.PitchName */} — {/* booking.WeeklySlot */} — {/* booking.DateRange */}</li>
                        }
                    </ul>
                </div>
            </div>
            <div className="col-lg-6 col-sm-12 col-xs-12 wow fadeInRight" style={{ marginBottom: '30px' }}>
                <div className="ffo-info-card">
                    <span className="ffo-status ffo-status-alt">Lịch sân</span>
                    <h3>Lịch ngắn hạn</h3>
                    <ul className="ffo-mini-list">
                        {/* FOREACH: var schedule in Model.UpcomingSchedules */}
{
                            <li>{/* schedule.PitchName */} — {/* schedule.WindowLabel */} — {/* schedule.BookedByName */} — {/* schedule.Status */}</li>
                        }
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

        </>
    );
};

export default StadiumsGuestjsx;
