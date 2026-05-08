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
    modules: [],
    chapters: [],
  },
  sectionWisePerformance: [],
  moduleProficiencyData: [],
  reportsData: {
    chapterProficiency: [],
  },
}

const EXCLUDED_TOPIC_LABELS = new Set([
  'previous knowledge testing',
  'competency based questions',
  'competancy based questions',
  'competency-based questions',
  'summary',
])

const normalizeTopicLabel = (topic) => String(topic || '').trim().replace(/\s+/g, ' ')
const isDisplayableTopicLabel = (topic) => {
  const normalized = normalizeTopicLabel(topic)
  return Boolean(normalized) && !EXCLUDED_TOPIC_LABELS.has(normalized.toLowerCase())
}

const renderTopicTags = (topics, colorClass) => {
  const filteredTopics = Array.isArray(topics)
    ? topics.map(normalizeTopicLabel).filter(isDisplayableTopicLabel)
    : []

  if (filteredTopics.length === 0) {
    return <span className="text-sm text-gray-400">-</span>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {filteredTopics.map((topic, index) => (
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

  const fetchReportsData = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await reportsService.getReportsAnalytics({
        period: '30',
        class: selectedClass,
        subject: selectedSubject,
        chapter: selectedTopic,
      })

      setData({
        summary: response.summary || EMPTY_DATA.summary,
        filterOptions: {
          classes: response.filterOptions?.classes || [],
          subjects: response.filterOptions?.subjects || [],
          modules: response.filterOptions?.modules || [],
          chapters: response.filterOptions?.chapters || [],
        },
        sectionWisePerformance: response.sectionWisePerformance || [],
        moduleProficiencyData: response.moduleProficiencyData || [],
        reportsData: {
          chapterProficiency: response.reportsData?.chapterProficiency || [],
        },
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
  }, [selectedClass, selectedSubject, selectedTopic])

  const handleClassChange = (value) => {
    setSelectedClass(value)
    setSelectedSubject('')
    setSelectedTopic('')
  }

  const handleSubjectChange = (value) => {
    setSelectedSubject(value)
    setSelectedTopic('')
  }

  const handleTopicChange = (value) => {
    setSelectedTopic(value)
  }

  const sectionRows = useMemo(() => {
    if (!Array.isArray(data.sectionWisePerformance)) return []
    return data.sectionWisePerformance
  }, [data.sectionWisePerformance])

  const sectionSummary = useMemo(() => {
    if (!sectionRows.length) {
      return {
        totalStudents: data.summary.totalStudents || 0,
        averageScore: data.summary.averageScore || 0,
        attemptRate: 0,
      }
    }

    const totalStudents = sectionRows.reduce((sum, row) => sum + (row.students || 0), 0)

    if (!totalStudents) {
      return {
        totalStudents: 0,
        averageScore: 0,
        attemptRate: 0,
      }
    }

    const averageScore = Math.round(
      sectionRows.reduce((sum, row) => sum + ((row.averageScore || 0) * (row.students || 0)), 0) / totalStudents
    )

    const attemptRate = Math.round(
      sectionRows.reduce((sum, row) => sum + ((row.attemptRate || row.completionRate || 0) * (row.students || 0)), 0) / totalStudents
    )

    return {
      totalStudents,
      averageScore,
      attemptRate,
    }
  }, [sectionRows, data.summary.totalStudents, data.summary.averageScore])

  const isSelectedChapterUnattempted = useMemo(() => {
    if (!selectedTopic || sectionRows.length === 0) return false
    return sectionRows.every((row) => Number(row.attemptRate ?? row.completionRate ?? 0) === 0)
  }, [sectionRows, selectedTopic])

  const renderSectionWeakTopics = (row) => {
    if (isSelectedChapterUnattempted && Number(row.attemptRate ?? row.completionRate ?? 0) === 0) {
      return <span className="text-sm text-amber-700">Unattempted</span>
    }

    return renderTopicTags(row.strugglingTopics, 'bg-white text-red-700 border-red-200')
  }

  const topicDifferenceSummary = useMemo(() => {
    if (isSelectedChapterUnattempted) {
      return {
        goodTopics: [],
        weakTopics: [],
      }
    }

    const moduleRows = Array.isArray(data.moduleProficiencyData) ? data.moduleProficiencyData : []
    const goodSet = new Set()
    const weakSet = new Set()

    moduleRows.forEach((moduleRow) => {
      const backendWeakTopics = Array.isArray(moduleRow.weakSubtopics) ? moduleRow.weakSubtopics : []

      backendWeakTopics.forEach((topicName) => {
        const normalized = normalizeTopicLabel(topicName)
        if (isDisplayableTopicLabel(normalized)) weakSet.add(normalized)
      })

      ;(moduleRow.chapters || []).forEach((chapter) => {
        const topicName = normalizeTopicLabel(chapter.name || chapter.chapterName)
        const proficiency = Number(chapter.proficiency ?? chapter.proficient ?? 0)
        if (!isDisplayableTopicLabel(topicName)) return

        if (proficiency > 50) {
          goodSet.add(topicName)
        }
      })
    })

    return {
      goodTopics: [...goodSet],
      weakTopics: [...weakSet],
    }
  }, [data.moduleProficiencyData, isSelectedChapterUnattempted])

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
        <p className="text-gray-600 mt-1">Live section-wise performance with class, subject, and chapter filters.</p>
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
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Chapter</label>
            <select
              value={selectedTopic}
              onChange={(e) => handleTopicChange(e.target.value)}
              disabled={!selectedSubject}
              className={`px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${!selectedSubject ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}`}
            >
              <option value="">All Chapters</option>
              {data.filterOptions.chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Students</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#00167a' }}>{sectionSummary.totalStudents}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Average Score</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#1fb7eb' }}>{sectionSummary.averageScore}%</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attempt Rate</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{sectionSummary.attemptRate}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Section-wise Performance</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Section</th>
                <th className="px-6 py-3">Teacher</th>
                <th className="px-6 py-3">Students</th>
                <th className="px-6 py-3">Proficiency</th>
                <th className="px-6 py-3">Attempt Rate</th>
                <th className="px-6 py-3">Difficulty</th>
                <th className="px-6 py-3">Weak Topics</th>
              </tr>
            </thead>
            <tbody>
              {sectionRows.length > 0 ? (
                sectionRows.map((row, index) => (
                  <tr key={`${row.className}-${index}`} className="border-t border-gray-200">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{row.className || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.teacherName || '-'}</td>
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
                    <td className="px-6 py-4">{renderSectionWeakTopics(row)}</td>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Topic Analyzer</h2>
          <p className="mt-1 text-sm text-gray-500">This section uses the same class, subject, and chapter filters selected above.</p>
        </div>

        <div className="p-6">
          {isSelectedChapterUnattempted ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This chapter is currently unattempted for the selected class and subject, so there are no good or weak topics to show yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <h3 className="text-sm font-semibold text-green-800 mb-3">Good Topics</h3>
                {renderTopicTags(topicDifferenceSummary.goodTopics, 'bg-white text-green-700 border-green-200')}
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h3 className="text-sm font-semibold text-red-800 mb-3">Weak Topics</h3>
                {renderTopicTags(topicDifferenceSummary.weakTopics, 'bg-white text-red-700 border-red-200')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
