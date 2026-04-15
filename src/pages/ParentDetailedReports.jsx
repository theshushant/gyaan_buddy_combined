import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Filter, Sparkles } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import parentService from '../services/parentService'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const scoreToGrade = (score = 0) => {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C'
  return 'D'
}

const percentileSuffix = (n) => {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`
  if (n % 10 === 1) return `${n}st`
  if (n % 10 === 2) return `${n}nd`
  if (n % 10 === 3) return `${n}rd`
  return `${n}th`
}

const buildMonthKey = (value) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`

const ParentDetailedReports = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(null)
  const [tests, setTests] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [subjectDetails, setSubjectDetails] = useState(null)
  const [subjectDetailsLoading, setSubjectDetailsLoading] = useState(false)

  const [subjectFilter, setSubjectFilter] = useState('all')
  const [studentFilter, setStudentFilter] = useState('me')
  const [monthFilter, setMonthFilter] = useState('6')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [progressRes, testsRes, leaderboardRes] = await Promise.all([
          parentService.getMyProgress(),
          parentService.getMyTests(),
          parentService.getLeaderboard(),
        ])
        setProgress(progressRes || null)
        setTests(Array.isArray(testsRes) ? testsRes : [])
        setLeaderboard(leaderboardRes?.leaderboard || [])
      } catch (err) {
        setError(err.message || 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const subjectOptions = useMemo(() => {
    const subjects = Array.isArray(progress?.subject_progress) ? progress.subject_progress : []

    const normalizedFromProgress = subjects
      .map((s) => {
        const id = s?.subject_id ?? s?.subject ?? s?.id ?? null
        if (!id) return null
        return {
          id: String(id),
          name: s?.subject_name || s?.name || 'Subject',
          accuracy: Math.round(Number(s?.accuracy || 0)),
          questions: Number(s?.total_questions || 0),
          attempted: Number(s?.questions_attempted || 0),
          correct: Number(s?.correct_answers || 0),
          wrong: Number(s?.wrong_answers || 0),
        }
      })
      .filter(Boolean)

    if (normalizedFromProgress.length > 0) return normalizedFromProgress

    // Fallback for payloads where my-progress has no/changed subject_progress shape.
    // Derive subjects from tests so subject-level API can still be called.
    const bySubject = new Map()
    tests.forEach((t) => {
      const id = t?.subject ?? t?.subject_id ?? null
      if (!id) return
      const key = String(id)
      if (!bySubject.has(key)) {
        bySubject.set(key, {
          id: key,
          name: t?.subject_name || 'Subject',
          accuracy: 0,
          questions: 0,
          attempted: 0,
          correct: 0,
          wrong: 0,
        })
      }
    })

    return [...bySubject.values()]
  }, [progress, tests])

  const selectedSubject = useMemo(() => {
    if (!subjectOptions.length) return null
    if (subjectFilter === 'all') return subjectOptions[0]
    return subjectOptions.find((s) => s.id === subjectFilter) || subjectOptions[0]
  }, [subjectFilter, subjectOptions])

  useEffect(() => {
    const loadSubjectDetails = async () => {
      if (!selectedSubject?.id) {
        setSubjectDetails(null)
        return
      }
      try {
        setSubjectDetailsLoading(true)
        const details = await parentService.getSubjectPerformance(selectedSubject.id)
        setSubjectDetails(details || null)
      } catch (err) {
        setSubjectDetails(null)
      } finally {
        setSubjectDetailsLoading(false)
      }
    }
    loadSubjectDetails()
  }, [selectedSubject?.id])

  const filteredTests = useMemo(() => {
    const now = new Date()
    const months = Number(monthFilter)
    const start = Number.isFinite(months)
      ? new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
      : null

    return tests
      .filter((t) => t?.user_progress?.percentage != null && t?.test_datetime)
      .filter((t) => (selectedSubject ? String(t.subject) === selectedSubject.id : true))
      .filter((t) => (start ? new Date(t.test_datetime) >= start : true))
      .sort((a, b) => new Date(a.test_datetime) - new Date(b.test_datetime))
  }, [tests, selectedSubject, monthFilter])

  const monthlyTrendPoints = useMemo(() => {
    const monthMap = new Map()

    filteredTests.forEach((test) => {
      const date = new Date(test.test_datetime)
      const key = buildMonthKey(date)
      const current = monthMap.get(key) || {
        key,
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        total: 0,
        count: 0,
      }

      current.total += Number(test.user_progress?.percentage || 0)
      current.count += 1
      monthMap.set(key, current)
    })

    return [...monthMap.values()]
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((item) => ({
        ...item,
        average: Math.round(item.total / item.count),
      }))
  }, [filteredTests])

  const trendData = useMemo(() => ({
    labels: monthlyTrendPoints.map((point) => point.label),
    datasets: [
      {
        label: 'Average Score %',
        data: monthlyTrendPoints.map((point) => point.average),
        backgroundColor: monthlyTrendPoints.map((point) => {
          if (point.average >= 85) return '#1d4ed8'
          if (point.average >= 70) return '#2563eb'
          return '#60a5fa'
        }),
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 92,
        categoryPercentage: 0.8,
        barPercentage: 0.72,
      },
    ],
  }), [monthlyTrendPoints])

  const topicProgress = useMemo(() => {
    const topics = Array.isArray(subjectDetails?.topics) ? subjectDetails.topics : []

    return topics
      .map((topic) => ({
        id: topic.chapter_id || topic.topic_id,
        name: topic.chapter_name || topic.topic_name,
        proficiency: Math.round(topic.proficiency || 0),
        attemptRate: Math.round(topic.attempt_rate || 0),
      }))
      .sort((a, b) => b.proficiency - a.proficiency)
  }, [subjectDetails])

  const subjectXP = useMemo(() => {
    if (!selectedSubject) return 0
    return filteredTests.reduce((sum, t) => sum + Number(t.user_progress?.exp_earned || 0), 0)
  }, [filteredTests, selectedSubject])

  const performancePercentile = useMemo(() => {
    const myRank = leaderboard.find((row) => row.is_me)
    if (!myRank || !leaderboard.length) return null
    const percentile = Math.max(1, Math.round(((leaderboard.length - myRank.rank + 1) / leaderboard.length) * 100))
    return percentile
  }, [leaderboard])

  const summaryText = useMemo(() => {
    if (!selectedSubject) return 'Not enough subject data to generate a summary yet.'

    const avg = selectedSubject.accuracy
    const bestTopic = topicProgress[0]
    const focusTopic = topicProgress[topicProgress.length - 1]

    if (!topicProgress.length) {
      return `${selectedSubject.name} has ${avg}% accuracy currently. Complete more questions to unlock chapter-wise insights.`
    }

    return `${progress?.student_name || 'Student'} is at ${avg}% in ${selectedSubject.name}. Strongest chapter is ${bestTopic.name} (${bestTopic.proficiency}%). Focus next on ${focusTopic.name} to improve overall consistency.`
  }, [selectedSubject, topicProgress, progress])

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Loading detailed reports...</div>
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>

  const studentName = progress?.student_name || 'Student'
  const subjectTitle = selectedSubject?.name || 'Subject'
  const topicRows = Array.isArray(subjectDetails?.topics) ? subjectDetails.topics : []
  const weakTopics = Array.isArray(subjectDetails?.weak_topics) ? subjectDetails.weak_topics : []
  const strongTopics = Array.isArray(subjectDetails?.strong_topics) ? subjectDetails.strong_topics : []
  const teacherName = subjectDetails?.teacher_name || '-'
  const strongQuestionLevel = subjectDetails?.strong_question_level ?? '-'
  const weakLevels = Array.isArray(subjectDetails?.weak_levels) ? subjectDetails.weak_levels : []

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-5xl max-sm:text-3xl font-extrabold tracking-tight text-gray-900">Detailed Reports for {studentName}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedSubject?.id || 'all'}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-gray-900"
          >
            {subjectOptions.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </label>

        <label className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-gray-900"
          >
            <option value="me">Child: {studentName}</option>
          </select>
        </label>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-4xl max-sm:text-2xl font-extrabold text-gray-900">Performance Trends in {subjectTitle}</h2>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-500">Month-wise average test score</div>
            <label className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="bg-transparent outline-none font-medium text-gray-900"
              >
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
                <option value="all">All Months</option>
              </select>
            </label>
          </div>
        </div>
        {monthlyTrendPoints.length > 0 ? (
          <div className="h-[340px]">
            <Bar
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#0f172a',
                    displayColors: false,
                    callbacks: {
                      label: (context) => `Average Score: ${context.parsed.y}%`,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: '#475569',
                      font: {
                        size: 13,
                        weight: '600',
                      },
                    },
                    border: { display: false },
                  },
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      stepSize: 20,
                      color: '#64748b',
                      font: {
                        size: 12,
                        weight: '600',
                      },
                    },
                    grid: {
                      color: '#e2e8f0',
                    },
                    border: { display: false },
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No month-wise test data is available for this filter yet.</div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-4xl max-sm:text-2xl font-extrabold text-gray-900 mb-4">Topic-wise Progress in {subjectTitle}</h2>
        <div className="space-y-4">
          {topicProgress.map((topic) => (
            <div key={topic.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="font-semibold text-gray-900">{topic.name}</p>
                <span className="text-sm font-semibold text-gray-600">{topic.proficiency}%</span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${topic.proficiency}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Attempt Rate: {topic.attemptRate}%</p>
            </div>
          ))}

          {!topicProgress.length && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Topic-wise progress is unavailable because no chapter analytics are available for this subject yet.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-3xl max-sm:text-2xl font-extrabold text-gray-900 mb-4">Detailed Subject Report</h2>
        {subjectDetailsLoading ? (
          <div className="text-sm text-gray-500">Loading detailed report...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Chapter</th>
                  <th className="px-4 py-3">Attempt Rate</th>
                  <th className="px-4 py-3">Proficiency</th>
                  <th className="px-4 py-3">Weak Topic</th>
                  <th className="px-4 py-3">Strong Topic</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Strong Question Level</th>
                  <th className="px-4 py-3">Weak Levels (1-5)</th>
                </tr>
              </thead>
              <tbody>
                {topicRows.length > 0 ? topicRows.map((row) => (
                  <tr key={row.chapter_id || row.topic_id} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{subjectTitle}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.chapter_name || row.topic_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{Math.round(row.attempt_rate || 0)}%</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{Math.round(row.proficiency || 0)}%</td>
                    <td className="px-4 py-3 text-sm text-red-700">{weakTopics.includes(row.chapter_name || row.topic_name) ? 'Yes' : '-'}</td>
                    <td className="px-4 py-3 text-sm text-green-700">{strongTopics.includes(row.chapter_name || row.topic_name) ? 'Yes' : '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{teacherName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{strongQuestionLevel}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{weakLevels.length ? weakLevels.join(', ') : '-'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500">
                      No topic-level report data available for this subject.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ParentDetailedReports
