import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import { fetchCurrentUser } from './features/auth/authSlice'

// Principal pages
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Teachers from './pages/Teachers'
import Classes from './pages/Classes'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import StudentProfile from './pages/StudentProfile'
import TeacherProfile from './pages/TeacherProfile'
import AIInsights from './pages/AIInsights'
import APILogicScreen from './pages/APILogicScreen'
import ClassRoster from './pages/ClassRoster'

// Teacher pages
import TeacherDashboard from './pages/TeacherDashboard'
import MyStudents from './pages/MyStudents'
import ModulesAssignments from './pages/ModulesAssignments'
import ModuleDetail from './pages/ModuleDetail'
import TestsQuizzes from './pages/TestsQuizzes'
import GenerateWithAI from './pages/GenerateWithAI'
import AIGeneratedQuestions from './pages/AIGeneratedQuestions'
import ViewQuestions from './pages/ViewQuestions'
import StudentTestPerformance from './pages/StudentTestPerformance'
import ReportsAnalytics from './pages/ReportsAnalytics'
import Leaderboards from './pages/Leaderboards'
import DailyMissions from './pages/DailyMissions'
import Notifications from './pages/Notifications'
import AISuggestions from './pages/AISuggestions'

// Role-based routing component
const AppRoutes = () => {
  const { role } = useSelector(state => state.auth)

  // Teacher routes - show TeacherDashboard
  if (role === 'teacher') {
    return (
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/profile" element={<TeacherProfile />} />
        <Route path="/students" element={<MyStudents />} />
        <Route path="/students/:id" element={<StudentProfile />} />
        <Route path="/modules" element={<ModulesAssignments />} />
        <Route path="/modules/:id" element={<ModuleDetail />} />
        <Route path="/tests" element={<TestsQuizzes />} />
        <Route path="/tests/generate" element={<GenerateWithAI />} />
        <Route path="/tests/questions" element={<ViewQuestions />} />
        <Route path="/tests/ai-generated" element={<AIGeneratedQuestions />} />
        <Route path="/tests/performance/:studentId" element={<StudentTestPerformance />} />
        <Route path="/reports" element={<ReportsAnalytics />} />
        <Route path="/leaderboards" element={<Leaderboards />} />
        <Route path="/missions" element={<DailyMissions />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/ai-suggestions" element={<AISuggestions />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    )
  }

  // Principal routes - show Dashboard (default for principal and other roles)
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/students" element={<Students />} />
      <Route path="/students/:id" element={<StudentProfile />} />
      <Route path="/teachers" element={<Teachers />} />
      <Route path="/teachers/:id" element={<TeacherProfile />} />
      <Route path="/classes" element={<Classes />} />
      <Route path="/classes/:id/roster" element={<ClassRoster />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/ai-insights" element={<AIInsights />} />
      <Route path="/api-logic" element={<APILogicScreen />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, loading } = useSelector(state => state.auth)

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token && !isAuthenticated && !loading.fetchUser) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, isAuthenticated, loading.fetchUser])

  // Show loading state while checking authentication
  if (loading.fetchUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <AppRoutes />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App