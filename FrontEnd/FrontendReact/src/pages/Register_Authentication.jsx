import React from 'react';

const RegisterAuthenticationjsx = () => {
    return (
        <>
            {/* RAZOR BLOCK: 
    ViewData["Title"] = "Đăng ký";
 */}

<section className="section-top ffo-page-banner">
    <div className="container">
        <div className="col-lg-10 offset-lg-1 col-xs-12 text-center">
            <div className="section-top-title wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.3s" data-wow-offset="0">
                <h1>Đăng ký tài khoản</h1>
                <p>Tạo tài khoản để tham gia đội bóng, đặt sân và kết nối với cộng đồng bóng đá phủi.</p>
            </div>
        </div>
    </div>
</section>

<section className="ffo-auth-section">
    <div className="ffo-auth-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa fa-user-plus" style={{ color: '#fff', fontSize: '26px' }}></i>
            </div>
        </div>
        <h2>Tạo tài khoản mới</h2>
        <p className="ffo-auth-subtitle">Điền thông tin bên dưới để bắt đầu</p>

        {/* if */} (ViewData.ModelState.Any(x => x.Value.Errors.Any()))
        {
            <div style={{ background: 'linear-gradient(135deg,#fef2f2,#fff1f2)', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', textAlign: 'left' }}>
                {/* FOREACH: var modelState in ViewData.ModelState.Values */}
{
                    {/* FOREACH: var error in modelState.Errors */}
{
                        <p style={{ margin: '0', color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>
                            <i className="fa fa-exclamation-circle" style={{ marginRight: '6px' }}></i>{/* error.ErrorMessage */}
                        </p>
                    }
                }
            </div>
        }

        <form method="post" asp-action="Register" asp-controller="Account">
            {/* Html.AntiForgeryToken() */}
            <div className="ffo-form-group">
                <label htmlFor="register-fullname"><i className="fa fa-id-card" style={{ marginRight: '6px', color: '#0d9488' }}></i>Họ và tên</label>
                <input type="text" id="register-fullname" name="fullName" placeholder="Nhập họ và tên đầy đủ" required />
            </div>
            <div className="ffo-form-group">
                <label htmlFor="register-username"><i className="fa fa-user" style={{ marginRight: '6px', color: '#0d9488' }}></i>Tên đăng nhập</label>
                <input type="text" id="register-username" name="username" placeholder="Nhập tên đăng nhập" required />
            </div>
            <div className="ffo-form-group">
                <label htmlFor="register-phone"><i className="fa fa-phone" style={{ marginRight: '6px', color: '#0d9488' }}></i>Số điện thoại</label>
                <input type="text" id="register-phone" name="phone" placeholder="Nhập số điện thoại" required />
            </div>
            <div className="ffo-form-group">
                <label htmlFor="register-role"><i className="fa fa-id-badge" style={{ marginRight: '6px', color: '#0d9488' }}></i>Vai trò</label>
                <select id="register-role" name="userRole" required>
                    <option value="Player">Cầu thủ</option>
                    <option value="Captain">Đội trưởng</option>
                </select>
            </div>
            <div className="ffo-form-group">
                <label htmlFor="register-password"><i className="fa fa-lock" style={{ marginRight: '6px', color: '#0d9488' }}></i>Mật khẩu</label>
                <input type="password" id="register-password" name="password" placeholder="Nhập mật khẩu" required />
            </div>
            <div className="ffo-form-group">
                <label htmlFor="register-confirmPassword"><i className="fa fa-check-circle" style={{ marginRight: '6px', color: '#0d9488' }}></i>Xác nhận mật khẩu</label>
                <input type="password" id="register-confirmPassword" name="confirmPassword" placeholder="Xác nhận mật khẩu" required />
            </div>
            <button type="submit" className="ffo-auth-btn">
                <i className="fa fa-user-plus" style={{ marginRight: '8px' }}></i>Đăng ký
            </button>
        </form>
        <div className="ffo-auth-footer-link">
            Đã có tài khoản? <a asp-controller="Account" asp-action="Login">Đăng nhập ngay</a>
        </div>
    </div>
</section>

        </>
    );
};

export default RegisterAuthenticationjsx;
