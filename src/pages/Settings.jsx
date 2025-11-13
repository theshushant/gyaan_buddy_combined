import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { User, Lock, Bell, Settings as SettingsIcon, Calendar, Database, Shield, Zap, Globe, Download, Upload } from 'lucide-react'
import Modal from '../components/Modal'
import authService from '../services/authService'
import { fetchCurrentUser } from '../features/auth/authSlice'

const Settings = () => {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector(state => state.auth)
  
  const [activeSection, setActiveSection] = useState('account')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [inAppAlerts, setInAppAlerts] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [autoBackup, setAutoBackup] = useState(true)
  const [dataRetention, setDataRetention] = useState('2')
  
  // Password change modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      // If user data is not in Redux, fetch it
      if (!user) {
        setProfileLoading(true)
        setProfileError(null)
        try {
          await dispatch(fetchCurrentUser()).unwrap()
        } catch (err) {
          setProfileError(err || 'Failed to load profile data')
        } finally {
          setProfileLoading(false)
        }
      }
    }
    fetchProfile()
  }, [dispatch, user])
  
  // Get user profile data with fallbacks
  const getUserDisplayName = () => {
    if (!user) return 'Loading...'
    return `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() || user.username || 'User'
  }
  
  const getUserEmail = () => {
    return user?.email || ''
  }
  
  const getUserPhone = () => {
    return user?.phoneNumber || user?.phone_number || ''
  }
  
  const getUserRole = () => {
    if (!user) return ''
    const role = user.role || user.user_type || ''
    // Capitalize first letter
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'academic-year', label: 'Academic Year', icon: Calendar },
    { id: 'data-backup', label: 'Data Backup', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  const academicYearSettings = {
    currentYear: '2024-2025',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    terms: [
      { name: 'First Term', start: '2024-04-01', end: '2024-08-31' },
      { name: 'Second Term', start: '2024-09-01', end: '2024-12-31' },
      { name: 'Third Term', start: '2025-01-01', end: '2025-03-31' }
    ]
  }

  const integrations = [
    { name: 'Google Classroom', status: 'Connected', icon: Globe },
    { name: 'Microsoft Teams', status: 'Not Connected', icon: Globe },
    { name: 'Zoom', status: 'Connected', icon: Globe },
    { name: 'Slack', status: 'Not Connected', icon: Globe }
  ]

  // Password change handlers
  const handleOpenPasswordModal = () => {
    setPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setIsPasswordModalOpen(true)
  }

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false)
    setPassword('')
    setConfirmPassword('')
    setPasswordError('')
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError('')

    // Validation
    if (!password || !confirmPassword) {
      setPasswordError('Please fill in all fields')
      return
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword({ new_password: password })
      alert('Password changed successfully!')
      handleClosePasswordModal()
    } catch (error) {
      setPasswordError(error.message || 'Failed to change password. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 ease-in-out">
          <nav className="space-y-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <section.icon className="h-4 w-4 mr-3" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Account Settings */}
          {activeSection === 'account' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ease-in-out">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  {/* Profile Card */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 hover:bg-blue-100 transition-colors duration-200">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Profile Information</h3>
                        <p className="text-sm text-gray-600">Update your personal information and contact details</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200">
                      Edit Profile
                    </button>
                  </div>

                  {/* Password Card */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 hover:bg-blue-100 transition-colors duration-200">
                        <Lock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Password & Security</h3>
                        <p className="text-sm text-gray-600">Change your password and manage security settings</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleOpenPasswordModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                    >
                      Change Password
                    </button>
                  </div>

                  {/* Account Info */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">Account Information</h3>
                    
                    {/* Loading State */}
                    {(loading.fetchUser || profileLoading) && (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    
                    {/* Error State */}
                    {(error.fetchUser || profileError) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-600 text-sm">
                          {error.fetchUser || profileError || 'Failed to load profile data'}
                        </p>
                        <button
                          onClick={async () => {
                            setProfileLoading(true)
                            setProfileError(null)
                            try {
                              await dispatch(fetchCurrentUser()).unwrap()
                            } catch (err) {
                              setProfileError(err || 'Failed to load profile data')
                            } finally {
                              setProfileLoading(false)
                            }
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    
                    {/* Profile Data */}
                    {!(loading.fetchUser || profileLoading) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={getUserDisplayName()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={getUserEmail()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={getUserPhone()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Not set"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <input
                            type="text"
                            value={getUserRole()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            readOnly
                          />
                        </div>
                        {user?.username && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                              type="text"
                              value={user.username}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              readOnly
                            />
                          </div>
                        )}
                        {user?.employeeId || user?.employee_id ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                            <input
                              type="text"
                              value={user.employeeId || user.employee_id}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              readOnly
                            />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600">Receive email notifications for assignments, deadlines, and important updates.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* In-App Alerts */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">In-App Alerts</h3>
                      <p className="text-sm text-gray-600">Get in-app alerts for important updates and notifications.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inAppAlerts}
                        onChange={(e) => setInAppAlerts(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* SMS Notifications */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                      <p className="text-sm text-gray-600">Receive SMS alerts for critical updates and emergencies.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">General Preferences</h2>
                
                <div className="space-y-6">
                  {/* Language */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-2">Language</h3>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="mr">Marathi</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-2">Timezone</h3>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="IST">India Standard Time (IST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Year Settings */}
          {activeSection === 'academic-year' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Academic Year Configuration</h2>
                
                <div className="space-y-6">
                  {/* Current Academic Year */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">Current Academic Year</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                        <input
                          type="text"
                          value={academicYearSettings.currentYear}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={academicYearSettings.startDate}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={academicYearSettings.endDate}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">Academic Terms</h3>
                    <div className="space-y-3">
                      {academicYearSettings.terms.map((term, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{term.name}</p>
                            <p className="text-sm text-gray-600">{term.start} to {term.end}</p>
                          </div>
                          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Backup Settings */}
          {activeSection === 'data-backup' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Data Backup & Recovery</h2>
                
                <div className="space-y-6">
                  {/* Auto Backup */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Automatic Backup</h3>
                      <p className="text-sm text-gray-600">Automatically backup data daily to cloud storage.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoBackup}
                        onChange={(e) => setAutoBackup(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Manual Backup */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Manual Backup</h3>
                      <p className="text-sm text-gray-600">Create a backup of all data immediately.</p>
                    </div>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      Backup Now
                    </button>
                  </div>

                  {/* Data Retention */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Data Retention Period</h3>
                    <select
                      value={dataRetention}
                      onChange={(e) => setDataRetention(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1">1 Year</option>
                      <option value="2">2 Years</option>
                      <option value="5">5 Years</option>
                      <option value="10">10 Years</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeSection === 'integrations' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Third-Party Integrations</h2>
                
                <div className="space-y-4">
                  {integrations.map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          <integration.icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{integration.name}</h3>
                          <p className={`text-sm ${
                            integration.status === 'Connected' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {integration.status}
                          </p>
                        </div>
                      </div>
                      <button className={`px-4 py-2 rounded-lg transition-colors ${
                        integration.status === 'Connected'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}>
                        {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy & Security</h2>
                
                <div className="space-y-6">
                  {/* Data Sharing */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Data Sharing</h3>
                      <p className="text-sm text-gray-600">Allow sharing of anonymized data for educational research.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Usage Analytics</h3>
                      <p className="text-sm text-gray-600">Help improve the application by sharing usage analytics.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Data Export */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Data Export</h3>
                      <p className="text-sm text-gray-600">Export all your data in a portable format.</p>
                    </div>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Upload className="h-4 w-4 mr-2" />
                      Export Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
              minLength={8}
            />
          </div>

          {passwordError && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {passwordError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClosePasswordModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isChangingPassword}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Settings