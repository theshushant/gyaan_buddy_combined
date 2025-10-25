import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import RoleSwitcher from './RoleSwitcher'
import { 
  Home, 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  UserCheck,
  ClipboardList,
  Trophy,
  Calendar,
  Lightbulb,
  FileText,
  Brain,
  Target
} from 'lucide-react'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { role } = useSelector(state => state.auth)

  // Principal navigation
  const principalNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Students', href: '/students', icon: GraduationCap },
    { name: 'Teachers', href: '/teachers', icon: Users },
    { name: 'Classes', href: '/classes', icon: BookOpen },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'AI Insights', href: '/ai-insights', icon: Brain },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  // Teacher navigation
  const teacherNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'My Students', href: '/students', icon: GraduationCap },
    { name: 'Modules & Assignments', href: '/modules', icon: BookOpen },
    { name: 'Tests & Quizzes', href: '/tests', icon: ClipboardList },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
    { name: 'Leaderboards', href: '/leaderboards', icon: Trophy },
    { name: 'Daily Missions', href: '/missions', icon: Calendar },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'AI Suggestions', href: '/ai-suggestions', icon: Lightbulb },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const navigation = role === 'teacher' ? teacherNavigation : principalNavigation
  const roleLabel = role === 'teacher' ? 'Teacher' : 'Principal'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-transparent" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">GyanBuddy</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:translate-x-1 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInLeft 0.5s ease-out forwards'
                  }}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div className="ml-2">
                <span className="text-xl font-bold text-gray-900">GyanBuddy</span>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:translate-x-1 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInLeft 0.5s ease-out forwards'
                  }}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 lg:ml-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <RoleSwitcher />
              <button className="text-gray-500 hover:text-gray-700 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">{role === 'teacher' ? 'T' : 'P'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
