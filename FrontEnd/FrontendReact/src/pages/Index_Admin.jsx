import React from 'react';

const IndexAdminjsx = () => {
    return (
        <>
            {/* RAZOR BLOCK: 
    ViewData["Title"] = "Quản trị viên";
    Layout = "~/Views/Shared/_Layout.cshtml";
 */}

<section className="section-top ffo-page-banner">
    <div className="container">
        <div className="col-lg-10 offset-lg-1 col-xs-12 text-center">
            <div className="section-top-title wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.3s" data-wow-offset="0">
                <h1>Bảng điều khiển Quản trị viên</h1>
            </div>
        </div>
    </div>
</section>

<section className="section-padding">
    <div className="container">
        <div className="row">
            <div className="col-md-3">
                <div className="ffo-role-card">
                    <h3>Quản lý Người Dùng</h3>
                    <p>Phân quyền, cập nhật thông tin người dùng.</p>
                    <a href="{/* Url.Action( */}"Users", "Admin")" className="ffo-btn-primary mt-3">Quản lý ngay</a>
                </div>
            </div>
            <div className="col-md-3">
                <div className="ffo-role-card">
                    <h3>Quản lý Đội Bóng</h3>
                    <p>Tạo, sửa, xóa các đội bóng trong hệ thống.</p>
                    <a href="{/* Url.Action( */}"Teams", "Admin")" className="ffo-btn-primary mt-3">Quản lý ngay</a>
                </div>
            </div>
            <div className="col-md-3">
                <div className="ffo-role-card">
                    <h3>Quản lý Sân Bóng</h3>
                    <p>Xem danh sách, chi tiết thông tin sân bóng.</p>
                    <a href="{/* Url.Action( */}"Stadiums", "Admin")" className="ffo-btn-primary mt-3">Quản lý ngay</a>
                </div>
            </div>
            <div className="col-md-3">
                <div className="ffo-role-card">
                    <h3>Quản lý Trận Đấu</h3>
                    <p>Điều phối, tạo và cập nhật trận đấu.</p>
                    <a href="{/* Url.Action( */}"Matches", "Admin")" className="ffo-btn-primary mt-3">Quản lý ngay</a>
                </div>
            </div>
        </div>
    </div>
</section>

        </>
    );
};

export default IndexAdminjsx;
