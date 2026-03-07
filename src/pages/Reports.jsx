// ============================================================
// DEMO UI — hardcoded data, no API calls
// ============================================================

import React, { useState } from 'react'

// ── DEMO DATA ────────────────────────────────────────────────────────────────

const CLASSES  = ['6', '7', '8', '9', '10', '11', '12']
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science']
const SECTIONS = ['A', 'B', 'C', 'D']

const CLASS_META = {
  '6':  { totalStudents: 120 },
  '7':  { totalStudents: 115 },
  '8':  { totalStudents: 118 },
  '9':  { totalStudents: 110 },
  '10': { totalStudents: 105 },
  '11': { totalStudents: 90  },
  '12': { totalStudents: 85  },
}

// Students per section (same across classes for demo)
const SECTION_STUDENTS = { A: 30, B: 28, C: 31, D: 26 }

// How much each section deviates from the class average (A = best, D = weakest)
const SECTION_PERF_OFFSET = { A: +5, B: +1, C: -3, D: -8 }

// Attempt rate per section (% of students who attempted the assessment)
const SECTION_ATTEMPT_RATE = { A: 92, B: 85, C: 78, D: 68 }

// Attempt rate per subject
const SUBJ_ATTEMPT_RATE = {
  'Mathematics':      72,
  'Science':          78,
  'English':          88,
  'Hindi':            83,
  'Social Studies':   76,
  'Computer Science': 70,
}

// Teacher assigned per subject × section
const SECTION_TEACHERS = {
  'Mathematics':      { A: 'Mrs. Sharma', B: 'Mrs. Sharma', C: 'Mr. Patel',   D: 'Mr. Patel'   },
  'Science':          { A: 'Mr. Singh',   B: 'Mr. Singh',   C: 'Mrs. Gupta',  D: 'Mrs. Gupta'  },
  'English':          { A: 'Mrs. Verma',  B: 'Mrs. Verma',  C: 'Mr. Kumar',   D: 'Mr. Kumar'   },
  'Hindi':            { A: 'Mrs. Gupta',  B: 'Mr. Patel',   C: 'Mrs. Sharma', D: 'Mrs. Sharma' },
  'Social Studies':   { A: 'Mr. Kumar',   B: 'Mr. Kumar',   C: 'Mr. Singh',   D: 'Mr. Singh'   },
  'Computer Science': { A: 'Mr. Patel',   B: 'Mrs. Verma',  C: 'Mrs. Verma',  D: 'Mr. Kumar'   },
}

const TEACHERS = ['Mrs. Sharma', 'Mr. Patel', 'Mrs. Gupta', 'Mr. Singh', 'Mrs. Verma', 'Mr. Kumar']

const BASE_SCORES = {
  '6':  { avg: 72, pass: 85 },
  '7':  { avg: 70, pass: 83 },
  '8':  { avg: 75, pass: 87 },
  '9':  { avg: 66, pass: 79 },
  '10': { avg: 64, pass: 76 },
  '11': { avg: 61, pass: 73 },
  '12': { avg: 63, pass: 75 },
}

const SUBJ_OFFSET = {
  'Mathematics':        -4,
  'Science':            -1,
  'English':            +2,
  'Hindi':              +4,
  'Social Studies':     -2,
  'Computer Science':   +6,
}

// Build class × subject performance lookup
const PERF = {}
CLASSES.forEach(cls => {
  PERF[cls] = {}
  SUBJECTS.forEach(subj => {
    const b = BASE_SCORES[cls]
    const o = SUBJ_OFFSET[subj]
    PERF[cls][subj] = {
      avg:  Math.min(95, Math.max(45, b.avg  + o)),
      pass: Math.min(98, Math.max(55, b.pass + o)),
    }
  })
})

// Weak topics per subject — used in the expanded section rows
const SUBJECT_WEAK_TOPICS = {
  'Mathematics': [
    { topic: 'Quadratic Equations',   chapter: 'Algebra',      pct: 42, difficulty: [4, 5]    },
    { topic: 'Linear Inequalities',   chapter: 'Algebra',      pct: 30, difficulty: [2, 3]    },
    { topic: 'Integration by Parts',  chapter: 'Calculus',     pct: 38, difficulty: [3, 4, 5] },
    { topic: 'Differentiation',       chapter: 'Calculus',     pct: 25, difficulty: [3, 4]    },
    { topic: 'Inverse Trigonometry',  chapter: 'Trigonometry', pct: 28, difficulty: [3, 4, 5] },
    { topic: 'Circle Theorems',       chapter: 'Geometry',     pct: 31, difficulty: [3, 4]    },
    { topic: 'Standard Deviation',    chapter: 'Statistics',   pct: 22, difficulty: [2, 3]    },
  ],
  'Science': [
    { topic: 'Cell Cycle and Cell Division',     chapter: 'Biology',     pct: 45, difficulty: [4, 5]    },
    { topic: 'Genetics',                         chapter: 'Biology',     pct: 33, difficulty: [3, 4]    },
    { topic: "Laws of Motion",                   chapter: 'Mechanics',   pct: 39, difficulty: [3, 4, 5] },
    { topic: 'Work & Energy',                    chapter: 'Mechanics',   pct: 24, difficulty: [2, 3]    },
    { topic: 'Chemical Reactions and Equations', chapter: 'Chemistry',   pct: 36, difficulty: [3, 4]    },
    { topic: 'Ray Optics',                       chapter: 'Optics',      pct: 30, difficulty: [2, 3, 4] },
    { topic: "Daily Electronics",                chapter: 'Electricity', pct: 25, difficulty: [1, 2]    },
  ],
  'English': [
    { topic: 'Essay Structure',      chapter: 'Writing Skills',        pct: 44, difficulty: [4, 5]    },
    { topic: 'Report Writing',       chapter: 'Writing Skills',        pct: 28, difficulty: [2, 3]    },
    { topic: 'Meter & Rhyme Scheme', chapter: 'Poetry',                pct: 32, difficulty: [3, 4, 5] },
    { topic: 'Figurative Language',  chapter: 'Literature',            pct: 35, difficulty: [3, 4]    },
    { topic: 'Inference Questions',  chapter: 'Reading Comprehension', pct: 27, difficulty: [2, 3]    },
    { topic: 'Subjunctive Mood',     chapter: 'Grammar',               pct: 21, difficulty: [1, 2]    },
  ],
  'Hindi': [
    { topic: 'Essay Composition',       chapter: 'Lekhan Kaushal', pct: 41, difficulty: [4, 5]    },
    { topic: 'Letter Writing',          chapter: 'Lekhan Kaushal', pct: 26, difficulty: [2, 3]    },
    { topic: 'Poetry Analysis',         chapter: 'Kavita',         pct: 37, difficulty: [3, 4, 5] },
    { topic: 'Karak (Case)',            chapter: 'Vyakaran',       pct: 29, difficulty: [3, 4]    },
    { topic: 'Sandhi',                  chapter: 'Vyakaran',       pct: 20, difficulty: [2, 3]    },
    { topic: 'Tatsam / Tadbhav Words',  chapter: 'Shabda Gyan',    pct: 23, difficulty: [2, 3]    },
    { topic: 'Comprehension Speed',     chapter: 'Gadya',          pct: 18, difficulty: [1, 2]    },
  ],
  'Social Studies': [
    { topic: 'Supply & Demand',           chapter: 'Economics',         pct: 45, difficulty: [4, 5]    },
    { topic: 'Budget & Taxation',         chapter: 'Economics',         pct: 31, difficulty: [3, 4]    },
    { topic: 'Map Reading',               chapter: 'Geography',         pct: 33, difficulty: [3, 4, 5] },
    { topic: 'Climate Zones',             chapter: 'Geography',         pct: 21, difficulty: [2, 3]    },
    { topic: 'Medieval Period',           chapter: 'History',           pct: 28, difficulty: [3, 4]    },
    { topic: 'International Events',      chapter: 'Political Science', pct: 24, difficulty: [2, 3]    },
    { topic: 'Constitutional Amendments', chapter: 'Civics',            pct: 19, difficulty: [1, 2]    },
  ],
  'Computer Science': [
    { topic: 'Graph Algorithms',    chapter: 'Data Structures & Algorithms', pct: 48, difficulty: [4, 5]    },
    { topic: 'Dynamic Programming', chapter: 'Data Structures & Algorithms', pct: 35, difficulty: [3, 4]    },
    { topic: 'TCP/IP Protocols',    chapter: 'Networking',                   pct: 35, difficulty: [3, 4, 5] },
    { topic: 'Normalization',       chapter: 'Database Management',          pct: 29, difficulty: [3, 4]    },
    { topic: 'SQL Queries',         chapter: 'Database Management',          pct: 20, difficulty: [2, 3]    },
    { topic: 'Recursion',           chapter: 'Programming Concepts',         pct: 26, difficulty: [2, 3]    },
    { topic: 'Memory Management',   chapter: 'Computer Organization',        pct: 22, difficulty: [1, 2]    },
  ],
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

const subjectAvg = (cls, subj) => {
  if (subj === 'all')
    return Math.round(SUBJECTS.reduce((s, sub) => s + PERF[cls][sub].avg, 0) / SUBJECTS.length)
  return PERF[cls][subj].avg
}

const subjectPass = (cls, subj) => {
  if (subj === 'all')
    return Math.round(SUBJECTS.reduce((s, sub) => s + PERF[cls][sub].pass, 0) / SUBJECTS.length)
  return PERF[cls][subj].pass
}


const passColor = (p) =>
  p >= 85 ? 'bg-green-100 text-green-700' : p >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'

// difficulty is an array of numbers 1–5; badge colour based on max value
const difficultyBadge = (d) => {
  const max = Math.max(...d)
  return max >= 4 ? 'bg-red-100 text-red-700' : max >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
}

// Groups topics by chapter, chapters sorted by their hardest topic (descending)
const groupByChapter = (topics) => {
  const map = new Map()
  topics.forEach(wt => {
    if (!map.has(wt.chapter)) map.set(wt.chapter, [])
    map.get(wt.chapter).push(wt)
  })
  return [...map.entries()].sort((a, b) => {
    const maxA = Math.max(...a[1].map(t => Math.max(...t.difficulty)))
    const maxB = Math.max(...b[1].map(t => Math.max(...t.difficulty)))
    return maxB - maxA
  })
}

// Returns all topics adjusted for a section's performance offset, sorted hardest first (highest max difficulty)
const getSectionWeakTopics = (subj, secOffset) =>
  SUBJECT_WEAK_TOPICS[subj]
    .map(wt => ({
      ...wt,
      pct: Math.min(70, Math.max(5, Math.round(wt.pct - secOffset * 0.6))),
    }))
    .sort((a, b) => Math.max(...b.difficulty) - Math.max(...a.difficulty))

// ── COMPONENT ────────────────────────────────────────────────────────────────

const Reports = () => {
  const [selectedClass,    setSelectedClass]    = useState('all')
  const [selectedSubject,  setSelectedSubject]  = useState('all')
  const [selectedTeacher,  setSelectedTeacher]  = useState('all')
  const [expandedSections, setExpandedSections] = useState(new Set())
  const [expandedSubjects, setExpandedSubjects] = useState(new Set())

  const activeCls   = selectedClass === 'all' ? CLASSES : [selectedClass]
  // Show section-wise table only when both class AND subject are selected
  const sectionView = selectedClass !== 'all' && selectedSubject !== 'all'

  const toggleSection = (key) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const toggleSubject = (subj) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev)
      next.has(subj) ? next.delete(subj) : next.add(subj)
      return next
    })
  }

  // ── Summary cards ────────────────────────────────────────────────────────
  const totalStudents = sectionView
    ? SECTIONS.reduce((s, sec) => s + SECTION_STUDENTS[sec], 0)
    : activeCls.reduce((s, c) => s + CLASS_META[c].totalStudents, 0)

  const avgScore = sectionView
    ? Math.round(SECTIONS.reduce((s, sec) => {
        const base = PERF[selectedClass][selectedSubject].avg
        return s + Math.min(98, Math.max(35, base + SECTION_PERF_OFFSET[sec]))
      }, 0) / SECTIONS.length)
    : Math.round(activeCls.reduce((s, c) => s + subjectAvg(c, selectedSubject), 0) / activeCls.length)

  const avgPass = sectionView
    ? Math.round(SECTIONS.reduce((s, sec) => {
        const base = PERF[selectedClass][selectedSubject].pass
        return s + Math.min(98, Math.max(40, base + SECTION_PERF_OFFSET[sec]))
      }, 0) / SECTIONS.length)
    : Math.round(activeCls.reduce((s, c) => s + subjectPass(c, selectedSubject), 0) / activeCls.length)

  const topClass = CLASSES.reduce((best, c) =>
    subjectAvg(c, selectedSubject) > subjectAvg(best, selectedSubject) ? c : best, CLASSES[0])

  // ── Section rows (used when sectionView is active) ────────────────────────
  const sectionRows = sectionView
    ? SECTIONS
        .map(sec => {
          const base     = PERF[selectedClass][selectedSubject].avg
          const basePass = PERF[selectedClass][selectedSubject].pass
          const avg      = Math.min(98, Math.max(35, base     + SECTION_PERF_OFFSET[sec]))
          const pass     = Math.min(98, Math.max(40, basePass + SECTION_PERF_OFFSET[sec]))
          const weakTopics = getSectionWeakTopics(selectedSubject, SECTION_PERF_OFFSET[sec])
          const teacher  = SECTION_TEACHERS[selectedSubject][sec]
          return {
            key:         `${selectedClass}${sec}`,
            label:       `Class ${selectedClass}${sec}`,
            students:    SECTION_STUDENTS[sec],
            avg,
            pass,
            attemptRate: SECTION_ATTEMPT_RATE[sec],
            teacher,
            weakTopics,
            topWeak:     weakTopics[0] ?? null,
          }
        })
        .filter(row => selectedTeacher === 'all' || row.teacher === selectedTeacher)
    : []

  // ── Subject-wise display (fallback view) ──────────────────────────────────
  const displaySubjects = (selectedSubject === 'all' ? SUBJECTS : [selectedSubject])
    .filter(subj => selectedTeacher === 'all' || Object.values(SECTION_TEACHERS[subj]).includes(selectedTeacher))

  const subjectBars = SUBJECTS.map(subj => ({
    subject: subj,
    avg: Math.round(activeCls.reduce((s, c) => s + PERF[c][subj].avg, 0) / activeCls.length),
  }))

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
        <p className="text-gray-600 mt-1">School-wide academic performance overview</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setExpandedSections(new Set()) }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">All Classes</option>
              {CLASSES.map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setExpandedSections(new Set()) }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">All Subjects</option>
              {SUBJECTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => { setSelectedTeacher(e.target.value); setExpandedSections(new Set()) }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">All Teachers</option>
              {TEACHERS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => sectionView
                ? setExpandedSections(new Set(SECTIONS.map(s => `${selectedClass}${s}`)))
                : setExpandedSubjects(new Set(displaySubjects))
              }
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Expand All
            </button>
            <span className="text-gray-300 select-none">|</span>
            <button
              onClick={() => sectionView
                ? setExpandedSections(new Set())
                : setExpandedSubjects(new Set())
              }
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Collapse All
            </button>
            <span className="text-xs text-gray-400 italic ml-2"></span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Students</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#00167a' }}>{totalStudents.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            {sectionView
              ? `Class ${selectedClass} · All sections`
              : selectedClass === 'all' ? 'Across all classes' : `Class ${selectedClass}`}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Proficiency</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#1fb7eb' }}>{avgScore}%</p>
          <p className="text-xs text-gray-400 mt-1">
            {selectedSubject === 'all' ? 'All subjects' : selectedSubject}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attempt Rate</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{avgPass}%</p>
          <p className="text-xs text-gray-400 mt-1">{selectedSubject === 'all' ? 'All subjects' : selectedSubject}</p>
        </div>

         </div>

      {sectionView ? (
        /* ── SECTION-WISE TABLE (class + subject both selected) ── */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Section-wise Performance — Class {selectedClass} · {selectedSubject}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Click a section row to expand all weak topics
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
                  <th className="px-6 py-3">Teacher</th>
                  <th className="px-6 py-3">Weak Topic</th>
                  <th className="px-6 py-3">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {sectionRows.map(row => {
                  const isExpanded = expandedSections.has(row.key)
                  return (
                    <React.Fragment key={row.key}>
                      {/* Section header row */}
                      <tr
                        onClick={() => toggleSection(row.key)}
                        className="cursor-pointer border-t border-gray-200 hover:bg-blue-50 transition-colors"
                        style={{ backgroundColor: isExpanded ? '#eff6ff' : '#f9fafb' }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-[10px] w-4 text-center select-none">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                            <span className="font-bold text-gray-900">{row.label}</span>
                            <span className="text-xs text-gray-400 font-normal">(Chapter List)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{row.students}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="h-2 rounded-full" style={{ width: `${row.avg}%`, backgroundColor: '#1fb7eb' }} />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{row.avg}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">{row.attemptRate}%</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{row.teacher}</td>
                        <td className="px-6 py-4">
                          {row.topWeak ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm text-gray-700">{row.topWeak.topic}</span>
                              <span className="text-xs text-gray-400">{row.topWeak.chapter}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {row.topWeak ? (
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${difficultyBadge(row.topWeak.difficulty)}`}>
                              {row.topWeak.difficulty.join(',')}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Chapter rows (expanded, 1 row per chapter) */}
                      {isExpanded && groupByChapter(row.weakTopics).map(([chapter, topics]) => {
                        const chapterProf = Math.round(topics.reduce((s, t) => s + (100 - t.pct), 0) / topics.length)
                        return (
                          <tr key={`${row.key}-ch-${chapter}`} className="border-t border-gray-200 bg-gray-50 hover:bg-blue-50 transition-colors">
                            <td className="py-3 pl-12 pr-4" colSpan={2}>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-300 select-none">↳</span>
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{chapter}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full" style={{ width: `${chapterProf}%`, backgroundColor: chapterProf >= 70 ? '#22c55e' : chapterProf >= 50 ? '#f59e0b' : '#ef4444' }} />
                                </div>
                                <span className={`text-xs font-semibold ${chapterProf >= 70 ? 'text-green-600' : chapterProf >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{chapterProf}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-gray-300 text-xs">—</td>
                            <td className="px-6 py-3 text-gray-300 text-xs">—</td>
                            <td className="px-6 py-3">
                              <div className="flex flex-wrap gap-1">
                                {topics.map((wt, idx) => (
                                  <span key={idx} className="inline-flex px-2 py-0.5 rounded bg-white border border-gray-200 text-xs text-gray-700">{wt.topic}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex flex-wrap gap-1">
                                {topics.map((wt, idx) => (
                                  <span key={idx} className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${difficultyBadge(wt.difficulty)}`}>
                                    {wt.difficulty.join(',')}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── SUBJECT-WISE TABLE (fallback — select class + subject to drill into sections) ── */
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Section-wise Performance</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedClass === 'all' ? 'School-wide average' : `Class ${selectedClass}`} · Select both a class and subject to view per-section breakdown
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Proficiency</th>
                    <th className="px-6 py-3">Attempt Rate</th>
                    <th className="px-6 py-3">Weak Topic</th>
                    <th className="px-6 py-3">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {displaySubjects.map(subj => {
                    const subjAvg  = Math.round(activeCls.reduce((s, c) => s + PERF[c][subj].avg,  0) / activeCls.length)
                    const subjPass = Math.round(activeCls.reduce((s, c) => s + PERF[c][subj].pass, 0) / activeCls.length)
                    const isExpanded = expandedSubjects.has(subj)
                    const weakTopics = [...SUBJECT_WEAK_TOPICS[subj]].sort(
                      (a, b) => Math.max(...b.difficulty) - Math.max(...a.difficulty)
                    )

                    return (
                      <React.Fragment key={subj}>
                        {/* Subject section header */}
                        <tr
                          onClick={() => toggleSubject(subj)}
                          className="cursor-pointer border-t border-gray-200 hover:bg-blue-50 transition-colors"
                          style={{ backgroundColor: isExpanded ? '#eff6ff' : '#f9fafb' }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-[10px] w-4 text-center select-none">
                                {isExpanded ? '▼' : '▶'}
                              </span>
                              <span className="font-bold text-gray-900">{subj}</span>
                              <span className="text-xs text-gray-400 font-normal">({weakTopics.length} topics)</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${subjAvg}%`, backgroundColor: '#1fb7eb' }} />
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{subjAvg}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">{SUBJ_ATTEMPT_RATE[subj]}%</span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">—</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">—</td>
                        </tr>

                        {/* Chapter rows (expanded, 1 row per chapter) */}
                        {isExpanded && groupByChapter(weakTopics).map(([chapter, topics]) => {
                          const chapterProf = Math.round(topics.reduce((s, t) => s + (100 - t.pct), 0) / topics.length)
                          return (
                            <tr key={`${subj}-ch-${chapter}`} className="border-t border-gray-200 bg-gray-50 hover:bg-blue-50 transition-colors">
                              <td className="py-3 pl-12 pr-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-300 select-none">↳</span>
                                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{chapter}</span>
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full" style={{ width: `${chapterProf}%`, backgroundColor: chapterProf >= 70 ? '#22c55e' : chapterProf >= 50 ? '#f59e0b' : '#ef4444' }} />
                                  </div>
                                  <span className={`text-xs font-semibold ${chapterProf >= 70 ? 'text-green-600' : chapterProf >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{chapterProf}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-3 text-gray-300 text-xs">—</td>
                              <td className="px-6 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {topics.map((wt, idx) => (
                                    <span key={idx} className="inline-flex px-2 py-0.5 rounded bg-white border border-gray-200 text-xs text-gray-700">{wt.topic}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {topics.map((wt, idx) => (
                                    <span key={idx} className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${difficultyBadge(wt.difficulty)}`}>
                                      {wt.difficulty.join(',')}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subject-wise Bars */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Subject-wise Average</h2>
            <p className="text-sm text-gray-500 mt-0.5 mb-5">
              {selectedClass === 'all' ? 'School-wide average per subject' : `Class ${selectedClass} average per subject`}
            </p>
            <div className="space-y-4">
              {subjectBars.sort((a, b) => b.avg - a.avg).map(({ subject, avg }) => (
                <div key={subject}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{subject}</span>
                    <span className="text-sm font-semibold text-gray-900">{avg}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${avg}%`, backgroundColor: '#00167a' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  )
}

export default Reports

// ============================================================
// OLD CODE — preserved below, do not delete
// ============================================================

/*
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
    const hasError = Object.values(error).some(err => err !== null)
    if (hasError) {
      return
    }

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

  // ... rest of old component
}

export default Reports
*/



/*import { useState, useEffect } from 'react'
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
    const hasError = Object.values(error).some(err => err !== null)
    if (hasError) {
      return // Don't retry if there's already an error
    }

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (hasError) {
    const handleRetry = async () => {
      dispatch(clearError())
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
            className="px-4 py-2 text-white rounded hover:bg-primary-600 transition-colors" style={{ backgroundColor: '#00167a' }}
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

  const transformStudentPerformanceData = () => {
    if (!studentPerformanceReport) {
      return null
    }

    if (studentPerformanceReport.studentPerformanceData && 
        studentPerformanceReport.studentPerformanceData.labels && 
        studentPerformanceReport.studentPerformanceData.datasets) {
      return studentPerformanceReport.studentPerformanceData
    }

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

    const labels = studentsArray.map(s => {
      if (typeof s === 'string') return s
      return s.student_name || s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown'
    })

    const subjectsSet = new Set()
    studentsArray.forEach(s => {
      if (s.performance && typeof s.performance === 'object') {
        Object.keys(s.performance).forEach(subject => subjectsSet.add(subject))
      } else if (s.subjects && Array.isArray(s.subjects)) {
        s.subjects.forEach(subject => subjectsSet.add(subject))
      }
    })

    if (subjectsSet.size === 0) {
      return {
        labels,
        datasets: [
          {
            label: 'Average Score',
            data: studentsArray.map(s => {
              const score = s.averageScore || s.score || s.total_exp || 0
              return score > 100 ? Math.min(100, Math.round(score / 100)) : score
            }),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
          }
        ]
      }
    }

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

  console.log('Chart data loaded:', { studentPerformanceData, mathProgressData, scienceProgressData })

  const tabs = [
    { id: 'student-performance', label: 'Student Performance' },
    { id: 'progress-over-time', label: 'Progress Over Time' },
    { id: 'quiz-assignment', label: 'Quiz/Assignment Summaries' },
    { id: 'ai-insights', label: 'AI Insights' }
  ]

  const transformStudentsData = () => {
    if (!studentPerformanceReport) {
      return []
    }

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
      const name = s.student_name || s.name || 
                   `${s.firstName || ''} ${s.lastName || ''}`.trim() || 
                   'Unknown'
      
      const classValue = s.class || s.className || 'N/A'
      
      let score = 0
      if (s.averageScore !== undefined) {
        score = s.averageScore
      } else if (s.score !== undefined) {
        score = s.score
      } else if (s.total_exp !== undefined) {
        score = Math.min(100, Math.round((s.total_exp || 0) / 100))
      } else if (s.performance && typeof s.performance === 'object') {
        const scores = Object.values(s.performance).filter(v => typeof v === 'number')
        score = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      }
      score = Math.min(100, Math.max(0, score)) // Clamp between 0 and 100

      const attendance = s.attendance !== undefined ? s.attendance : 
                        s.attendanceRate !== undefined ? s.attendanceRate : 0

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

  const classPerformance = analyticsReport?.overview ? [
    { class: 'Total Students', score: Math.round((analyticsReport.overview.total_students || 0) / 10) },
    { class: 'Active Classes', score: Math.round((analyticsReport.overview.active_classes || 0) * 10) },
  ] : []

  const aiInsightsData = Array.isArray(aiInsightsReport) ? aiInsightsReport : []
  const aiInsights = aiInsightsData.map((insight) => {
    let IconComponent = TrendingUp
    if (insight.title?.toLowerCase().includes('engagement') || insight.title?.toLowerCase().includes('completion')) {
      IconComponent = Lightbulb
    }
    
    return {
      icon: IconComponent,
      title: insight.title || 'AI Insight',
      description: insight.description || (insight.recommendations?.[0] || ''),
      color: insight.impact === 'high' ? 'text-red-600' : insight.impact === 'medium' ? 'text-yellow-600' : 'text-primary-500',
      bgColor: insight.impact === 'high' ? 'bg-red-50' : insight.impact === 'medium' ? 'bg-yellow-50' : 'bg-primary-50'
    }
  })

  const quizAssignmentItems = Array.isArray(quizAssignmentSummaries) ? quizAssignmentSummaries : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
        <p className="text-gray-600 mt-2">Analyze student performance and progress with detailed reports.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ease-in-out hover:scale-105 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          
          <button className="flex items-center px-4 py-2 text-white rounded-lg hover:bg-primary-600 transition-colors" style={{ backgroundColor: '#00167a' }}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {activeTab === 'student-performance' && (
        <div className="space-y-6">
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
                                className="bg-primary-500 h-2 rounded-full"
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

          <div className="space-y-6">
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
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

      {activeTab === 'progress-over-time' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Over Time Report</h3>
            <p className="text-gray-600 mb-6">Track student performance trends over different periods.</p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDateRange === '7' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedDateRange === '7' ? { backgroundColor: '#00167a' } : {}}
              >
                Weekly
              </button>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDateRange === '30' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedDateRange === '30' ? { backgroundColor: '#00167a' } : {}}
              >
                Monthly
              </button>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDateRange === '90' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedDateRange === '90' ? { backgroundColor: '#00167a' } : {}}
              >
                Quarterly
              </button>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDateRange === '365' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedDateRange === '365' ? { backgroundColor: '#00167a' } : {}}
              >
                Yearly
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <a href="#" className="text-primary-500 hover:text-primary-600 text-sm font-medium ml-2">View Details</a>
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
                      className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900 mb-2">Comprehensive AI Analysis</h3>
                <p className="text-primary-700">Get detailed AI insights including weak topics, remedial activities, and mastery heatmaps.</p>
              </div>
              <button 
                onClick={() => navigate('/ai-insights')}
                className="px-6 py-3 text-white rounded-lg hover:bg-primary-600 transition-colors" style={{ backgroundColor: '#00167a' }}
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
*/