import { useEffect, useState } from 'react'
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
import { Bar } from 'react-chartjs-2'
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

const CLASSES  = ['6']

const Dashboard = () => {
  const dispatch = useDispatch()
  const { role } = useSelector(state => state.auth)
  const [selectedClass, setSelectedClass] = useState('all')
  const {
    loading,
    error
  } = useSelector(state => state.dashboard)

  useEffect(() => {
    const hasError = Object.values(error).some(err => err !== null)
    if (hasError) {
      return // Don't retry if there's already an error
    }

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

  const hasError = Object.values(error).some(err => err !== null)
  const isLoading = Object.values(loading).some(load => load === true)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (hasError) {
    const handleRetry = async () => {
      dispatch(clearError())
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
            className="px-4 py-2 text-white rounded hover:bg-primary-600 transition-colors" style={{ backgroundColor: '#00167a' }}
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

  const displayMetrics = [
    { title: 'Student Proficiency', value: '65%', change: '', changeType: 'neutral' },
    { title: 'Attempt Rate',        value: '70%', change: '', changeType: 'neutral' },
    { title: 'Weak Topic Count',    value: '5',   change: '', changeType: 'neutral' },
  ]

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid: { display: false },
      },
    },
  }

  const subjectProficiencyData = {
    labels: ['Math', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer'],
    datasets: [{
      label: 'Proficiency %',
      data: [80, 70, 85, 72, 68, 90],
      backgroundColor: 'rgba(0, 22,122, 1)',
      borderRadius: 4,
    }],
  }

  const attemptRateData = {
    labels: ['Math', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer'],
    datasets: [{
      label: 'Attempt Rate %',
      data: [70, 75, 80, 85, 90, 88, 92],
      backgroundColor: 'rgba(0, 119, 182, 1)',
      borderRadius: 4,
    }],
  }

  const teacherProficiencyData = {
    labels: ['Mr Aman', 'Mrs Shilpa', 'Verma', 'Singh', 'Mehta', 'Joshi'],
    datasets: [{
      label: 'Proficiency %',
      data: [85, 78, 90, 70, 82, 88],
      backgroundColor: 'rgba(31, 183, 235, 1)',
      borderRadius: 4,
    }],
  }

  const weakTopicCountData = {
    labels: ['Math', 'Science', 'English', 'Computer', 'Hindi', 'Social Studies'],
    datasets: [{
      label: 'Weak Topics',
      data: [5, 3, 4, 2, 6, 3],
      backgroundColor: 'rgba(24, 0, 173, 0.8)',
      borderRadius: 4,
    }],
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {role === 'teacher' ? 'Teacher Dashboard' : role === 'principal' ? 'Principal Dashboard' : 'Dashboard'}
        </h1>
      </div>

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

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">All Classes</option>
              {CLASSES.map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subject Proficiency</h2>
          <div className="h-56">
            <Bar data={subjectProficiencyData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attempt Rate</h2>
          <div className="h-56">
            <Bar data={attemptRateData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Teacher Proficiency</h2>
          <div className="h-56">
            <Bar data={teacherProficiencyData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weak Topic Count</h2>
          <div className="h-56">
            <Bar data={weakTopicCountData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard