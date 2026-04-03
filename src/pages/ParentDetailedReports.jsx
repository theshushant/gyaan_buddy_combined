import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Filter, Sparkles } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import parentService from '../services/parentService'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

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
  const [rangeFilter, setRangeFilter] = useState('30')

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
    const subjects = progress?.subject_progress || []
    return subjects.map((s) => ({
      id: String(s.subject_id),
      name: s.subject_name,
      accuracy: Math.round(s.accuracy || 0),
      questions: s.total_questions || 0,
      attempted: s.questions_attempted || 0,
      correct: s.correct_answers || 0,
      wrong: s.wrong_answers || 0,
    }))
  }, [progress])

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
    const days = Number(rangeFilter)
    const start = Number.isFinite(days) ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null

    return tests
      .filter((t) => t?.user_progress?.percentage != null && t?.test_datetime)
      .filter((t) => (selectedSubject ? String(t.subject) === selectedSubject.id : true))
      .filter((t) => (start ? new Date(t.test_datetime) >= start : true))
      .sort((a, b) => new Date(a.test_datetime) - new Date(b.test_datetime))
  }, [tests, selectedSubject, rangeFilter])

  const trendData = useMemo(() => ({
    labels: filteredTests.map((t) => new Date(t.test_datetime).toLocaleDateString()),
    datasets: [
      {
        label: 'Score %',
        data: filteredTests.map((t) => Math.round(t.user_progress?.percentage || 0)),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.16)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  }), [filteredTests])

  const moduleProgress = useMemo(() => {
    if (!selectedSubject) return []
    const map = new Map()

    filteredTests.forEach((test) => {
      const score = Number(test.user_progress?.percentage || 0)
      const groups = Array.isArray(test.module_chapters) ? test.module_chapters : []

      groups.forEach((group) => {
        const moduleName = group?.module_name || 'Module'
        const prev = map.get(moduleName) || { moduleName, scores: [] }
        prev.scores.push(score)
        map.set(moduleName, prev)
      })
    })

    return [...map.values()]
      .map((entry) => {
        const avg = entry.scores.length
          ? Math.round(entry.scores.reduce((sum, v) => sum + v, 0) / entry.scores.length)
          : 0

        let tag = 'Needs Practice'
        let tagClass = 'bg-amber-100 text-amber-800'
        if (avg >= 90) {
          tag = 'Mastered'
          tagClass = 'bg-green-100 text-green-800'
        } else if (avg >= 75) {
          tag = 'Proficient'
          tagClass = 'bg-blue-100 text-blue-800'
        }

        return {
          moduleName: entry.moduleName,
          percentage: avg,
          tag,
          tagClass,
        }
      })
      .sort((a, b) => b.percentage - a.percentage)
  }, [filteredTests, selectedSubject])

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
    const bestModule = moduleProgress[0]
    const focusModule = moduleProgress[moduleProgress.length - 1]

    if (!moduleProgress.length) {
      return `${selectedSubject.name} has ${avg}% accuracy currently. Complete more tests to unlock module-wise insights.`
    }

    return `${progress?.student_name || 'Student'} is at ${avg}% in ${selectedSubject.name}. Strongest area is ${bestModule.moduleName} (${bestModule.percentage}%). Focus next on ${focusModule.moduleName} to improve overall consistency.`
  }, [selectedSubject, moduleProgress, progress])

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

        <label className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value)}
            className="w-full bg-transparent outline-none font-medium text-gray-900"
          >
            <option value="30">Date Range: Last 30 Days</option>
            <option value="90">Date Range: Last 90 Days</option>
            <option value="365">Date Range: Last 12 Months</option>
            <option value="all">Date Range: All Time</option>
          </select>
        </label>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-4xl max-sm:text-2xl font-extrabold text-gray-900">Current Reports for {subjectTitle}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-sm text-gray-500">Subject Grade</p>
            <p className="text-5xl font-extrabold text-blue-700 mt-2">{scoreToGrade(selectedSubject?.accuracy || 0)}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-sm text-gray-500">XP Gained ({subjectTitle})</p>
            <p className="text-5xl font-extrabold text-gray-900 mt-2">{subjectXP.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-sm text-gray-500">Performance Percentile</p>
            <p className="text-5xl font-extrabold text-gray-900 mt-2">{performancePercentile ? percentileSuffix(performancePercentile) : 'NA'}</p>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-900 text-base leading-relaxed">
          <span className="font-semibold inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Summary:</span> {summaryText}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-4xl max-sm:text-2xl font-extrabold text-gray-900 mb-4">Performance Trends in {subjectTitle}</h2>
        {filteredTests.length >= 2 ? (
          <Line
            data={trendData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, max: 100 } },
            }}
          />
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Not enough test history to render the trend graph yet.</div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-4xl max-sm:text-2xl font-extrabold text-gray-900 mb-4">Module-wise Progress in {subjectTitle}</h2>
        <div className="space-y-4">
          {moduleProgress.map((module) => (
            <div key={module.moduleName} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="font-semibold text-gray-900">{module.moduleName}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${module.tagClass}`}>{module.tag}</span>
                  <span className="text-sm font-semibold text-gray-600">{module.percentage}% Complete</span>
                </div>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${module.percentage}%` }} />
              </div>
            </div>
          ))}

          {!moduleProgress.length && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Module-wise progress is unavailable because there are no completed tests with module mappings for this filter.
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
                  <th className="px-4 py-3">Topic</th>
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
                  <tr key={row.topic_id} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{subjectTitle}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.topic_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{Math.round(row.attempt_rate || 0)}%</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{Math.round(row.proficiency || 0)}%</td>
                    <td className="px-4 py-3 text-sm text-red-700">{weakTopics.includes(row.topic_name) ? 'Yes' : '-'}</td>
                    <td className="px-4 py-3 text-sm text-green-700">{strongTopics.includes(row.topic_name) ? 'Yes' : '-'}</td>
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
