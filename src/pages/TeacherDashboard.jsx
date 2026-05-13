import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
import {
  fetchDashboardMetrics,
  fetchProgressTrends,
  fetchSubjectPerformance,
  fetchClassDistribution,
  fetchDashboardAlerts,
  fetchQuickSummary,
  setFilters,
  clearError
} from '../features/dashboard/dashboardSlice'
import classesService from '../services/classesService'
import subjectsService from '../services/subjectsService'

const InfoTooltip = ({ text }) => (
  <div className="relative inline-block group">
    <span className="ml-1 text-gray-400 hover:text-gray-600 cursor-help text-sm select-none">ⓘ</span>
    <div className="absolute z-50 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 text-xs text-white bg-gray-800 rounded-lg px-3 py-2 shadow-lg pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
    </div>
  </div>
)

const CARD_TOOLTIPS = {
  'Attempt Rate': 'Percentage of your students who attempted at least one question in the selected subject / class.',
  'Overall Student Percentage': 'Average score (%) across all quiz attempts by your students in the selected subject / class.',
  'Topics Covered': 'Chapters started by students vs. total available chapters in the selected subject (e.g. 3/10).',
  'Last Assignment Attempt Rate': 'Percentage of students who attempted the most recently assigned assignment.',
  'Weak Topics': 'Number of topics where the average student score is below 50%.',
  'Total Students': 'Total students enrolled across all classes you teach.',
  'My Students': 'Total students enrolled across all classes you teach.',
  'Classes Teaching': 'Number of classes you are currently assigned to teach.',
  'Chapter Covered': 'Chapters completed by students / total chapters in the selected subject.',
}

const getId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') return String(value.id ?? value.uuid ?? '')
  return String(value)
}

const getTeacherAssignedIds = (user) => {
  const classes = new Set()
  const subjects = new Set()
  const assignments = user?.teacher_assignments || user?.assignments || []

  if (Array.isArray(assignments)) {
    assignments.forEach((assignment) => {
      const classId = getId(assignment.class ?? assignment.class_id ?? assignment.class_instance)
      const subjectId = getId(assignment.subject ?? assignment.subject_id)
      if (classId) classes.add(classId)
      if (subjectId) subjects.add(subjectId)
      if (Array.isArray(assignment.subjects)) {
        assignment.subjects.forEach((subject) => {
          const id = getId(subject)
          if (id) subjects.add(id)
        })
      }
    })
  }

  ;(user?.classes || user?.class_list || []).forEach((cls) => {
    const id = getId(cls)
    if (id) classes.add(id)
  })

  ;(user?.subjects || user?.subject_list || []).forEach((subject) => {
    const id = getId(subject)
    if (id) subjects.add(id)
  })

  return { classes, subjects }
}

const TeacherDashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { role, user } = useSelector(state => state.auth)
  const {
    progressTrends,
    subjectPerformance,
    classDistribution,
    classWiseChart,
    alerts,
    weakTopicCount,
    quickSummary,
    filters,
    loading,
    error
  } = useSelector(state => state.dashboard)

  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  const labelMapping = {
    "My Students' Average Score": "Attempt rate",
    "Module Completed": "Last Assignment Attempt Rate",
    "Students Engaged": "Last Chapter Student Engagement",
    "Questions Created": "Topics covered"
  }

  const getMappedLabel = (label) => {
    return labelMapping[label] || label
  }

  const dashboardFilters = { class: filters.class || '', subject: filters.subject || '' }

  const fetchClassesAndSubjects = useCallback(async () => {
    setLoadingOptions(true)
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        classesService.getClasses(),
        subjectsService.getSubjects()
      ])
      const classesData = classesRes.data ?? classesRes ?? []
      const subjectsData = subjectsRes.data ?? subjectsRes ?? []
      const assigned = getTeacherAssignedIds(user)
      const classesList = Array.isArray(classesData) ? classesData : []
      const subjectsList = Array.isArray(subjectsData) ? subjectsData : []
      setClasses(role === 'teacher' && assigned.classes.size > 0
        ? classesList.filter((c) => assigned.classes.has(getId(c)))
        : classesList)
      setSubjects(role === 'teacher' && assigned.subjects.size > 0
        ? subjectsList.filter((s) => assigned.subjects.has(getId(s)))
        : subjectsList)
    } catch (err) {
      console.error('Error fetching filter options:', err)
      setClasses([])
      setSubjects([])
    } finally {
      setLoadingOptions(false)
    }
  }, [role, user])

  useEffect(() => {
    fetchClassesAndSubjects()
  }, [fetchClassesAndSubjects])

  // Set default subject when subjects load and none is selected; then fetch with that subject
  useEffect(() => {
    if (subjects.length > 0 && !filters.subject) {
      const firstId = subjects[0].id ?? subjects[0].uuid ?? ''
      if (firstId) {
        dispatch(setFilters({ subject: firstId }))
        // Fetch immediately with default subject so API gets the filter (state update is async)
        const applied = { class: filters.class || '', subject: String(firstId) }
        const payload = { role: role || 'teacher', filters: applied }
        dispatch(fetchDashboardMetrics(payload))
        dispatch(fetchQuickSummary(payload))
        dispatch(fetchProgressTrends(applied))
        dispatch(fetchSubjectPerformance(applied))
        dispatch(fetchClassDistribution())
        dispatch(fetchDashboardAlerts())
      }
    }
  }, [subjects, filters.subject, dispatch, role, filters.class])

  useEffect(() => {
    const hasError = Object.values(error).some(err => err !== null)
    if (hasError) {
      return
    }
    // When we have subjects but no subject filter, skip (default-subject effect will fetch)
    if (subjects.length > 0 && !dashboardFilters.subject) {
      return
    }

    const fetchDashboardData = async () => {
      const payload = { role: role || 'teacher', filters: dashboardFilters }
      try {
        await Promise.all([
          dispatch(fetchDashboardMetrics(payload)),
          dispatch(fetchProgressTrends(dashboardFilters)),
          dispatch(fetchSubjectPerformance(dashboardFilters)),
          dispatch(fetchClassDistribution()),
          dispatch(fetchDashboardAlerts()),
          dispatch(fetchQuickSummary(payload))
        ])
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      }
    }

    fetchDashboardData()
  }, [dispatch, role, error, dashboardFilters.subject, dashboardFilters.class, subjects.length])

  const hasError = Object.values(error).some(err => err !== null)
  const isLoading = Object.values(loading).some(load => load === true)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#00167a' }}></div>
      </div>
    )
  }

  if (hasError) {
    const handleRetry = async () => {
      dispatch(clearError())
      const payload = { role: role || 'teacher', filters: dashboardFilters }
      try {
        await Promise.all([
          dispatch(fetchDashboardMetrics(payload)),
          dispatch(fetchProgressTrends(dashboardFilters)),
          dispatch(fetchSubjectPerformance(dashboardFilters)),
          dispatch(fetchClassDistribution()),
          dispatch(fetchDashboardAlerts()),
          dispatch(fetchQuickSummary(payload))
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
            className="px-4 py-2 text-white rounded transition-colors"
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

  const visibleSubjects = filters.class
    ? subjects.filter((s) =>
        (s.class_list || []).some(
          (c) => String(c.class_instance__id ?? c.id) === String(filters.class)
        )
      )
    : subjects

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value || '' }
    if (key === 'class') {
      const stillVisible = visibleSubjects.some(
        (s) => String(s.id ?? s.uuid) === String(filters.subject)
      )
      if (!stillVisible) newFilters.subject = ''
    }
    dispatch(setFilters(newFilters))
    const applied = { class: newFilters.class || '', subject: newFilters.subject || '' }
    const payload = { role: role || 'teacher', filters: applied }
    dispatch(fetchDashboardMetrics(payload))
    dispatch(fetchQuickSummary(payload))
    dispatch(fetchProgressTrends(applied))
    dispatch(fetchSubjectPerformance(applied))
  }

  const quickSummaryExcludedLabels = [
    'Attempt Rate',
    'Questions Created',
    'Weak Topics',
    'Last Assignment Attempt Rate',
    'Overall Student Percentage',
  ]
  const quickSummaryData = Array.isArray(quickSummary) && quickSummary.length > 0
    ? quickSummary.filter((item) => !quickSummaryExcludedLabels.includes(item.label))
    : [
        { label: 'My Students', value: '—' },
        { label: 'Classes Teaching', value: '—' },
        { label: 'Chapter Covered', value: '—' },
      ]

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Teacher Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Class</span>
            <select
              value={filters.class || ''}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              disabled={loadingOptions}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 min-w-[140px]"
              style={{ color: '#00167a' }}
            >
              {classes.map((c) => (
                <option key={c.id ?? c.uuid} value={c.id ?? c.uuid}>
                  {c.name ?? c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Subject</span>
            <select
              value={filters.subject || ''}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              disabled={loadingOptions}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 min-w-[140px]"
              style={{ color: '#00167a' }}
            >
              {visibleSubjects.map((s) => (
                <option key={s.id ?? s.uuid} value={s.id ?? s.uuid}>
                  {s.name ?? s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700 animate-slide-right">Class-wise quick stats</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 animate-count-up" style={{ color: '#00167a' }}>
                {quickSummary?.find((i) => i.label === 'Attempt Rate')?.value ?? '—'}
              </div>
              <div className="text-gray-600 flex items-center justify-center">
                Attempt Rate<InfoTooltip text={CARD_TOOLTIPS['Attempt Rate']} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 animate-count-up" style={{ color: '#00167a' }}>
                {quickSummary?.find((i) => i.label === 'Overall Student Percentage')?.value ?? '—'}
              </div>
              <div className="text-gray-600 flex items-center justify-center">
                Overall Student Percentage<InfoTooltip text={CARD_TOOLTIPS['Overall Student Percentage']} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 animate-count-up" style={{ color: '#00167a' }}>
                {quickSummary?.find((i) => i.label === 'Topics Covered')?.value ?? '0/0'}
              </div>
              <div className="text-gray-600 flex items-center justify-center">
                Topics Covered<InfoTooltip text={CARD_TOOLTIPS['Topics Covered']} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 animate-count-up" style={{ color: '#00167a' }}>
                {quickSummary?.find((i) => i.label === 'Last Assignment Attempt Rate')?.value ?? '—'}
              </div>
              <div className="text-gray-600 flex items-center justify-center">
                Last Assignment Attempt Rate<InfoTooltip text={CARD_TOOLTIPS['Last Assignment Attempt Rate']} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.5s'}}>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 animate-count-up" style={{ color: '#00167a' }}>{weakTopicCount ?? 0}</div>
              <div className="text-gray-600 flex items-center justify-center">
                Weak Topics<InfoTooltip text={CARD_TOOLTIPS['Weak Topics']} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 animate-count-up" style={{ color: '#00167a' }}>
                {quickSummary?.find((i) => i.label === 'My Students')?.value ?? '—'}
              </div>
              <div className="text-gray-600 flex items-center justify-center">
                Total Students<InfoTooltip text={CARD_TOOLTIPS['Total Students']} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 animate-slide-right">Shortcuts to most-used actions</h2>
        
        <div className="flex flex-wrap gap-4">
          <button
            className="text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg animate-slide-up"
            style={{animationDelay: '0.4s', backgroundColor: '#00167a'}}
            onClick={() => navigate('/modules')}
          >
            <span className="text-xl transform transition-transform duration-200 hover:rotate-90">+</span>
            <span>Create Assignment</span>
          </button>
          
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg animate-slide-up"
            style={{animationDelay: '0.5s'}}
            onClick={() => navigate('/reports')}
          >
            <span className="text-xl">📊</span>
            <span>View Reports</span>
          </button>
          
          <button
            className="text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg animate-slide-up"
            style={{animationDelay: '0.7s', backgroundColor: '#1fb7eb'}}
            onClick={() => navigate('/tests')}
          >
            <span className="text-xl">📝</span>
            <span>Create Test</span>
          </button>
        </div>
      </div>

      {Array.isArray(classWiseChart) && classWiseChart.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 animate-slide-right">Class-wise Attempt Rate &amp; Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Attempt Rate %</h3>
              <Bar
                data={{
                  labels: classWiseChart.map(c => c.className),
                  datasets: [{
                    label: 'Attempt Rate %',
                    data: classWiseChart.map(c => c.attemptRate),
                    backgroundColor: 'rgba(31, 183, 235, 0.7)',
                    borderColor: 'rgba(31, 183, 235, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    maxBarThickness: 60,
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y}%` } },
                  },
                  scales: {
                    y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` } },
                  },
                }}
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Performance %</h3>
              <Bar
                data={{
                  labels: classWiseChart.map(c => c.className),
                  datasets: [{
                    label: 'Performance %',
                    data: classWiseChart.map(c => c.performance),
                    backgroundColor: 'rgba(0, 22, 122, 0.7)',
                    borderColor: 'rgba(0, 22, 122, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    maxBarThickness: 60,
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y}%` } },
                  },
                  scales: {
                    y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` } },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 animate-slide-right">Quick Summary</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickSummaryData.map((item, index) => (
              <div key={index} className="text-center animate-slide-up" style={{animationDelay: `${(index + 1) * 0.1}s`}}>
                <div className="text-2xl font-bold text-gray-800">{item.value}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  {getMappedLabel(item.label)}
                  {CARD_TOOLTIPS[item.label] && <InfoTooltip text={CARD_TOOLTIPS[item.label]} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default TeacherDashboard
