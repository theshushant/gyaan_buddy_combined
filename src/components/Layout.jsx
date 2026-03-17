import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, logoutUser } from '../features/auth/authSlice'
import apiService from '../services/api'
import authService from '../services/authService'
import {
  Home,
  GraduationCap,
  Users,
  BookOpen,
  BarChart3,
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
  Wand2,
  Settings,
  Layers,
  CircleHelp
} from 'lucide-react'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const avatarMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { role, user } = useSelector(state => state.auth)

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

  const handleLogout = async () => {
    setAvatarMenuOpen(false)
    try {
      await dispatch(logoutUser()).unwrap()
    } catch {
      // API may be down; still clear token and mock flag locally
      authService.logout()
      dispatch(logout())
    }
    navigate('/login')
  }

  const toggleAvatarMenu = () => {
    setAvatarMenuOpen(!avatarMenuOpen)
  }

  const isActiveLink = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname === href || location.pathname.startsWith(`${href}/`)
  }

  const principalNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Students', href: '/students', icon: GraduationCap },
    { name: 'Teachers', href: '/teachers', icon: Users },
    { name: 'Classes', href: '/classes', icon: BookOpen },
    { name: 'Subjects', href: '/subjects', icon: Layers },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'AI Insights', href: '/ai-insights', icon: Brain },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const teacherNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'My Profile', href: '/profile', icon: UserCheck },
    { name: 'My Students', href: '/students', icon: GraduationCap },
    { name: 'Chapters & Assignments', href: '/modules', icon: BookOpen },
    { name: 'Tests & Quizzes', href: '/tests', icon: ClipboardList },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
    { name: 'Leaderboards', href: '/leaderboards', icon: Trophy },
    { name: 'Daily Missions', href: '/missions', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const parentNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Detailed Reports', href: '/reports', icon: BarChart3 },
    { name: 'Test Scores', href: '/test-scores', icon: FileText },
    { name: 'Help', href: '/help', icon: CircleHelp },
  ]

  const navigation = role === 'teacher'
    ? teacherNavigation
    : role === 'parent'
      ? parentNavigation
      : principalNavigation
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.parent_name ||
    user?.name || user?.username ||
    (role === 'teacher' ? 'Teacher' : role === 'parent' ? 'Parent' : 'Principal')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-transparent" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <img 
                src="https://storage.googleapis.com/gyaanbuddy-media/final_logo.png" 
                alt="GyanBuddy" 
                className="h-8 w-8 rounded object-contain"
              />
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
              const isActive = isActiveLink(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:translate-x-1 ${
                    !isActive ? 'text-gray-700 hover:bg-gray-100' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInLeft 0.5s ease-out forwards',
                    ...(isActive ? {
                      backgroundColor: '#e6e8f4',
                      color: '#00167a',
                      borderRight: '3px solid #00167a'
                    } : {})
                  }}
                >
                  <item.icon className="h-5 w-5 mr-3" style={isActive ? { color: '#00167a' } : {}} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="px-4 pb-4 space-y-2">
            {role === 'parent' && (
              <Link
                to="/settings"
                onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:shadow-lg"
              style={{ backgroundColor: '#00167a', color: 'white' }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center">
              <img 
                src="https://storage.googleapis.com/gyaanbuddy-media/final_logo.png" 
                alt="GyanBuddy" 
                className="h-8 w-8 rounded object-contain"
              />
              <div className="ml-2">
                <span className="text-xl font-bold text-gray-900">GyanBuddy</span>
                <p className="text-xs text-gray-500">{displayName}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item, index) => {
              const isActive = isActiveLink(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:translate-x-1 ${
                    !isActive ? 'text-gray-700 hover:bg-gray-100' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInLeft 0.5s ease-out forwards',
                    ...(isActive ? {
                      backgroundColor: '#e6e8f4',
                      color: '#00167a',
                      borderRight: '3px solid #00167a'
                    } : {})
                  }}
                >
                  <item.icon className="h-5 w-5 mr-3" style={isActive ? { color: '#00167a' } : {}} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="px-4 pb-4 space-y-2">
            {role === 'parent' && (
              <Link
                to="/settings"
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  location.pathname === '/settings'
                    ? 'border-primary-500 text-primary-700 bg-primary-50'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:shadow-lg"
              style={{ backgroundColor: '#00167a', color: 'white' }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        {apiService.getUsedMockData() && (
          <div className="sticky top-0 z-50 bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-sm text-amber-900">
            You are viewing demo data because the backend is unavailable. Start the backend to use live data.
          </div>
        )}
        {role !== 'parent' && (
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={avatarMenuRef}>
                <div 
                  onClick={toggleAvatarMenu}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, #1fb7eb 0%, #00167a 100%)' }}
                  >
                    <span className="text-sm font-medium text-white">
                      {(displayName && displayName.charAt(0)) || (role === 'teacher' ? 'T' : 'P')}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  </div>
                </div>
                
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
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-500 transition-all duration-200 group"
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
        )}

        <main className={role === 'parent' ? 'p-6 bg-[#f6f8fc] min-h-screen' : 'p-6'}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
