import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchDashboardMetrics,
  fetchProgressTrends,
  fetchSubjectPerformance,
  fetchClassDistribution,
  fetchDashboardAlerts,
  fetchQuickSummary,
  clearError
} from '../features/dashboard/dashboardSlice'

const TeacherDashboard = () => {
  const dispatch = useDispatch()
  const { role } = useSelector(state => state.auth)
  const {
    metrics,
    progressTrends,
    subjectPerformance,
    classDistribution,
    alerts,
    quickSummary,
    loading,
    error
  } = useSelector(state => state.dashboard)

  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    const hasError = Object.values(error).some(err => err !== null)
    if (hasError) {
      return // Don't retry if there's already an error
    }

    // Fetch dashboard data when component mounts
    const fetchDashboardData = async () => {
      try {
        await Promise.all([
          dispatch(fetchDashboardMetrics(role || 'teacher')),
          dispatch(fetchProgressTrends()),
          dispatch(fetchSubjectPerformance()),
          dispatch(fetchClassDistribution()),
          dispatch(fetchDashboardAlerts()),
          dispatch(fetchQuickSummary(role || 'teacher'))
        ])
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      }
    }

    fetchDashboardData()
  }, [dispatch, role, error])

  // Check if any critical errors occurred
  const hasError = Object.values(error).some(err => err !== null)
  const isLoading = Object.values(loading).some(load => load === true)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (hasError) {
    const handleRetry = async () => {
      // Clear error first
      dispatch(clearError())
      // Then retry fetching data
      try {
        await Promise.all([
          dispatch(fetchDashboardMetrics(role || 'teacher')),
          dispatch(fetchProgressTrends()),
          dispatch(fetchSubjectPerformance()),
          dispatch(fetchClassDistribution()),
          dispatch(fetchDashboardAlerts()),
          dispatch(fetchQuickSummary(role || 'teacher'))
        ])
      } catch (err) {
        console.error('Error retrying dashboard data:', err)
      }
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold">Error Loading Dashboard</h2>
        <p className="text-red-600 mt-2">
          {Object.values(error).find(err => err !== null) || 'An unexpected error occurred'}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => dispatch(clearError())}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Clear Error
          </button>
        </div>
      </div>
    )
  }

  // Use data from Redux state
  const metricsData = metrics || []
  const quickSummaryData = quickSummary || []

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Teacher Dashboard</h1>
      </div>

      {/* Class-wise quick stats */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700 animate-slide-right">Class-wise quick stats</h2>
          <button className="text-blue-600 hover:text-blue-800 font-medium transform hover:scale-105 transition-all duration-200">
            More &gt;
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metricsData.map((metric, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 animate-slide-up" 
              style={{animationDelay: `${(index + 1) * 0.1}s`}}
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2 animate-count-up">{metric.value}</div>
                <div className="text-gray-600">{metric.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shortcuts to most-used actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 animate-slide-right">Shortcuts to most-used actions</h2>
        
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
            <span className="text-xl transform transition-transform duration-200 hover:rotate-90">+</span>
            <span>Create Assignment</span>
          </button>
          
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.5s'}}>
            <span className="text-xl">📊</span>
            <span>View Reports</span>
          </button>
          
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
            <span className="text-xl">🤖</span>
            <span>AI Suggestions</span>
          </button>
          
          <button className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.7s'}}>
            <span className="text-xl">📝</span>
            <span>Generate Quiz</span>
          </button>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 animate-slide-right">Quick Summary</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickSummaryData.map((item, index) => (
              <div key={index} className="text-center animate-slide-up" style={{animationDelay: `${(index + 1) * 0.1}s`}}>
                <div className="text-2xl font-bold text-gray-800">{item.value}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default TeacherDashboard