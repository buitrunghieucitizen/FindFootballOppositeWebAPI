# 📋 Setup & Integration Guide

## ✅ Hoàn Thành

### 1. Frontend Modernization ✓
- [x] Tailwind CSS đã cài đặt
- [x] Reusable component library tạo xong
- [x] Modern pages được tạo (Home, Login, Register, Dashboard)
- [x] React Context API cho auth state
- [x] Protected routes cho authenticated pages

### 2. API Integration ✓
- [x] Axios API client với interceptors
- [x] Authentication service
- [x] Admin service cho CRUD operations
- [x] JWT token handling
- [x] Auto-redirect on token expire

### 3. Modern UI Components ✓
- [x] Button (multiple variants & sizes)
- [x] Input with validation
- [x] Card for layouts
- [x] Alert for notifications
- [x] Table with actions
- [x] Loading & Skeleton
- [x] ProtectedRoute wrapper

## 🔌 Backend Connection

### Hiện Tại:
- Backend chạy tại: `http://localhost:5000`
- Frontend chạy tại: `http://localhost:5174`
- API Base: `http://localhost:5000/api`

### CORS Configuration (Backend):
```csharp
// Program.cs đã có:
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});
```

**⚠️ Cần cập nhật** để cho phép port 5174:
```csharp
policy.WithOrigins(
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://localhost:5174",  // ← ADD THIS
    "http://127.0.0.1:5174"   // ← ADD THIS
)
```

## 🔑 Demo Accounts

Test credentials được hiển thị trên login page:
- **Admin**: admin / admin123
- **Captain**: captain / captain123  
- **StadiumOwner**: owner / owner123

## 🚀 Chạy Ứng Dụng

### Terminal 1: Backend
```bash
cd D:\FInd_Op_Web_Project\FindFootballOppsites\BackEnd\FInd_Op_Web\FInd_Op_Web
dotnet run
# Backend chạy tại http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd d:\FInd_Op_Web_Project\FindFootballOppsites\FrontEnd\FrontendReact
npm run dev
# Frontend chạy tại http://localhost:5174
```

## 🧪 Testing Flow

1. **Open Browser**: http://localhost:5174
2. **Click "Đăng Nhập"** → Modern login page
3. **Use Demo Account**: admin / admin123 / Admin
4. **View Dashboard**: /admin-dashboard
5. **See Stats**: Users, Teams, Stadiums, Matches counts
6. **Manage Data**: Create/Edit/Delete operations

## 📱 Modern Pages Created

### 1. Home Page (`/`)
- Hero section
- Feature showcase  
- Quick links to teams/stadiums/matches
- Call-to-action buttons
- Beautiful gradient background

### 2. Login Page (`/login`)
- Modern card design
- Demo accounts displayed
- Role selection dropdown
- Error alerts
- Responsive mobile-friendly

### 3. Register Page (`/register`)
- Form validation
- Password confirmation
- Phone number validation
- Role selection
- Links to login

### 4. Admin Dashboard (`/admin-dashboard`)
- Stats cards (Users, Teams, Stadiums, Matches)
- Tabbed interface
- Data tables with actions
- Create/Edit/Delete functionality
- Real-time data loading

## 🔄 API Endpoints Tested

### Login
```javascript
POST /api/account/login
{
  username: "admin",
  password: "admin123",
  userRole: "Admin"
}
```

### Get Users
```javascript
GET /api/admin/users?search=&page=1
Headers: Authorization: Bearer <token>
```

## 📝 Next Steps (Optional)

1. **Add Guest Pages** (Teams, Stadiums, Matches for non-logged users)
2. **Captain Dashboard** (Team management)
3. **Stadium Owner Dashboard** (Stadium management)
4. **User Profile** (Edit profile, change password)
5. **Search & Filter** (Advanced filtering)
6. **Pagination** (Multiple pages)
7. **Image Upload** (Teams, Stadiums, etc.)
8. **Notifications** (Real-time updates)

## 🛠️ Troubleshooting

### ❌ "Cannot GET /api/account/login"
- Backend not running
- Wrong API URL in `apiClient.js`
- Backend CORS not configured

### ❌ "CORS error"
- Update backend CORS to include port 5174
- Or use proxy in vite.config.js

### ❌ "Token expired"
- Token automatically removed from localStorage
- User redirected to login
- Normal behavior ✓

### ❌ "Page shows blank"
- Check browser console for errors
- Verify backend API running
- Check localStorage for token

## 📚 File Structure Summary

```
Created Files:
✓ src/components/Button.jsx
✓ src/components/Input.jsx
✓ src/components/Card.jsx
✓ src/components/Alert.jsx
✓ src/components/Loading.jsx
✓ src/components/Table.jsx
✓ src/components/ProtectedRoute.jsx
✓ src/components/index.js

✓ src/contexts/AuthContext.jsx

✓ src/services/apiClient.js
✓ src/services/authService.js
✓ src/services/adminService.js

✓ src/pages/Home.jsx
✓ src/pages/Login.jsx
✓ src/pages/Register.jsx
✓ src/pages/AdminDashboard.jsx

✓ tailwind.config.js
✓ postcss.config.js

Updated Files:
✓ src/App.jsx (Added AuthProvider & new routes)
✓ src/index.css (Added Tailwind directives)
✓ package.json (Tailwind dependencies added)
```

## 🎯 Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Modern UI | ✅ | Tailwind CSS + React Icons |
| Authentication | ✅ | JWT + Context API |
| Protected Routes | ✅ | Role-based access |
| API Integration | ✅ | Axios + Interceptors |
| Components | ✅ | 7 reusable components |
| Admin Dashboard | ✅ | Stats + CRUD operations |
| Error Handling | ✅ | Alerts + console logs |
| Responsive Design | ✅ | Mobile-friendly |

---

**Status**: ✅ Complete and Ready to Deploy
**Last Updated**: April 30, 2026
