import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, TrendingUp } from 'lucide-react'
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

const getBadge = (pct = 0) => {
  if (pct >= 85) return { text: 'Excellent', cls: 'bg-green-100 text-green-700' }
  if (pct >= 70) return { text: 'Good', cls: 'bg-blue-100 text-blue-700' }
  if (pct >= 45) return { text: 'Needs Improvement', cls: 'bg-amber-100 text-amber-700' }
  return { text: 'Weak', cls: 'bg-red-100 text-red-700' }
}

const ParentTestScores = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(null)
  const [tests, setTests] = useState([])
  const [trends, setTrends] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [progressRes, testsRes, trendsRes] = await Promise.all([
          parentService.getMyProgress(),
          parentService.getMyTests(),
          parentService.getAnswerTrends(180),
        ])
        setProgress(progressRes || null)
        setTests(Array.isArray(testsRes) ? testsRes : [])
        setTrends(trendsRes?.trends || [])
      } catch (err) {
        setError(err.message || 'Failed to load test scores')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const scoredTests = useMemo(() => {
    return tests
      .filter((t) => t?.user_progress?.percentage != null)
      .sort((a, b) => new Date(b.test_datetime) - new Date(a.test_datetime))
  }, [tests])

  const avgScore = useMemo(() => {
    if (!scoredTests.length) return 0
    const total = scoredTests.reduce((sum, t) => sum + Number(t.user_progress?.percentage || 0), 0)
    return Math.round(total / scoredTests.length)
  }, [scoredTests])

  const lastSixAvg = useMemo(() => {
    const recent = scoredTests.slice(0, 6)
    if (!recent.length) return null
    const total = recent.reduce((sum, t) => sum + Number(t.user_progress?.percentage || 0), 0)
    return Math.round(total / recent.length)
  }, [scoredTests])

  const scoreDelta = useMemo(() => {
    if (lastSixAvg == null) return 0
    return lastSixAvg - avgScore
  }, [lastSixAvg, avgScore])

  const chartPoints = useMemo(() => {
    const fromTests = [...scoredTests]
      .reverse()
      .slice(-8)
      .map((t) => ({
        label: new Date(t.test_datetime).toLocaleDateString('en-US', { month: 'short' }),
        score: Math.round(Number(t.user_progress?.percentage || 0)),
      }))

    if (fromTests.length >= 4) return fromTests

    return [...trends]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-8)
      .map((t) => ({
        label: new Date(t.date).toLocaleDateString('en-US', { month: 'short' }),
        score: Math.round(Number(t.accuracy || 0)),
      }))
  }, [scoredTests, trends])

  const trendData = useMemo(() => ({
    labels: chartPoints.map((p) => p.label),
    datasets: [
      {
        label: 'Score %',
        data: chartPoints.map((p) => p.score),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.14)',
        fill: true,
        tension: 0.38,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  }), [chartPoints])

  const subjectAverages = useMemo(() => {
    const map = new Map()

    scoredTests.forEach((t) => {
      const key = t.subject_name || 'Unknown'
      const current = map.get(key) || { sum: 0, count: 0 }
      current.sum += Number(t.user_progress?.percentage || 0)
      current.count += 1
      map.set(key, current)
    })

    return [...map.entries()]
      .map(([name, stats]) => ({
        name,
        avg: Math.round(stats.sum / stats.count),
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 6)
  }, [scoredTests])

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Loading test scores...</div>
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-5xl max-sm:text-3xl font-extrabold tracking-tight text-gray-900">Test Results Summary</h1>
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700">
          Showing results for: <span className="font-semibold text-gray-900">{progress?.student_name || 'Student'}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-3xl font-bold text-gray-900">Overall Performance Over Time</p>
          <div className="mt-2 flex items-end gap-3">
            <p className="text-6xl max-sm:text-5xl font-extrabold text-gray-900">{avgScore}%</p>
            <p className="text-sm text-gray-500 pb-2 inline-flex items-center gap-1">
              Last 6 tests
              <span className={`inline-flex items-center gap-1 font-semibold ${scoreDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4" />
                {scoreDelta >= 0 ? '+' : ''}{scoreDelta}%
              </span>
            </p>
          </div>

          <div className="mt-5 h-[220px]">
            {chartPoints.length >= 2 ? (
              <Line
                data={trendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } },
                  },
                }}
              />
            ) : (
              <div className="h-full rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-sm text-gray-500">
                Not enough timeline points for graph yet.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-3xl font-bold text-gray-900 mb-4">Average Score by Subject</p>
          <div className="space-y-4">
            {subjectAverages.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-semibold text-gray-800">{item.name}</span>
                  <span className="font-bold text-gray-900">{item.avg}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${item.avg}%` }} />
                </div>
              </div>
            ))}
            {subjectAverages.length === 0 && <p className="text-sm text-gray-500">No subject-level scores yet.</p>}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-4xl max-sm:text-2xl font-extrabold text-gray-900 mb-4">Recent Test Results</h2>
        <div className="space-y-3">
          {scoredTests.map((test) => {
            const pct = Math.round(Number(test.user_progress?.percentage || 0))
            const badge = getBadge(pct)
            const moduleCount = Array.isArray(test.module_chapters) ? test.module_chapters.length : 0
            const chapterCount = (Array.isArray(test.module_chapters) ? test.module_chapters : []).reduce(
              (sum, mod) => sum + (Array.isArray(mod.chapters) ? mod.chapters.length : 0),
              0,
            )
            const questionCount = Number(test.user_progress?.total_questions || test.question_count || 0)
            const xp = Number(test.user_progress?.exp_earned || 0)

            return (
              <button
                key={test.id}
                onClick={() => navigate(`/test-scores/${test.id}`)}
                className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm hover:border-gray-300 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-2xl max-sm:text-lg font-bold text-gray-900 truncate">{test.name || test.subject_name || 'Test'}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {test.test_datetime ? new Date(test.test_datetime).toLocaleDateString() : 'No date'}
                      {' • '}
                      {test.class_group_name || 'Class not set'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {moduleCount} chapters • {chapterCount} topics • {questionCount} questions • {xp} XP
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-4xl max-sm:text-2xl font-extrabold text-gray-900">{pct}/100</p>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}>{badge.text}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </button>
            )
          })}

          {scoredTests.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
              No completed tests yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ParentTestScores
