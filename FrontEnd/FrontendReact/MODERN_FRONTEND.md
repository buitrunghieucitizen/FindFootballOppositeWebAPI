# Modern Frontend - FindFootball

## 🚀 Cấu Trúc & Cải Tiến

Frontend hiện đại đã được xây dựng với:
- ✅ **Tailwind CSS** - Modern responsive design
- ✅ **React Context API** - State management
- ✅ **Axios** - HTTP client with interceptors
- ✅ **React Router** - Client-side routing
- ✅ **Reusable Components** - Button, Input, Card, Alert, Table, Loading

## 📁 Cấu Trúc Folder

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Card.jsx
│   ├── Alert.jsx
│   ├── Table.jsx
│   ├── Loading.jsx
│   ├── ProtectedRoute.jsx
│   └── index.js
├── contexts/            # React Context
│   └── AuthContext.jsx
├── services/            # API services
│   ├── apiClient.js     # Axios instance
│   ├── authService.js   # Authentication
│   └── adminService.js  # Admin operations
├── pages/               # Page components
│   ├── Home.jsx         # New modern home
│   ├── Login.jsx        # New modern login
│   ├── Register.jsx     # New modern register
│   ├── AdminDashboard.jsx # New admin dashboard
│   └── ... (legacy pages)
├── App.jsx
├── main.jsx
└── index.css
```

## 🔧 Các Tính Năng Chính

### 1. Authentication
- Login/Register với JWT tokens
- Protected routes
- Auto-redirect nếu token hết hạn
- Local storage persistence

### 2. API Integration
- Centralized API client với Axios
- Request/Response interceptors
- Auto-attach JWT tokens
- Error handling

### 3. Admin Dashboard
- Quản lý Users, Teams, Stadiums, Matches
- Real-time data loading
- CRUD operations
- Role-based access control

### 4. Modern UI
- Tailwind CSS styling
- Responsive design
- Loading states
- Error alerts
- Icons từ react-icons

## ⚙️ Cấu Hình API

API Base URL: `http://localhost:5000/api`

Cập nhật trong file `src/services/apiClient.js` nếu cần thay đổi:
```javascript
const API_URL = 'http://localhost:5000/api';
```

## 🔗 Endpoints Được Hỗ Trợ

### Account API (`/api/account`)
- `POST /login` - Đăng nhập
- `POST /register` - Đăng ký

### Admin API (`/api/admin`)
- **Users**: `/users`, `/user/:id`, `/createuser`, `/edituser/:id`, `/deleteuser/:id`
- **Teams**: `/teams`, `/team/:id`, `/createteam`, `/editteam/:id`, `/deleteteam/:id`
- **Stadiums**: `/stadiums`, `/stadium/:id`, `/createstadium`, `/editstadium/:id`, `/deletestadium/:id`
- **Matches**: `/matches`, `/match/:id`, `/creatematch`, `/editmatch/:id`, `/deletematch/:id`

## 🚀 Chạy Project

```bash
# Installation
npm install

# Development
npm run dev

# Build for production
npm run build

# Preview build
npm run preview

# Linting
npm lint
```

## 📝 Available Routes

### Public Routes
- `/` - Home page (Modern)
- `/login` - Login page (Modern)
- `/register` - Register page (Modern)

### Protected Routes (Admin Only)
- `/admin-dashboard` - Admin dashboard (Modern)

### Legacy Routes (Keep for compatibility)
- `/legacy-home` - Original home
- `/teams`, `/stadiums`, `/matches` - Guest pages
- `/admin/users`, `/admin/teams`, etc.

## 🎨 Component Usage Examples

### Button
```jsx
import { Button } from '../components';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

### Input
```jsx
<Input 
  label="Email"
  type="email"
  error={errors.email}
  required
/>
```

### Alert
```jsx
<Alert 
  type="error" 
  title="Error" 
  message="Something went wrong"
/>
```

### Table
```jsx
<Table
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' }
  ]}
  data={users}
  actions={(row) => [
    <Button onClick={() => edit(row)}>Edit</Button>
  ]}
/>
```

## 🔐 Authentication Flow

1. User login at `/login`
2. Send credentials to `/api/account/login`
3. Receive JWT token
4. Store token in localStorage
5. Token auto-attached to all API requests
6. If token expires → redirect to login

## 📦 Dependencies

- `react` - UI framework
- `react-dom` - React rendering
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - CSS framework
- `react-icons` - Icon library

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 5175
```

### CORS Issues
Ensure backend CORS is configured for `http://localhost:5173` and `http://localhost:5174`

### API Connection Error
Check backend is running at `http://localhost:5000`
Verify API_URL in `src/services/apiClient.js`

## 📞 Support

For issues or questions, check:
- Backend API running
- API URL configuration
- Network tab in DevTools
- Console errors

---

**Created**: April 2026
**Version**: 1.0.0
