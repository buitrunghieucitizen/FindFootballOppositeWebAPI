import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import { NotificationProvider } from './contexts/NotificationContext';
import FeedbackButton from './components/FeedbackButton';

// Modern Pages
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AdminHome from './pages/AdminDashboard';
import CaptainHome from './pages/CaptainDashboard';
import ManageTournament_Captain from './pages/captain/ManageTournament_Captain';
import ManageTournament_Owner from './pages/owner/ManageTournament_Owner';
import StadiumOwnerHome from './pages/StadiumOwnerDashboard';
import PlayerHome from './pages/PlayerDashboard';
import PaymentSuccess from './pages/common/PaymentSuccess';
import PublicTeams from './pages/common/PublicTeams';
import PublicStadiums from './pages/common/PublicStadiums';
import PublicMatches from './pages/common/PublicMatches';
import MatchDetail from './pages/common/MatchDetail';
import PublicTournaments from './pages/common/PublicTournaments';
import TournamentDetail from './pages/common/TournamentDetail';
import PublicRecruitments from './pages/common/PublicRecruitments';
import PublicRankings from './pages/PublicRankings';
import { useAuth } from './contexts/AuthContext';

function ProfileRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'Admin': return <Navigate to="/admin-home?tab=profile" replace />;
    case 'Captain': return <Navigate to="/captain-home?tab=profile" replace />;
    case 'StadiumOwner': return <Navigate to="/owner-home?tab=profile" replace />;
    case 'Player': return <Navigate to="/player-home?tab=profile" replace />;
    default: return <Navigate to="/" replace />;
  }
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <Routes>
            {/* Modern Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/teams" element={<PublicTeams />} />
            <Route path="/stadiums" element={<PublicStadiums />} />
            <Route path="/matches" element={<PublicMatches />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/tournaments" element={<PublicTournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/recruitments" element={<PublicRecruitments />} />
            <Route path="/rankings" element={<PublicRankings />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentSuccess />} />
            {/* Admin Home */}
            <Route
              path="/admin-home"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            {/* Backward compat redirect */}
            <Route path="/admin-dashboard" element={<Navigate to="/admin-home" replace />} />

            {/* Captain Home */}
            <Route
              path="/captain-home"
              element={
                <ProtectedRoute requiredRole="Captain">
                  <CaptainHome />
                </ProtectedRoute>
              }
            />
            <Route path="/captain-dashboard" element={<Navigate to="/captain-home" replace />} />
            <Route
              path="/captain/tournaments/:id/manage"
              element={
                <ProtectedRoute requiredRole="Captain">
                  <ManageTournament_Captain />
                </ProtectedRoute>
              }
            />

            {/* StadiumOwner Home */}
            <Route
              path="/owner-home"
              element={
                <ProtectedRoute requiredRole="StadiumOwner">
                  <StadiumOwnerHome />
                </ProtectedRoute>
              }
            />
            <Route path="/stadium-owner-dashboard" element={<Navigate to="/owner-home" replace />} />
            <Route path="/stadium-owner-home" element={<Navigate to="/owner-home" replace />} />
            <Route
              path="/owner/tournaments/:id/manage"
              element={
                <ProtectedRoute requiredRole="StadiumOwner">
                  <ManageTournament_Owner />
                </ProtectedRoute>
              }
            />

            {/* Player Home */}
            <Route
              path="/player-home"
              element={
                <ProtectedRoute requiredRole="Player">
                  <PlayerHome />
                </ProtectedRoute>
              }
            />

            {/* Common Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileRedirect />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FeedbackButton />
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
