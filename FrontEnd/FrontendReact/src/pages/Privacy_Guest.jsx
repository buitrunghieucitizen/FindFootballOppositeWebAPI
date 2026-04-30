import React from 'react';

const PrivacyGuestjsx = () => {
    return (
        <>
            {/* RAZOR BLOCK: 
    ViewData["Title"] = "Cơ sở dữ liệu";
 */}

<section className="section-top ffo-page-banner">
    <div className="container">
        <div className="col-lg-10 offset-lg-1 col-xs-12 text-center">
            <div className="section-top-title wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.3s" data-wow-offset="0">
                <h1>Hướng dẫn cài đặt cơ sở dữ liệu</h1>
                <p>Trang này gom các bước thiết lập SQL Server và kết nối với project MVC.</p>
            </div>
        </div>
    </div>
</section>

<section className="section-padding">
    <div className="container">
        <div className="row">
            <div className="col-lg-6 col-sm-12 col-xs-12 wow fadeInLeft" style={{ marginBottom: '30px' }}>
                <div className="ffo-database-card">
                    <span className="ffo-status">Bước 1</span>
                    <h3>Tạo cơ sở dữ liệu</h3>
                    <ul className="ffo-mini-list">
                        <li>Mở SQL Server Management Studio</li>
                        <li>Chạy file <code>Database/FindFootballOpWeb_Database.sql</code></li>
                        <li>File này tự tạo database, bảng và dữ liệu mẫu</li>
                    </ul>
<pre>USE master;
GO
:r Database\FindFootballOpWeb_Database.sql</pre>
                </div>
            </div>
            <div className="col-lg-6 col-sm-12 col-xs-12 wow fadeInRight" style={{ marginBottom: '30px' }}>
                <div className="ffo-database-card">
                    <span className="ffo-status ffo-status-alt">Bước 2</span>
                    <h3>Cấu hình chuỗi kết nối</h3>
                    <ul className="ffo-mini-list">
                        <li>Dùng SQL Auth hoặc Windows Auth tùy máy của bạn</li>
                        <li>Sửa file <code>appsettings.Development.json</code></li>
                        <li>Tên database trong script là <code>FindFootballOppositeWeb</code></li>
                    </ul>
<pre>{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=FindFootballOppositeWeb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}</pre>
                </div>
            </div>
            <div className="col-lg-6 col-sm-12 col-xs-12 wow fadeInLeft" style={{ marginBottom: '30px' }}>
                <div className="ffo-database-card">
                    <span className="ffo-status">Bước 3</span>
                    <h3>Cách ứng dụng đang sử dụng dữ liệu</h3>
                    <ul className="ffo-mini-list">
                        <li>Hiện tại giao diện MVC đang đọc dữ liệu mẫu từ <code>Services/PortalDataService.cs</code></li>
                        <li>Bước tiếp theo là thay service này bằng repository đọc SQL thật</li>
                        <li>Frontend đã được thiết kế sẵn, bạn có thể code chức năng trên đó</li>
                    </ul>
                </div>
            </div>
            <div className="col-lg-6 col-sm-12 col-xs-12 wow fadeInRight" style={{ marginBottom: '30px' }}>
                <div className="ffo-database-card">
                    <span className="ffo-status ffo-status-alt">Bước 4</span>
                    <h3>Thứ tự nên làm tiếp</h3>
                    <ul className="ffo-mini-list">
                        <li>Kết nối SQL Server vào Users, Roles, Teams, Stadiums, Pitches</li>
                        <li>Làm xác thực và phân quyền vai trò</li>
                        <li>Làm CRUD đặt sân, lịch cố định, trận đấu, tuyển quân</li>
                        <li>Đẩy dữ liệu lên các trang giao diện hiện tại</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

        </>
    );
};

export default PrivacyGuestjsx;
