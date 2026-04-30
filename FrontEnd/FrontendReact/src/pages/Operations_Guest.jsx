import React from 'react';

const OperationsGuestjsx = () => {
    return (
        <>
            {/* model */} PortalHubViewModel
{/* RAZOR BLOCK: 
    ViewData["Title"] = "Vận hành";
 */}

<section className="section-top ffo-page-banner">
    <div className="container">
        <div className="col-lg-10 offset-lg-1 col-xs-12 text-center">
            <div className="section-top-title wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.3s" data-wow-offset="0">
                <h1>Chức năng theo vai trò</h1>
                <p>Khách, Cầu thủ, Đội trưởng, Chủ sân và Quản trị viên được gom về một ma trận vai trò để dễ phát triển tiếp.</p>
            </div>
        </div>
    </div>
</section>

<section className="section-padding">
    <div className="container">
        <div className="row">
            {/* RAZOR BLOCK:  var delay = 0.1;  */}
            {/* FOREACH: var actor in Model.ActorCapabilities */}
{
                <div className="col-lg-4 col-sm-6 col-xs-12 wow fadeInUp" data-wow-delay="{/* (delay)s */}" style={{ marginBottom: '30px' }}>
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
                { delay += 0.15; }
            }
        </div>
    </div>
</section>

        </>
    );
};

export default OperationsGuestjsx;
