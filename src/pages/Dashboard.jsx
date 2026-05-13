import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import {
  fetchDashboardMetrics,
  clearError
} from '../features/dashboard/dashboardSlice'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const normalizeScore = (value) => {
  const numeric = Number(value ?? 0)
  if (Number.isNaN(numeric) || numeric <= 0) return 0
  if (numeric <= 100) return Math.round(numeric)
  if (numeric <= 1000) return Math.round(numeric / 10)
  return Math.round(numeric / 100)
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const { role } = useSelector((state) => state.auth)
  const [selectedClass, setSelectedClass] = useState('all')
  const [allClassOptions, setAllClassOptions] = useState([])
  const {
    loading,
    error,
    metrics,
    principalCharts,
  } = useSelector((state) => state.dashboard)

  const dashboardFilters = useMemo(
    () => ({
      class: selectedClass === 'all' ? '' : selectedClass,
    }),
    [selectedClass]
  )
  const dashboardRole = role === 'teacher' ? 'teacher' : 'principal'

  const fetchDashboardData = async () => {
    await Promise.all([
      dispatch(fetchDashboardMetrics({ role: dashboardRole, filters: dashboardFilters })),
    ])
  }

  useEffect(() => {
    fetchDashboardData().catch((err) => console.error('Error fetching dashboard data:', err))
  }, [dispatch, dashboardRole, dashboardFilters])

  useEffect(() => {
    if (!Array.isArray(principalCharts?.classes) || principalCharts.classes.length === 0) return
    setAllClassOptions((prev) => {
      const merged = [...prev]
      principalCharts.classes.forEach((className) => {
        if (className && !merged.includes(className)) {
          merged.push(className)
        }
      })
      return merged
    })
  }, [principalCharts?.classes])

  const hasError = Object.values(error).some((err) => err !== null)
  const isLoading = Object.values(loading).some((load) => load === true)

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
        await fetchDashboardData()
      } catch (err) {
        console.error('Error retrying dashboard data:', err)
      }
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold">Error Loading Dashboard</h2>
        <p className="text-red-600 mt-2">
          {Object.values(error).find((err) => err !== null) || 'An unexpected error occurred'}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleRetry}
            className="px-4 py-2 text-white rounded hover:bg-primary-600 transition-colors"
            style={{ backgroundColor: '#00167a' }}
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

  const metricCards = [
    {
      title: 'Student Proficiency',
      value: `${principalCharts?.summary?.studentProficiency || normalizeScore((metrics || []).find((m) => (m.title || '').toLowerCase().includes('proficiency'))?.value)}%`
    },
    {
      title: 'Attempt Rate',
      value: `${principalCharts?.summary?.attemptRate || (
        Array.isArray(principalCharts?.attemptRate) && principalCharts.attemptRate.length
          ? Math.round(principalCharts.attemptRate.reduce((acc, item) => acc + normalizeScore(item.value), 0) / principalCharts.attemptRate.length)
          : 0
      )}%`
    },
  ]

  const chartOptions = {
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
        max: 100,
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        ticks: { color: '#6b7280', font: { size: 11 }, align: 'center' },
        grid: { display: false },
      },
    },
  }

  const subjectProficiencyData = {
    labels: Array.isArray(principalCharts?.subjectProficiency) ? principalCharts.subjectProficiency.map((item) => item.subject) : [],
    datasets: [{
      label: 'Proficiency %',
      data: Array.isArray(principalCharts?.subjectProficiency)
        ? principalCharts.subjectProficiency.map((item) => normalizeScore(item.value))
        : [],
      backgroundColor: 'rgba(0, 22, 122, 1)',
      borderRadius: 4,
    }],
  }

  const attemptRateData = {
    labels: Array.isArray(principalCharts?.attemptRate) ? principalCharts.attemptRate.map((item) => item.subject) : [],
    datasets: [{
      label: 'Attempt Rate %',
      data: Array.isArray(principalCharts?.attemptRate)
        ? principalCharts.attemptRate.map((item) => normalizeScore(item.value))
        : [],
      backgroundColor: 'rgba(0, 119, 182, 1)',
      borderRadius: 4,
    }],
  }

  const teacherProficiencyData = {
    labels: Array.isArray(principalCharts?.teacherProficiency) ? principalCharts.teacherProficiency.map((item) => item.teacher) : [],
    datasets: [{
      label: 'Teacher Proficiency %',
      data: Array.isArray(principalCharts?.teacherProficiency)
        ? principalCharts.teacherProficiency.map((item) => normalizeScore(item.value))
        : [],
      backgroundColor: 'rgba(31, 183, 235, 1)',
      borderRadius: 4,
      categoryPercentage: Array.isArray(principalCharts?.teacherProficiency) && principalCharts.teacherProficiency.length <= 2 ? 0.45 : 0.8,
      barPercentage: Array.isArray(principalCharts?.teacherProficiency) && principalCharts.teacherProficiency.length <= 2 ? 0.7 : 0.9,
      maxBarThickness: 80,
    }],
  }

  const classOptions = allClassOptions
  const hasFewTeacherBars = teacherProficiencyData.labels.length > 0 && teacherProficiencyData.labels.length <= 2

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {role === 'teacher' ? 'Teacher Dashboard' : role === 'principal' ? 'Principal Dashboard' : 'Dashboard'}
          </h1>
        </div>

        <div className="min-w-[220px] lg:ml-6">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">All Classes</option>
            {classOptions.map((className) => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metricCards.map((metric) => (
          <div
            key={metric.title}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <p className="text-sm font-medium text-gray-600 mb-2">{metric.title}</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subject Proficiency</h2>
          <div className="h-56">
            <Bar data={subjectProficiencyData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attempt Rate</h2>
          <div className="h-56">
            <Bar data={attemptRateData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Teacher Proficiency</h2>
        <div className={`h-64 ${hasFewTeacherBars ? 'mx-auto w-full max-w-4xl' : 'w-full'}`}>
          <Bar data={teacherProficiencyData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
