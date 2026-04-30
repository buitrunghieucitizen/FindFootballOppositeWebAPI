import React from 'react';

const LoginAuthenticationjsx = () => {
    return (
        <>
            {/* RAZOR BLOCK: 
    ViewData["Title"] = "Đăng nhập";
 */}

<section className="section-top ffo-page-banner">
    <div className="container">
        <div className="col-lg-10 offset-lg-1 col-xs-12 text-center">
            <div className="section-top-title wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.3s" data-wow-offset="0">
                <h1>Đăng nhập</h1>
                <p>Đăng nhập để quản lý đội bóng, đặt sân và tham gia các trận đấu.</p>
            </div>
        </div>
    </div>
</section>

<section className="ffo-auth-section">
    <div className="ffo-auth-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#0ea5e9)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa fa-futbol-o" style={{ color: '#fff', fontSize: '28px' }}></i>
            </div>
        </div>
        <h2>Chào mừng trở lại!</h2>
        <p className="ffo-auth-subtitle">Nhập thông tin tài khoản để tiếp tục</p>

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

        <form method="post" asp-action="Login" asp-controller="Account">
            {/* Html.AntiForgeryToken() */}
            <div className="ffo-form-group">
                <label htmlFor="login-username"><i className="fa fa-user" style={{ marginRight: '6px', color: '#0d9488' }}></i>Tên đăng nhập</label>
                <input type="text" id="login-username" name="username" placeholder="Nhập tên đăng nhập" required />
            </div>
            <div className="ffo-form-group">
                <label htmlFor="login-password"><i className="fa fa-lock" style={{ marginRight: '6px', color: '#0d9488' }}></i>Mật khẩu</label>
                <input type="password" id="login-password" name="password" placeholder="Nhập mật khẩu" required />
            </div>
            <div className="ffo-form-group">
                <label htmlFor="login-role"><i className="fa fa-id-badge" style={{ marginRight: '6px', color: '#0d9488' }}></i>Đăng nhập dưới vai trò</label>
                <select id="login-role" name="userRole" required>
                    <option value="" disabled selected>-- Chọn vai trò --</option>
                    <option value="Admin">Quản trị viên</option>
                    <option value="StadiumOwner">Chủ sân</option>
                    <option value="Captain">Đội trưởng</option>
                    <option value="Player">Cầu thủ</option>
                </select>
            </div>
            <button type="submit" className="ffo-auth-btn">
                <i className="fa fa-sign-in" style={{ marginRight: '8px' }}></i>Đăng nhập
            </button>
        </form>
        <div className="ffo-auth-footer-link">
            Chưa có tài khoản? <a asp-controller="Account" asp-action="Register">Đăng ký ngay</a>
        </div>
    </div>
</section>

        </>
    );
};

export default LoginAuthenticationjsx;
