import { useEffect, useMemo, useState } from 'react'
import reportsService from '../services/reportsService'

const EMPTY_DATA = {
  summary: {
    totalStudents: 0,
    completionRate: 0,
    averageScore: 0,
    weakTopicCount: 0,
  },
  filterOptions: {
    classes: [],
    subjects: [],
    chapters: [],
  },
  sectionWisePerformance: [],
}

const renderTopicTags = (topics, colorClass) => {
  if (!Array.isArray(topics) || topics.length === 0) {
    return <span className="text-sm text-gray-400">-</span>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {topics.map((topic, index) => (
        <span key={`${topic}-${index}`} className={`px-2 py-0.5 text-xs rounded border ${colorClass}`}>
          {topic}
        </span>
      ))}
    </div>
  )
}

const Reports = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(EMPTY_DATA)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')

  const fetchReportsData = async (filters = {}) => {
    setLoading(true)
    setError('')
    try {
      const response = await reportsService.getReportsAnalytics({
        period: '30',
        class: filters.class ?? selectedClass,
        subject: filters.subject ?? selectedSubject,
        chapter: filters.topic ?? selectedTopic,
      })

      setData({
        summary: response.summary || EMPTY_DATA.summary,
        filterOptions: {
          classes: response.filterOptions?.classes || [],
          subjects: response.filterOptions?.subjects || [],
          chapters: response.filterOptions?.chapters || [],
        },
        sectionWisePerformance: response.sectionWisePerformance || [],
      })
    } catch (err) {
      setError(err.message || 'Failed to load reports')
      setData(EMPTY_DATA)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportsData()
  }, [])

  const handleClassChange = (value) => {
    setSelectedClass(value)
    fetchReportsData({ class: value })
  }

  const handleSubjectChange = (value) => {
    setSelectedSubject(value)
    setSelectedTopic('')
    fetchReportsData({ subject: value, topic: '' })
  }

  const handleTopicChange = (value) => {
    setSelectedTopic(value)
    fetchReportsData({ topic: value })
  }

  const sectionRows = useMemo(() => {
    if (!Array.isArray(data.sectionWisePerformance)) return []
    return data.sectionWisePerformance
  }, [data.sectionWisePerformance])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold">Error Loading Reports</h2>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={() => fetchReportsData()}
          className="mt-4 px-4 py-2 text-white rounded hover:bg-primary-600 transition-colors"
          style={{ backgroundColor: '#00167a' }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
        <p className="text-gray-600 mt-1">Live section-wise performance with class, subject, and topic filters.</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">All Classes</option>
              {data.filterOptions.classes.map((className) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">All Subjects</option>
              {data.filterOptions.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => handleTopicChange(e.target.value)}
              disabled={!selectedSubject}
              className={`px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${!selectedSubject ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}`}
            >
              <option value="">All Topics</option>
              {data.filterOptions.chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Students</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#00167a' }}>{data.summary.totalStudents}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Average Score</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#1fb7eb' }}>{data.summary.averageScore}%</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attempt Rate</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{data.summary.completionRate}%</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Weak Topics</p>
          <p className="text-3xl font-bold mt-2 text-red-600">{data.summary.weakTopicCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Section-wise Performance</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Difference table from live data: topics students are good at vs topics they are struggling in.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Section</th>
                <th className="px-6 py-3">Students</th>
                <th className="px-6 py-3">Proficiency</th>
                <th className="px-6 py-3">Attempt Rate</th>
                <th className="px-6 py-3">Difficulty</th>
                <th className="px-6 py-3">Good Topics</th>
                <th className="px-6 py-3">Struggling Topics</th>
              </tr>
            </thead>
            <tbody>
              {sectionRows.length > 0 ? (
                sectionRows.map((row, index) => (
                  <tr key={`${row.className}-${index}`} className="border-t border-gray-200">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{row.className || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.students ?? 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${row.averageScore || 0}%`, backgroundColor: '#1fb7eb' }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{row.averageScore || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{row.attemptRate || row.completionRate || 0}%</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.difficulty || '-'}</td>
                    <td className="px-6 py-4">{renderTopicTags(row.goodTopics, 'bg-green-50 text-green-700 border-green-200')}</td>
                    <td className="px-6 py-4">{renderTopicTags(row.strugglingTopics, 'bg-red-50 text-red-700 border-red-200')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No section-wise data available for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
