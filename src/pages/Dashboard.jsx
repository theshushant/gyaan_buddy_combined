import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import {
  fetchDashboardMetrics,
  fetchProgressTrends,
  fetchDashboardAlerts,
  fetchClassDistribution,
  fetchQuickSummary,
  clearError
} from '../features/dashboard/dashboardSlice'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Dashboard = () => {
  const dispatch = useDispatch()
  const { role } = useSelector(state => state.auth)
  const {
    metrics,
    progressTrends,
    alerts,
    quickSummary,
    classDistribution,
    loading,
    error
  } = useSelector(state => state.dashboard)

  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    const hasError = Object.values(error).some(err => err !== null)
    if (hasError) {
      return // Don't retry if there's already an error
    }

    // Fetch all dashboard data when component mounts
    const fetchDashboardData = async () => {
      try {
        await Promise.all([
          dispatch(fetchDashboardMetrics(role || 'principal')),
          dispatch(fetchQuickSummary(role || 'principal')),
          dispatch(fetchProgressTrends()),
          dispatch(fetchDashboardAlerts()),
          dispatch(fetchClassDistribution())
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
          dispatch(fetchDashboardMetrics(role || 'principal')),
          dispatch(fetchQuickSummary(role || 'principal')),
          dispatch(fetchProgressTrends()),
          dispatch(fetchDashboardAlerts()),
          dispatch(fetchClassDistribution())
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

  // Prepare KPI metrics - use actual API data
  // The metrics endpoint returns an array of metric objects with: title, value, change, changeType, trend
  const metricsData = Array.isArray(metrics) ? metrics : []
  
  // Display first 3 metrics from API, or show empty state if no data
  const displayMetrics = metricsData.slice(0, 3).map(metric => ({
    title: metric.title || 'Metric',
    value: metric.value || '0',
    change: metric.change || 'No change',
    changeType: metric.changeType || (metric.change && metric.change.includes('+') ? 'positive' : 'neutral')
  }))

  // Prepare progress trends chart data - use actual API data
  // API returns: { labels: [...], datasets: [{ label, data, borderColor, backgroundColor }] }
  const prepareProgressTrendsData = () => {
    // If we have API data with proper structure, use it directly
    if (progressTrends && progressTrends.labels && progressTrends.datasets && Array.isArray(progressTrends.datasets)) {
      // Ensure datasets have proper chart.js format
      return {
        labels: progressTrends.labels,
        datasets: progressTrends.datasets.map(dataset => ({
          label: dataset.label || 'Dataset',
          data: Array.isArray(dataset.data) ? dataset.data : [],
          borderColor: dataset.borderColor || 'rgb(59, 130, 246)',
          backgroundColor: dataset.backgroundColor || 'rgba(59, 130, 246, 0.1)',
          fill: dataset.fill !== undefined ? dataset.fill : (dataset.label === 'Overall' || dataset.label === 'Student Progress'),
          tension: dataset.tension || 0.4,
          borderWidth: dataset.borderWidth || 2,
        }))
      }
    }
    
    // Return null if no data - component will show loading/empty state
    return null
  }

  const chartProgressTrends = prepareProgressTrendsData()

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We use custom legend in the UI
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  }

  // Prepare Quick Summary data - use actual API data
  // API returns: [{ label: "...", value: "..." }]
  const quickSummaryData = Array.isArray(quickSummary) ? quickSummary : []
  
  // Display first 3 quick summary items from API
  const displayQuickSummary = quickSummaryData.slice(0, 3).map(item => ({
    label: item.label || 'Summary Item',
    value: String(item.value || '0')
  }))

  // Prepare Alerts data - use actual API data
  // API returns: [{ id, type, title, message, timestamp, read }]
  const alertsData = Array.isArray(alerts) ? alerts : []
  
  // Map API alerts to display format
  const mapAlertToDisplay = (alert) => {
    let bgColor = 'bg-gray-50'
    let borderColor = 'border-gray-200'
    let textColor = 'text-gray-800'
    
    // Determine colors based on alert type
    if (alert.type === 'warning' || alert.type === 'alert') {
      bgColor = 'bg-red-50'
      borderColor = 'border-red-200'
      textColor = 'text-red-800'
    } else if (alert.type === 'info' || alert.type === 'announcement') {
      bgColor = 'bg-yellow-50'
      borderColor = 'border-yellow-200'
      textColor = 'text-yellow-800'
    } else if (alert.type === 'success' || alert.type === 'achievement') {
      bgColor = 'bg-green-50'
      borderColor = 'border-green-200'
      textColor = 'text-green-800'
    }
    
    // Build message from alert data
    // API provides both title and message, use message if available, otherwise title
    let message = alert.message || alert.title || 'No message'
    
    // Format message based on type if not already formatted
    if (!message.startsWith('Alert:') && !message.startsWith('Announcement:') && !message.startsWith('Achievement:')) {
      if (alert.type === 'warning' || alert.type === 'alert') {
        message = `Alert: ${message}`
      } else if (alert.type === 'info' || alert.type === 'announcement') {
        message = `Announcement: ${message}`
      } else if (alert.type === 'success' || alert.type === 'achievement') {
        message = `Achievement: ${message}`
      }
    }
    
    return {
      ...alert,
      bgColor,
      borderColor,
      textColor,
      message
    }
  }

  // Display first 3 alerts from API
  const displayAlerts = alertsData.slice(0, 3).map(mapAlertToDisplay)

  return (
    <div className="space-y-6">
      {/* Dashboard Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {role === 'teacher' ? 'Teacher Dashboard' : role === 'principal' ? 'Principal Dashboard' : 'Dashboard'}
        </h1>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayMetrics.length > 0 ? (
          displayMetrics.map((metric, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-medium text-gray-600 mb-2">{metric.title}</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {metric.value}
              </p>
              <p className={`text-sm font-medium ${
                metric.changeType === 'positive' || (metric.change && metric.change.includes('+')) 
                  ? 'text-green-600' 
                  : metric.changeType === 'negative' || (metric.change && metric.change.includes('-'))
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {metric.change}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 text-center">No metrics data available</p>
          </div>
        )}
      </div>

      {/* School-Wide Progress Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">School-Wide Progress Trends</h2>
          {/* Custom Legend - positioned at top right */}
          <div className="flex items-center space-x-4 flex-wrap">
            {/* Show datasets from API */}
            {chartProgressTrends && chartProgressTrends.datasets && chartProgressTrends.datasets.length > 0 ? (
              chartProgressTrends.datasets.slice(0, 3).map((dataset, index) => {
                // Extract color from dataset borderColor
                const color = dataset.borderColor || 'rgb(128, 128, 128)'
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm text-gray-600">{dataset.label || `Dataset ${index + 1}`}</span>
                  </div>
                )
              })
            ) : (
              <span className="text-sm text-gray-400">No data available</span>
            )}
            {/* Show "More →" if there are more datasets */}
            {chartProgressTrends && chartProgressTrends.datasets && chartProgressTrends.datasets.length > 3 && (
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">More →</a>
            )}
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-64 w-full">
          {chartProgressTrends && chartProgressTrends.labels && chartProgressTrends.datasets && chartProgressTrends.datasets.length > 0 ? (
            <Line data={chartProgressTrends} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              {progressTrends ? 'No chart data available' : 'Loading chart data...'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Summary</h2>
          <div className="space-y-4">
            {displayQuickSummary.length > 0 ? (
              displayQuickSummary.map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-2"
                >
                  <span className="text-gray-600 text-sm">{item.label}</span>
                  <span className="font-semibold text-gray-900 text-lg">{item.value}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No summary data available</p>
            )}
          </div>
        </div>

        {/* Critical Alerts & Announcements */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Critical Alerts & Announcements</h2>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">More →</a>
          </div>
          <div className="space-y-3">
            {displayAlerts.length > 0 ? (
              displayAlerts.map((alert, index) => (
                <div 
                  key={alert.id || index} 
                  className={`p-4 rounded-lg border-2 ${alert.bgColor} ${alert.borderColor}`}
                >
                  <p className={`text-sm ${alert.textColor}`}>{alert.message}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No alerts available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
