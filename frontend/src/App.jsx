import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/LoginModern'
import Register from './pages/RegisterModern'
import Dashboard from './pages/DashboardModern'
import Profile from './pages/ProfileModern'
import Experiences from './pages/ExperiencesModern'
import Formations from './pages/FormationsModern'
import Skills from './pages/SkillsModern'
import Languages from './pages/LanguagesModern'
import JobOffers from './pages/JobOffersModern'
import Generate from './pages/GenerateModern'
import Documents from './pages/DocumentsModern'
import Layout from './components/ModernLayout'

const PrivateRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  const { token } = useAuth()
  return !token ? children : <Navigate to="/dashboard" />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="experiences" element={<Experiences />} />
            <Route path="formations" element={<Formations />} />
            <Route path="skills" element={<Skills />} />
            <Route path="languages" element={<Languages />} />
            <Route path="job-offers" element={<JobOffers />} />
            <Route path="generate" element={<Generate />} />
            <Route path="documents" element={<Documents />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
