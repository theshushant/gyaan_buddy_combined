import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  PlayCircle,
  Trophy,
  UserRound,
} from 'lucide-react'
import parentService from '../services/parentService'

const toGrade = (accuracy = 0) => {
  if (accuracy >= 90) return 'A+'
  if (accuracy >= 85) return 'A'
  if (accuracy >= 80) return 'A-'
  if (accuracy >= 75) return 'B+'
  if (accuracy >= 70) return 'B'
  if (accuracy >= 65) return 'B-'
  if (accuracy >= 60) return 'C+'
  if (accuracy >= 50) return 'C'
  return 'D'
}

const subjectGrade = (accuracy = 0) => {
  if (accuracy >= 90) return 'A+'
  if (accuracy >= 80) return 'A'
  if (accuracy >= 70) return 'B+'
  if (accuracy >= 60) return 'B'
  if (accuracy >= 50) return 'C'
  return 'D'
}

const barColor = (accuracy = 0) => {
  if (accuracy >= 80) return 'bg-green-500'
  if (accuracy >= 65) return 'bg-yellow-400'
  return 'bg-red-400'
}

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(null)
  const [weakAreas, setWeakAreas] = useState([])
  const [tests, setTests] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [answerTrends, setAnswerTrends] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [progressRes, weakRes, testsRes, boardRes, trendsRes] = await Promise.all([
          parentService.getMyProgress(),
          parentService.getWeakAreas(),
          parentService.getMyTests(),
          parentService.getLeaderboard(),
          parentService.getAnswerTrends(10),
        ])
        setProgress(progressRes || null)
        setWeakAreas(weakRes?.weak_areas || [])
        setTests(Array.isArray(testsRes) ? testsRes : [])
        setLeaderboard(boardRes?.leaderboard || [])
        setAnswerTrends(trendsRes?.trends || [])
      } catch (err) {
        setError(err.message || 'Failed to load parent dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const upcomingTests = useMemo(() => {
    const now = new Date()
    return [...tests]
      .filter((t) => t?.test_datetime && new Date(t.test_datetime) >= now)
      .sort((a, b) => new Date(a.test_datetime) - new Date(b.test_datetime))
      .slice(0, 3)
  }, [tests])

  const recentActivity = useMemo(() => {
    const activity = []

    const completedTests = tests
      .filter((t) => t?.user_progress?.status === 'completed' && t?.test_datetime)
      .sort((a, b) => new Date(b.test_datetime) - new Date(a.test_datetime))
      .slice(0, 2)
      .map((t) => ({
        id: `test-${t.id}`,
        icon: CheckCircle2,
        iconClass: 'text-green-600 bg-green-100',
        title: `Completed '${t.subject_name || t.name || 'Test'}'`,
        subtitle: `${new Date(t.test_datetime).toLocaleDateString()} • Score ${Math.round(t.user_progress?.percentage || 0)}%`,
      }))

    activity.push(...completedTests)

    if (answerTrends.length > 0) {
      const latest = [...answerTrends].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      activity.push({
        id: 'trend-latest',
        icon: PlayCircle,
        iconClass: 'text-blue-600 bg-blue-100',
        title: `Practiced ${latest.total_answers || 0} questions`,
        subtitle: `${new Date(latest.date).toLocaleDateString()} • Accuracy ${Math.round(latest.accuracy || 0)}%`,
      })
    }

    const myRank = leaderboard.find((entry) => entry.is_me)
    if (myRank) {
      activity.push({
        id: 'rank',
        icon: Trophy,
        iconClass: 'text-amber-600 bg-amber-100',
        title: `Class Rank #${myRank.rank}`,
        subtitle: `${myRank.total_exp || 0} XP • ${Math.round(myRank.accuracy || 0)}% accuracy`,
      })
    }

    return activity.slice(0, 3)
  }, [tests, answerTrends, leaderboard])

  const generatedInsights = useMemo(() => {
    const insights = []
    const overallAcc = Math.round(progress?.overall_stats?.accuracy || 0)
    const completedTests = tests.filter((t) => t?.user_progress?.percentage != null)
    const avgTest = completedTests.length
      ? Math.round(completedTests.reduce((s, t) => s + (t.user_progress?.percentage || 0), 0) / completedTests.length)
      : null

    if (avgTest != null) {
      const delta = avgTest - overallAcc
      if (delta >= 8) {
        insights.push({
          type: 'positive',
          text: `Recent test performance is ${delta}% above overall baseline. Current strategy is working.`,
        })
      } else if (delta <= -8) {
        insights.push({
          type: 'focus',
          text: `Recent tests are ${Math.abs(delta)}% below overall baseline. Schedule a revision cycle this week.`,
        })
      }
    }

    const weakest = (progress?.subject_progress || [])
      .slice()
      .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0))[0]
    if (weakest) {
      insights.push({
        type: 'focus',
        text: `${weakest.subject_name} is the current lowest subject at ${Math.round(weakest.accuracy || 0)}%.`,
      })
    }

    const activeDays = answerTrends.filter((t) => (t.total_answers || 0) > 0).length
    if (activeDays >= 6) {
      insights.push({
        type: 'positive',
        text: `Strong consistency: activity recorded on ${activeDays} of the last ${answerTrends.length || 10} tracked days.`,
      })
    } else if (answerTrends.length > 0) {
      insights.push({
        type: 'focus',
        text: `Low consistency: activity recorded on ${activeDays} of the last ${answerTrends.length} tracked days.`,
      })
    }

    return insights.slice(0, 3)
  }, [progress, tests, answerTrends])

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Loading parent dashboard...</div>
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
  }

  const stats = progress?.overall_stats || {}
  const xp = progress?.exp_and_level?.total_exp || 0
  const subjectProgress = progress?.subject_progress || []
  const mastered = subjectProgress.filter((s) => (s.accuracy || 0) >= 70).length
  const studentName = progress?.student_name || 'Student'
  const className = progress?.class_name || 'Class not assigned'

  const topWeak = weakAreas.slice(0, 2)
  const strongSubject = [...subjectProgress].sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2">
          <UserRound className="w-4 h-4 text-blue-700" />
          <span className="text-sm font-medium text-blue-900">Viewing for {studentName}</span>
        </div>
        <Link
          to="/test-scores"
          className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-primary-500 text-white font-semibold hover:shadow-lg transition-all"
        >
          View Progress
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-7">
        <h1 className="text-5xl max-sm:text-3xl font-extrabold tracking-tight text-gray-900">{studentName}&apos;s Progress</h1>
        <p className="text-gray-500 mt-2">{className}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-gray-500 text-sm">Overall Grade</p>
          <p className="text-5xl font-extrabold text-gray-900 mt-2">{toGrade(stats.accuracy || 0)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-gray-500 text-sm">Total XP Earned</p>
          <p className="text-5xl font-extrabold text-gray-900 mt-2">{xp.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-gray-500 text-sm">Subjects Mastered</p>
          <p className="text-5xl font-extrabold text-gray-900 mt-2">{mastered}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Subject Progress</h2>
            <div className="space-y-4">
              {subjectProgress.map((item) => {
                const pct = Math.max(0, Math.min(100, Math.round(item.accuracy || 0)))
                return (
                  <div key={item.subject_id}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-800">{item.subject_name}</span>
                      <span className="font-bold text-gray-700">{subjectGrade(pct)}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {subjectProgress.length === 0 && <p className="text-sm text-gray-500">No subject progress available yet.</p>}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${item.iconClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.subtitle}</p>
                    </div>
                  </div>
                )
              })}
              {recentActivity.length === 0 && <p className="text-sm text-gray-500">No recent activity found.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Deadlines</h2>
            <div className="space-y-3">
              {upcomingTests.slice(0, 2).map((test) => {
                const dt = new Date(test.test_datetime)
                return (
                  <div key={test.id} className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex flex-col items-center justify-center text-gray-700">
                      <span className="text-[10px] font-semibold">{dt.toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>
                      <span className="text-xl font-bold">{dt.getDate().toString().padStart(2, '0')}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{test.subject_name || test.name || 'Test'}</p>
                      <p className="text-sm text-gray-500">{className}</p>
                    </div>
                  </div>
                )
              })}
              {upcomingTests.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays className="w-4 h-4" />
                  No upcoming test deadlines.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Actionable Insights</h2>
            <div className="space-y-3">
              {strongSubject && (
                <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-sm text-green-800 flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                  <span>
                    <strong>Excelling in {strongSubject.subject_name}!</strong> Current accuracy is {Math.round(strongSubject.accuracy || 0)}%.
                  </span>
                </div>
              )}
              {topWeak.map((w) => (
                <div key={`${w.area_type}-${w.area_name}`} className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-800 flex gap-2">
                  <Lightbulb className="w-4 h-4 mt-0.5" />
                  <span><strong>Focus Area:</strong> {w.area_name}. {w.recommendation}</span>
                </div>
              ))}
              {generatedInsights.map((ins, idx) => (
                <div
                  key={`gen-${idx}`}
                  className={`rounded-xl p-3 text-sm flex gap-2 border ${
                    ins.type === 'positive'
                      ? 'bg-green-50 border-green-100 text-green-800'
                      : 'bg-amber-50 border-amber-100 text-amber-800'
                  }`}
                >
                  {ins.type === 'positive' ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <Lightbulb className="w-4 h-4 mt-0.5" />}
                  <span>{ins.text}</span>
                </div>
              ))}
              {!strongSubject && topWeak.length === 0 && generatedInsights.length === 0 && (
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm text-blue-800 flex gap-2">
                  <CircleAlert className="w-4 h-4 mt-0.5" />
                  <span>Not enough analytics data yet to generate insights.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParentDashboard
