import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
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
  Target,
  LogOut,
  Sparkles
} from 'lucide-react'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const avatarMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { role, user } = useSelector(state => state.auth)

  // Close avatar menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setAvatarMenuOpen(false)
      }
    }

    if (avatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [avatarMenuOpen])

  const handleLogout = () => {
    setAvatarMenuOpen(false)
    dispatch(logout())
    navigate('/login')
  }

  const toggleAvatarMenu = () => {
    setAvatarMenuOpen(!avatarMenuOpen)
  }

  // Principal navigation
  const principalNavigation = [
    { name: 'Home', href: '/', icon: Home },
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
    { name: 'My Profile', href: '/profile', icon: UserCheck },
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
          {/* Logout Button */}
          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
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
          {/* Logout Button */}
          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
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
                  <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ask with AI..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              <div className="relative" ref={avatarMenuRef}>
                <div 
                  onClick={toggleAvatarMenu}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110">
                    <span className="text-sm font-medium text-white">
                      {user?.firstName?.charAt(0) || (role === 'teacher' ? 'T' : 'P')}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
                
                {/* Dropdown menu with animation */}
                <div 
                  className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1 z-50 border border-gray-200 transition-all duration-300 ease-out ${
                    avatarMenuOpen 
                      ? 'opacity-100 translate-y-0 visible' 
                      : 'opacity-0 -translate-y-2 invisible'
                  }`}
                  style={{
                    transformOrigin: 'top right'
                  }}
                >
                  {role === 'teacher' && (
                    <Link
                      to="/profile"
                      onClick={() => setAvatarMenuOpen(false)}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                    >
                      <UserCheck className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      <span>My Profile</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                  >
                    <LogOut className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    Sign out
                  </button>
                </div>
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
