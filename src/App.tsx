import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import VolunteerAuth from './pages/auth/VolunteerAuth'
import NGOAuth from './pages/auth/NGOAuth'
import AdminAuth from './pages/auth/AdminAuth'
import VolunteerDashboard from './pages/volunteer/Dashboard'
import VolunteerProfile from './pages/volunteer/Profile'
import BrowseNGOs from './pages/volunteer/BrowseNGOs'
import VolunteerHistory from './pages/volunteer/History'
import VolunteerBadges from './pages/volunteer/Badges'
import VolunteerVideo from './pages/volunteer/Video'
import NGODashboard from './pages/ngo/Dashboard'
import NGOProfile from './pages/ngo/Profile'
import PostOpportunity from './pages/ngo/PostOpportunity'
import ViewApplicants from './pages/ngo/ViewApplicants'
import AdminDashboard from './pages/admin/Dashboard'
import ApproveVolunteers from './pages/admin/ApproveVolunteers'
import ManageBadges from './pages/admin/ManageBadges'
import Analytics from './pages/admin/Analytics'
import PublicProfiles from './pages/PublicProfiles'
import AIMatchmaking from './pages/ngo/AIMatchmaking'
import AIWorkflow from './pages/admin/AIWorkflow'
import AIAnalyse from './pages/volunteer/AIAnalyse'
import AIChatbot from './components/AIChatbot'

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) {
  const { user, role, loading } = useAuth()
  
  // Prototype Bypass: Admin portal is open for demo
  if (allowedRole === 'admin') {
    return <>{children}</>
  }
  
  if (loading || (user && !role)) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  
  if (!user) return <Navigate to="/" replace />
  if (role !== allowedRole) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/volunteer" element={<VolunteerAuth />} />
      <Route path="/auth/ngo" element={<NGOAuth />} />
      <Route path="/auth/admin" element={<AdminAuth />} />
      
      {/* Volunteer routes */}
      <Route path="/volunteer/dashboard" element={
        <ProtectedRoute allowedRole="volunteer"><VolunteerDashboard /></ProtectedRoute>
      } />
      <Route path="/volunteer/profile" element={
        <ProtectedRoute allowedRole="volunteer"><VolunteerProfile /></ProtectedRoute>
      } />
      <Route path="/volunteer/browse" element={
        <ProtectedRoute allowedRole="volunteer"><BrowseNGOs /></ProtectedRoute>
      } />
      <Route path="/volunteer/history" element={
        <ProtectedRoute allowedRole="volunteer"><VolunteerHistory /></ProtectedRoute>
      } />
      <Route path="/volunteer/badges" element={
        <ProtectedRoute allowedRole="volunteer"><VolunteerBadges /></ProtectedRoute>
      } />
      <Route path="/volunteer/video" element={
        <ProtectedRoute allowedRole="volunteer"><VolunteerVideo /></ProtectedRoute>
      } />
      <Route path="/volunteer/analyse" element={
        <ProtectedRoute allowedRole="volunteer"><AIAnalyse /></ProtectedRoute>
      } />
      
      {/* NGO routes */}
      <Route path="/ngo/dashboard" element={
        <ProtectedRoute allowedRole="ngo"><NGODashboard /></ProtectedRoute>
      } />
      <Route path="/ngo/profile" element={
        <ProtectedRoute allowedRole="ngo"><NGOProfile /></ProtectedRoute>
      } />
      <Route path="/ngo/post" element={
        <ProtectedRoute allowedRole="ngo"><PostOpportunity /></ProtectedRoute>
      } />
      <Route path="/ngo/applicants" element={
        <ProtectedRoute allowedRole="ngo"><ViewApplicants /></ProtectedRoute>
      } />
      <Route path="/ngo/matchmaking" element={
        <ProtectedRoute allowedRole="ngo"><AIMatchmaking /></ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/approve" element={
        <ProtectedRoute allowedRole="admin"><ApproveVolunteers /></ProtectedRoute>
      } />
      <Route path="/admin/badges" element={
        <ProtectedRoute allowedRole="admin"><ManageBadges /></ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute allowedRole="admin"><Analytics /></ProtectedRoute>
      } />
      <Route path="/admin/workflow" element={
        <ProtectedRoute allowedRole="admin"><AIWorkflow /></ProtectedRoute>
      } />
      {/* Shared routes */}
      <Route path="/community/profiles" element={
        <ProtectedRoute allowedRole="volunteer"><PublicProfiles /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
        <AIChatbot />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </HashRouter>
    </AuthProvider>
  )
}
