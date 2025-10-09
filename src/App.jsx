import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { store } from './store/store'
import Layout from './components/Layout'

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

  if (role === 'teacher') {
    return (
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/students" element={<MyStudents />} />
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

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/students" element={<Students />} />
      <Route path="/students/:id" element={<StudentProfile />} />
      <Route path="/teachers" element={<Teachers />} />
      <Route path="/teachers/:id" element={<TeacherProfile />} />
      <Route path="/classes" element={<Classes />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/ai-insights" element={<AIInsights />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </Provider>
  )
}

export default App