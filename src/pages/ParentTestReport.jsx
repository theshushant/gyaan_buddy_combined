import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import parentService from '../services/parentService'

const statusPill = {
  Strong: 'bg-green-100 text-green-700',
  Good: 'bg-blue-100 text-blue-700',
  Struggled: 'bg-amber-100 text-amber-700',
  Weak: 'bg-red-100 text-red-700',
  'Not Attempted': 'bg-gray-100 text-gray-700',
}

const ParentTestReport = () => {
  const { testId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [report, setReport] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await parentService.getMyTestReport(testId)
        setReport(data)
      } catch (err) {
        setError(err.message || 'Failed to load test report')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [testId])

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Loading test report...</div>
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
  if (!report) return null

  return (
    <div className="space-y-5">
      <Link to="/test-scores" className="inline-flex items-center text-primary-600 hover:text-primary-700">← Back to Test Results</Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h1 className="text-4xl font-bold text-gray-900">Individual Test Report</h1>
        <p className="text-gray-500 mt-2">{report.subject_name} • {report.class_name || 'Class'}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{report.test_name || report.subject_name}</h2>
            <p className="text-gray-500 mt-1">
              {report.test_datetime ? new Date(report.test_datetime).toLocaleDateString() : 'Date unavailable'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-amber-500">{report.score_percent}</p>
            <p className="text-2xl font-semibold text-gray-500">/100</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Student Score</p>
            <p className="text-4xl font-bold text-gray-900">{report.score_percent}%</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Class Average</p>
            <p className="text-4xl font-bold text-gray-900">{report.class_average_percent}%</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Performance</p>
            <span className={`inline-flex mt-2 text-sm font-medium px-3 py-1 rounded-full ${statusPill[report.performance_label] || 'bg-blue-100 text-blue-700'}`}>
              {report.performance_label}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Topic Performance</h3>
          <div className="space-y-2">
            {(report.topic_performance || []).map((item, idx) => (
              <div key={`${item.topic}-${idx}`} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                <p className="font-medium text-gray-800">{item.topic}</p>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusPill[item.status] || 'bg-gray-100 text-gray-700'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParentTestReport
