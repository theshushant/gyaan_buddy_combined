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
    { topic: 'Quadratic Equations',   pct: 42, difficulty: 'Hard'   },
    { topic: 'Integration by Parts',  pct: 38, difficulty: 'Hard'   },
    { topic: 'Circle Theorems',       pct: 31, difficulty: 'Medium' },
    { topic: 'Inverse Trigonometry',  pct: 28, difficulty: 'Hard'   },
    { topic: 'Standard Deviation',    pct: 22, difficulty: 'Medium' },
  ],
  'Science': [
    { topic: "Laws of Motion",          pct: 39, difficulty: "Newton's 3rd Law" },
    { topic: 'Chemical Reactions and Equations',  pct: 36, difficulty: 'Balancing Equations'   },
    { topic: 'Ray Optics', pct: 30, difficulty: 'Total Internal Reflection'   },
    { topic: "Daily Electronics",    pct: 25, difficulty: "Ohm's Law Applications" },
    { topic: 'Cell Cycle and Cell Division',   pct: 45, difficulty: 'Cell Division (Meiosis)' },
  ],
  'English': [
    { topic: 'Essay Structure',      pct: 44, difficulty: 'Hard'   },
    { topic: 'Figurative Language',  pct: 35, difficulty: 'Medium' },
    { topic: 'Meter & Rhyme Scheme', pct: 32, difficulty: 'Hard'   },
    { topic: 'Inference Questions',  pct: 27, difficulty: 'Medium' },
    { topic: 'Subjunctive Mood',     pct: 21, difficulty: 'Medium' },
  ],
  'Hindi': [
    { topic: 'Essay Composition',       pct: 41, difficulty: 'Hard'   },
    { topic: 'Poetry Analysis',         pct: 37, difficulty: 'Hard'   },
    { topic: 'Karak (Case)',            pct: 29, difficulty: 'Medium' },
    { topic: 'Tatsam / Tadbhav Words',  pct: 23, difficulty: 'Medium' },
    { topic: 'Comprehension Speed',     pct: 18, difficulty: 'Easy'   },
  ],
  'Social Studies': [
    { topic: 'Supply & Demand',           pct: 45, difficulty: 'Hard'   },
    { topic: 'Map Reading',               pct: 33, difficulty: 'Medium' },
    { topic: 'Medieval Period',           pct: 28, difficulty: 'Medium' },
    { topic: 'International Events',      pct: 24, difficulty: 'Medium' },
    { topic: 'Constitutional Amendments', pct: 19, difficulty: 'Easy'   },
  ],
  'Computer Science': [
    { topic: 'Graph Algorithms',  pct: 48, difficulty: 'Hard'   },
    { topic: 'TCP/IP Protocols',  pct: 35, difficulty: 'Hard'   },
    { topic: 'Normalization',     pct: 29, difficulty: 'Medium' },
    { topic: 'Recursion',         pct: 26, difficulty: 'Medium' },
    { topic: 'Memory Management', pct: 22, difficulty: 'Medium' },
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

const difficultyBadge = (d) =>
  d === 'Hard'   ? 'bg-red-100 text-red-700'    :
  d === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                   'bg-green-100 text-green-700'

const pctColor = (p) =>
  p >= 35 ? 'text-red-600' : p >= 20 ? 'text-yellow-600' : 'text-green-600'

// Returns weak topics adjusted for a section's performance offset
// (better sections have fewer students struggling)
const getSectionWeakTopics = (subj, secOffset) =>
  SUBJECT_WEAK_TOPICS[subj]
    .map(wt => ({
      ...wt,
      pct: Math.min(70, Math.max(5, Math.round(wt.pct - secOffset * 0.6))),
    }))
    .filter(wt => wt.pct >= 12)
    .sort((a, b) => b.pct - a.pct)

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
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">{row.topWeak.topic}</span>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${difficultyBadge(row.topWeak.difficulty)}`}>
                                {row.topWeak.difficulty}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Weak topic rows (expanded) */}
                      {isExpanded && row.weakTopics.map((wt, idx) => (
                        <tr
                          key={`${row.key}-wt-${idx}`}
                          className="border-t border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 pl-16 pr-6">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <span className="text-gray-300 select-none">↳</span>
                              <span>{wt.topic}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-gray-300 text-xs">—</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                <div
                                  className="h-1.5 rounded-full"
                                  style={{
                                    width: `${Math.min(100, wt.pct * 1.5)}%`,
                                    backgroundColor: wt.pct <= 35 ? '#ef4444' : wt.pct >= 36 ? '#f59e0b' : '#22c55e',
                                  }}
                                />
                              </div>
                              <span className={`text-xs font-semibold ${pctColor(wt.pct)}`}>
                                {wt.pct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-gray-300 text-xs">—</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${difficultyBadge(wt.difficulty)}`}>
                              {wt.difficulty}
                            </span>
                          </td>
                        </tr>
                      ))}
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
                    <th className="px-6 py-3"></th>
                    <th className="px-6 py-3">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {displaySubjects.map(subj => {
                    const subjAvg  = Math.round(activeCls.reduce((s, c) => s + PERF[c][subj].avg,  0) / activeCls.length)
                    const subjPass = Math.round(activeCls.reduce((s, c) => s + PERF[c][subj].pass, 0) / activeCls.length)
                    const isExpanded = expandedSubjects.has(subj)
                    const weakTopics = SUBJECT_WEAK_TOPICS[subj]

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
                              <span className="text-xs text-gray-400 font-normal">({weakTopics.length} weak topics)</span>
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
                        </tr>

                        {/* Weak topic rows (expanded) */}
                        {isExpanded && weakTopics.map((wt, idx) => (
                          <tr
                            key={`${subj}-wt-${idx}`}
                            className="border-t border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 pl-16 pr-6">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span className="text-gray-300 select-none">↳</span>
                                <span>{wt.topic}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full"
                                    style={{
                                      width: `${Math.min(100, wt.pct * 1.5)}%`,
                                      backgroundColor: wt.pct >= 35 ? '#ef4444' : wt.pct >= 20 ? '#f59e0b' : '#22c55e',
                                    }}
                                  />
                                </div>
                                <span className={`text-xs font-semibold ${pctColor(wt.pct)}`}>
                                  {wt.pct}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-gray-300 text-xs">—</td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${difficultyBadge(wt.difficulty)}`}>
                                {wt.difficulty}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-gray-300 text-xs">—</td>
                          </tr>
                        ))}
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
