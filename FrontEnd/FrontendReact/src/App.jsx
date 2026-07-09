import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import { NotificationProvider } from './contexts/NotificationContext';
import FeedbackButton from './components/FeedbackButton';
import OnboardingTour from './components/OnboardingTour';

// Modern Pages
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AdminHome from './pages/AdminDashboard';
import ProfilePage from './pages/common/ProfilePage';
import CaptainHome from './pages/CaptainDashboard';
import RateMatch_Captain from './pages/captain/RateMatch_Captain';
import CreateChallenge_Captain from './pages/captain/CreateChallenge_Captain';
import EditMatch_Captain from './pages/captain/EditMatch_Captain';
import CreateTournament_Captain from './pages/captain/CreateTournament_Captain';
import ManageTournament_Captain from './pages/captain/ManageTournament_Captain';
import BookStadium_Captain from './pages/captain/BookStadium_Captain';
import InviteOpponent_Captain from './pages/captain/InviteOpponent_Captain';
import ManageTournament_Owner from './pages/owner/ManageTournament_Owner';
import CreateTournament_Owner from './pages/owner/CreateTournament_Owner';
import EditTeam_Captain from './pages/captain/EditTeam_Captain';
import StadiumOwnerHome from './pages/StadiumOwnerDashboard';
import PlayerHome from './pages/PlayerDashboard';
import PaymentSuccess from './pages/common/PaymentSuccess';
import PublicTeams from './pages/common/PublicTeams';
import TeamDetail from './pages/common/TeamDetail';
import PublicStadiums from './pages/common/PublicStadiums';
import PublicMatches from './pages/common/PublicMatches';
import MatchDetail from './pages/common/MatchDetail';
import PublicTournaments from './pages/common/PublicTournaments';
import TournamentDetail from './pages/common/TournamentDetail';
import PublicRecruitments from './pages/common/PublicRecruitments';
import PublicRankings from './pages/PublicRankings';
import CommunityFeed from './pages/CommunityFeed';
import { useAuth } from './contexts/AuthContext';


function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <Routes>
            {/* Modern Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/teams" element={<PublicTeams />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/stadiums" element={<PublicStadiums />} />
            <Route path="/matches" element={<PublicMatches />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/tournaments" element={<PublicTournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/recruitments" element={<PublicRecruitments />} />
            <Route path="/rankings" element={<PublicRankings />} />
            <Route path="/feed" element={<CommunityFeed />} />
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
              path="/captain/matches/create"
              element={
                <ProtectedRoute requiredRole="Captain">
                  <CreateChallenge_Captain />
                </ProtectedRoute>
              }
            />
            <Route
              path="/captain/matches/:id/edit"
              element={
                <ProtectedRoute requiredRole="Captain">
                  <EditMatch_Captain />
                </ProtectedRoute>
              }
            />
            <Route
              path="/captain/team/edit"
              element={
                <ProtectedRoute requiredRole="Captain">
                  <EditTeam_Captain />
                </ProtectedRoute>
              }
            />
            <Route
              path="/captain/matches/:id/rate"
              element={
                <ProtectedRoute requiredRole="Captain">
                  <RateMatch_Captain />
                </ProtectedRoute>
              }
            />
            <Route
              path="/captain/match/book-stadium"
              element={
                <ProtectedRoute requiredRole="Captain">
                  <BookStadium_Captain />
                </ProtectedRoute>
              }
            />
            <Route
              path="/captain/match/invite"
              element={
                <ProtectedRoute requiredRole="Captain">
                  <InviteOpponent_Captain />
                </ProtectedRoute>
              }
            />
            <Route
              path="/captain/tournaments/create"
              element={
                <ProtectedRoute requiredRole="Captain">
                  <CreateTournament_Captain />
                </ProtectedRoute>
              }
            />
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
              path="/owner/tournaments/create"
              element={
                <ProtectedRoute requiredRole="StadiumOwner">
                  <CreateTournament_Owner />
                </ProtectedRoute>
              }
            />
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
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FeedbackButton />
          <OnboardingTour />
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
