import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Modern Pages
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

// Legacy Pages (keeping for backward compatibility)
import AdminAdmin from './pages/Admin_Admin';
import CaptainCaptain from './pages/Captain_Captain';
import CreateMatchAdmin from './pages/CreateMatch_Admin';
import CreateStadiumAdmin from './pages/CreateStadium_Admin';
import CreateTeamAdmin from './pages/CreateTeam_Admin';
import CreateUserAdmin from './pages/CreateUser_Admin';
import EditMatchAdmin from './pages/EditMatch_Admin';
import EditStadiumAdmin from './pages/EditStadium_Admin';
import EditTeamAdmin from './pages/EditTeam_Admin';
import EditUserAdmin from './pages/EditUser_Admin';
import EditUserRoleAdmin from './pages/EditUserRole_Admin';
import ErrorShared from './pages/Error_Shared';
import IndexAdmin from './pages/Index_Admin';
import IndexGuest from './pages/Index_Guest';
import LoginAuthentication from './pages/Login_Authentication';
import MatchesAdmin from './pages/Matches_Admin';
import MatchesGuest from './pages/Matches_Guest';
import OperationsGuest from './pages/Operations_Guest';
import PrivacyGuest from './pages/Privacy_Guest';
import RecruitmentGuest from './pages/Recruitment_Guest';
import RegisterAuthentication from './pages/Register_Authentication';
import StadiumDetailsAdmin from './pages/StadiumDetails_Admin';
import StadiumOwnerStadiumOwner from './pages/StadiumOwner_StadiumOwner';
import StadiumsAdmin from './pages/Stadiums_Admin';
import StadiumsGuest from './pages/Stadiums_Guest';
import TeamsAdmin from './pages/Teams_Admin';
import TeamsGuest from './pages/Teams_Guest';
import UsersAdmin from './pages/Users_Admin';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Modern Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Legacy Guest Routes */}
        <Route path="/legacy-home" element={<IndexGuest />} />
        <Route path="/teams" element={<TeamsGuest />} />
        <Route path="/stadiums" element={<StadiumsGuest />} />
        <Route path="/matches" element={<MatchesGuest />} />
        <Route path="/recruitment" element={<RecruitmentGuest />} />
        <Route path="/operations" element={<OperationsGuest />} />
        <Route path="/privacy" element={<PrivacyGuest />} />

        {/* Legacy Admin Routes */}
        <Route path="/legacy-admin-dashboard" element={<IndexAdmin />} />
        <Route path="/admin/overview" element={<AdminAdmin />} />
        <Route path="/admin/users" element={<UsersAdmin />} />
        <Route path="/admin/users/create" element={<CreateUserAdmin />} />
        <Route path="/admin/users/:id/edit" element={<EditUserAdmin />} />
        <Route path="/admin/users/:id/roles" element={<EditUserRoleAdmin />} />
        <Route path="/admin/teams" element={<TeamsAdmin />} />
        <Route path="/admin/teams/create" element={<CreateTeamAdmin />} />
        <Route path="/admin/teams/:id/edit" element={<EditTeamAdmin />} />
        <Route path="/admin/stadiums" element={<StadiumsAdmin />} />
        <Route path="/admin/stadiums/create" element={<CreateStadiumAdmin />} />
        <Route path="/admin/stadiums/:id" element={<StadiumDetailsAdmin />} />
        <Route path="/admin/stadiums/:id/edit" element={<EditStadiumAdmin />} />
        <Route path="/admin/matches" element={<MatchesAdmin />} />
        <Route path="/admin/matches/create" element={<CreateMatchAdmin />} />
        <Route path="/admin/matches/:id/edit" element={<EditMatchAdmin />} />

        <Route path="/stadium-owner" element={<StadiumOwnerStadiumOwner />} />
        <Route path="/captain" element={<CaptainCaptain />} />

        {/* Error Route */}
        <Route path="*" element={<ErrorShared />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
