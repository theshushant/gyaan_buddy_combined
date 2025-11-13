import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Download, Eye, TrendingUp, Lightbulb } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import {
  fetchStudentPerformanceReport,
  fetchProgressOverTimeReport,
  fetchQuizAssignmentSummaries,
  fetchAIInsightsReport,
  fetchAnalyticsReport,
  clearError
} from '../features/reports/reportsSlice'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Reports = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('student-performance')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('30')
  
  const {
    studentPerformanceReport,
    progressOverTimeReport,
    quizAssignmentSummaries,
    aiInsightsReport,
    analyticsReport,
    loading,
    error
  } = useSelector(state => state.reports)

  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    const hasError = Object.values(error).some(err => err !== null)
    if (hasError) {
      return // Don't retry if there's already an error
    }

    // Fetch reports data when component mounts or filters change
    const fetchReportsData = async () => {
      const filters = {
        class: selectedClass !== 'all' ? selectedClass : undefined,
        subject: selectedSubject !== 'all' ? selectedSubject : undefined,
        dateRange: selectedDateRange
      }
      
      try {
        await Promise.all([
          dispatch(fetchStudentPerformanceReport(filters)),
          dispatch(fetchProgressOverTimeReport(filters)),
          dispatch(fetchQuizAssignmentSummaries(filters)),
          dispatch(fetchAIInsightsReport(filters)),
          dispatch(fetchAnalyticsReport(filters))
        ])
      } catch (err) {
        console.error('Error fetching reports data:', err)
      }
    }

    fetchReportsData()
  }, [dispatch, selectedClass, selectedSubject, selectedDateRange, error])

  const isLoading = Object.values(loading).some(load => load === true)
  const hasError = Object.values(error).some(err => err !== null)

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
      const filters = {
        class: selectedClass !== 'all' ? selectedClass : undefined,
        subject: selectedSubject !== 'all' ? selectedSubject : undefined,
        dateRange: selectedDateRange
      }
      try {
        await Promise.all([
          dispatch(fetchStudentPerformanceReport(filters)),
          dispatch(fetchProgressOverTimeReport(filters)),
          dispatch(fetchQuizAssignmentSummaries(filters)),
          dispatch(fetchAIInsightsReport(filters)),
          dispatch(fetchAnalyticsReport(filters))
        ])
      } catch (err) {
        console.error('Error retrying reports data:', err)
      }
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold">Error Loading Reports</h2>
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

  // Transform API data for charts
  const mathProgressData = progressOverTimeReport?.mathProgressData || {
    labels: progressOverTimeReport?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: progressOverTimeReport?.datasets?.filter(d => d.label?.toLowerCase().includes('math')) || [
      {
        label: 'Mathematics Score',
        data: progressOverTimeReport?.mathData || [65, 70, 75, 78, 82, 85],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const scienceProgressData = progressOverTimeReport?.scienceProgressData || {
    labels: progressOverTimeReport?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: progressOverTimeReport?.datasets?.filter(d => d.label?.toLowerCase().includes('science')) || [
      {
        label: 'Science Score',
        data: progressOverTimeReport?.scienceData || [80, 78, 75, 72, 70, 68],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Transform student performance data for chart - use API data only
  const transformStudentPerformanceData = () => {
    if (!studentPerformanceReport) {
      return null
    }

    // Handle case where API returns pre-formatted chart data
    if (studentPerformanceReport.studentPerformanceData && 
        studentPerformanceReport.studentPerformanceData.labels && 
        studentPerformanceReport.studentPerformanceData.datasets) {
      return studentPerformanceReport.studentPerformanceData
    }

    // Get students array from various possible response structures
    let studentsArray = []
    if (Array.isArray(studentPerformanceReport)) {
      studentsArray = studentPerformanceReport
    } else if (studentPerformanceReport.students && Array.isArray(studentPerformanceReport.students)) {
      studentsArray = studentPerformanceReport.students
    } else if (studentPerformanceReport.data && Array.isArray(studentPerformanceReport.data)) {
      studentsArray = studentPerformanceReport.data
    }

    if (!studentsArray || studentsArray.length === 0) {
      return null
    }

    // Extract student names for labels
    const labels = studentsArray.map(s => {
      if (typeof s === 'string') return s
      return s.student_name || s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown'
    })

    // Determine subjects from student data
    const subjectsSet = new Set()
    studentsArray.forEach(s => {
      if (s.performance && typeof s.performance === 'object') {
        Object.keys(s.performance).forEach(subject => subjectsSet.add(subject))
      } else if (s.subjects && Array.isArray(s.subjects)) {
        s.subjects.forEach(subject => subjectsSet.add(subject))
      }
    })

    // If no subjects found, use average score as a single dataset
    if (subjectsSet.size === 0) {
      return {
        labels,
        datasets: [
          {
            label: 'Average Score',
            data: studentsArray.map(s => {
              const score = s.averageScore || s.score || s.total_exp || 0
              // If score is > 100, it might be exp, so normalize it
              return score > 100 ? Math.min(100, Math.round(score / 100)) : score
            }),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
          }
        ]
      }
    }

    // Create datasets for each subject
    const subjects = Array.from(subjectsSet)
    const backgroundColorPalette = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(168, 85, 247, 0.8)'
    ]

    const datasets = subjects.map((subject, index) => ({
      label: subject.charAt(0).toUpperCase() + subject.slice(1),
      data: studentsArray.map(s => {
        if (s.performance && s.performance[subject] !== undefined) {
          return s.performance[subject]
        }
        if (s[subject] !== undefined) {
          return s[subject]
        }
        // Fallback to average score if subject-specific data not available
        return s.averageScore || s.score || 0
      }),
      backgroundColor: backgroundColorPalette[index % backgroundColorPalette.length],
    }))

    return {
      labels,
      datasets
    }
  }

  const studentPerformanceData = transformStudentPerformanceData()

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%'
          }
        }
      },
    },
  }

  // Debug: Log chart data
  console.log('Chart data loaded:', { studentPerformanceData, mathProgressData, scienceProgressData })

  const tabs = [
    { id: 'student-performance', label: 'Student Performance' },
    { id: 'progress-over-time', label: 'Progress Over Time' },
    { id: 'quiz-assignment', label: 'Quiz/Assignment Summaries' },
    { id: 'ai-insights', label: 'AI Insights' }
  ]

  // Transform API data for students - handle various response structures
  const transformStudentsData = () => {
    if (!studentPerformanceReport) {
      return []
    }

    // Get students array from various possible response structures
    let studentsArray = []
    if (Array.isArray(studentPerformanceReport)) {
      studentsArray = studentPerformanceReport
    } else if (studentPerformanceReport.students && Array.isArray(studentPerformanceReport.students)) {
      studentsArray = studentPerformanceReport.students
    } else if (studentPerformanceReport.data && Array.isArray(studentPerformanceReport.data)) {
      studentsArray = studentPerformanceReport.data
    }

    if (!studentsArray || studentsArray.length === 0) {
      return []
    }

    return studentsArray.map(s => {
      // Extract name
      const name = s.student_name || s.name || 
                   `${s.firstName || ''} ${s.lastName || ''}`.trim() || 
                   'Unknown'
      
      // Extract class
      const classValue = s.class || s.className || 'N/A'
      
      // Calculate score (handle different formats)
      let score = 0
      if (s.averageScore !== undefined) {
        score = s.averageScore
      } else if (s.score !== undefined) {
        score = s.score
      } else if (s.total_exp !== undefined) {
        // Convert exp to percentage (scaled)
        score = Math.min(100, Math.round((s.total_exp || 0) / 100))
      } else if (s.performance && typeof s.performance === 'object') {
        // Calculate average from performance object
        const scores = Object.values(s.performance).filter(v => typeof v === 'number')
        score = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      }
      score = Math.min(100, Math.max(0, score)) // Clamp between 0 and 100

      // Extract attendance
      const attendance = s.attendance !== undefined ? s.attendance : 
                        s.attendanceRate !== undefined ? s.attendanceRate : 0

      // Extract assignments
      let assignments = '0/0'
      if (s.assignmentsCompleted !== undefined && s.totalAssignments !== undefined) {
        assignments = `${s.assignmentsCompleted}/${s.totalAssignments}`
      } else if (s.modules_completed !== undefined) {
        const completed = s.modules_completed || 0
        const total = completed + (s.chapters_completed || 0) || 1
        assignments = `${completed}/${total}`
      } else if (s.assignments && typeof s.assignments === 'string') {
        assignments = s.assignments
      }

      return {
        name,
        class: classValue,
        score,
        attendance,
        assignments
      }
    })
  }

  const students = transformStudentsData()

  // Transform class performance from analytics report
  const classPerformance = analyticsReport?.overview ? [
    { class: 'Total Students', score: Math.round((analyticsReport.overview.total_students || 0) / 10) },
    { class: 'Active Classes', score: Math.round((analyticsReport.overview.active_classes || 0) * 10) },
  ] : []

  // Transform AI insights - backend returns array of insights
  const aiInsightsData = Array.isArray(aiInsightsReport) ? aiInsightsReport : []
  const aiInsights = aiInsightsData.map((insight) => {
    // Map icon based on insight title/description
    let IconComponent = TrendingUp
    if (insight.title?.toLowerCase().includes('engagement') || insight.title?.toLowerCase().includes('completion')) {
      IconComponent = Lightbulb
    }
    
    return {
      icon: IconComponent,
      title: insight.title || 'AI Insight',
      description: insight.description || (insight.recommendations?.[0] || ''),
      color: insight.impact === 'high' ? 'text-red-600' : insight.impact === 'medium' ? 'text-yellow-600' : 'text-blue-600',
      bgColor: insight.impact === 'high' ? 'bg-red-50' : insight.impact === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
    }
  })

  // Transform quiz/assignment data - backend returns array of summaries
  const quizAssignmentItems = Array.isArray(quizAssignmentSummaries) ? quizAssignmentSummaries : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
        <p className="text-gray-600 mt-2">Analyze student performance and progress with detailed reports.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ease-in-out hover:scale-105 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Classes</option>
            <option value="9A">Class 9A</option>
            <option value="10A">Class 10A</option>
            <option value="10B">Class 10B</option>
            <option value="10C">Class 10C</option>
          </select>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Subjects</option>
            <option value="math">Mathematics</option>
            <option value="science">Science</option>
            <option value="english">English</option>
            <option value="history">History</option>
          </select>
          
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'student-performance' && (
        <div className="space-y-6">
          {/* Student Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ease-in-out">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Performance Overview</h2>
            <div className="h-64 w-full animate-fade-in">
              {studentPerformanceData ? (
                <Bar data={studentPerformanceData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No student performance data available
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Performance Table */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Student Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignments Completed</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.class}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${student.score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{student.score}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.attendance}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.assignments}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No student data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Class Performance */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance</h3>
              <p className="text-sm text-gray-600 mb-4">Average score by class</p>
              <div className="space-y-3">
                {classPerformance.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{item.class}</span>
                      <span className="text-sm font-medium text-gray-900">{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Over Time */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Over Time</h3>
              <p className="text-sm text-gray-600 mb-4">Last 6 Months</p>
              <div className="h-32 w-full">
                <Line data={mathProgressData} options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      max: 100
                    }
                  },
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    }
                  }
                }} />
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Progress Over Time Tab */}
      {activeTab === 'progress-over-time' && (
        <div className="space-y-6">
          {/* Period Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Over Time Report</h3>
            <p className="text-gray-600 mb-6">Track student performance trends over different periods.</p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDateRange === '7' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                Weekly
              </button>
              <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDateRange === '30' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                Monthly
              </button>
              <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDateRange === '90' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                Quarterly
              </button>
              <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDateRange === '365' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                Yearly
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mathematics Performance */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Mathematics Performance</h4>
                  <span className="text-sm text-gray-600">Last 3 Months</span>
                </div>
                <div className="flex items-center mb-4">
                  <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15%
                  </div>
                </div>
                <div className="h-32 w-full">
                  <Line data={mathProgressData} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        display: false
                      }
                    }
                  }} />
                </div>
              </div>

              {/* Science Performance */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Science Performance</h4>
                  <span className="text-sm text-gray-600">Last 3 Months</span>
                </div>
                <div className="flex items-center mb-4">
                  <div className="flex items-center bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                    <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                    -5%
                  </div>
                </div>
                <div className="h-32 w-full">
                  <Line data={scienceProgressData} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        display: false
                      }
                    }
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz/Assignment Summaries Tab */}
      {activeTab === 'quiz-assignment' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quiz & Assignment Reports</h3>
              <p className="text-gray-600 mt-2">An overview of performance across all quizzes and assignments.</p>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz/Assignment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Highest Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lowest Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quizAssignmentItems.length > 0 ? (
                      quizAssignmentItems.map((item, index) => {
                        // Backend returns: participants, completed, average_score
                        const completionRate = item.participants && item.completed 
                          ? Math.round((item.completed / item.participants) * 100) 
                          : 0;
                        const colorClass = completionRate >= 90 ? 'bg-green-500' : completionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500';
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.title || item.name}</div>
                              {item.subject && (
                                <div className="text-sm text-gray-500">{item.subject} - {item.class}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.average_score || item.averageScore || 0}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">-</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">-</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${completionRate}%` }}></div>
                                </div>
                                <span className="text-sm text-gray-900">{completionRate}%</span>
                                <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2">View Details</a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No quiz or assignment data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiInsights.map((insight, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start">
                  <div className={`p-3 rounded-lg ${insight.bgColor} mr-4`}>
                    <insight.icon className={`h-6 w-6 ${insight.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-gray-600 mb-4">{insight.description}</p>
                    <button 
                      onClick={() => navigate('/ai-insights')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick Access to Full AI Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Comprehensive AI Analysis</h3>
                <p className="text-blue-700">Get detailed AI insights including weak topics, remedial activities, and mastery heatmaps.</p>
              </div>
              <button 
                onClick={() => navigate('/ai-insights')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Full AI Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
