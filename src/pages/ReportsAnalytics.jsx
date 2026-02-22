import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, TrendingUp, Target, ChevronDown, GraduationCap, BookOpen, Layers, FileText, Search, RefreshCw, AlertCircle } from 'lucide-react';
import {
  fetchTeacherOverview,
  fetchTeacherStudentProficiency,
  clearError,
} from '../features/reports/reportsSlice';

// ─── Loading Skeleton ────────────────────────────────────────────────────────
const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
      <div className="w-14 h-14 bg-gray-200 rounded-full" />
    </div>
  </div>
);

const RowSkeleton = () => (
  <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex justify-between mb-2">
      <div className="h-4 bg-gray-200 rounded w-32" />
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
    <div className="h-2 bg-gray-200 rounded-full w-full mt-2" />
    <div className="h-2 bg-gray-200 rounded-full w-full mt-3" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ReportsAnalytics = () => {
  const dispatch = useDispatch();
  const { teacherOverview, teacherStudentProficiency, loading, error } = useSelector(
    (state) => state.reports
  );

  const [activeTab, setActiveTab] = useState('reports');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
  const [selectedClass, setSelectedClass] = useState('');

  // Filter state (IDs from real data)
  const [reportClassId, setReportClassId] = useState('');
  const [reportSubjectId, setReportSubjectId] = useState('');
  const [reportModuleId, setReportModuleId] = useState('');
  const [reportChapterId, setReportChapterId] = useState('');
  const [showStudentTable, setShowStudentTable] = useState(false);

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchTeacherOverview());
  }, [dispatch]);

  const isLoading = loading.teacherOverview;
  const hasError = !!error.teacherOverview;

  // ── Derived data ──────────────────────────────────────────────────────────
  const overview = teacherOverview || {};
  const analytics = overview.analytics || {};
  const reports = overview.reports || {};
  const filterOptions = overview.filterOptions || {
    classes: [], subjects: [], modules: [], chapters: [],
  };

  const overallStats = analytics.overallStats || {};
  const subjectPerformance = analytics.subjectPerformance || [];
  const classPerformance = analytics.classPerformance || [];
  const recentActivity = analytics.recentActivity || [];

  const reportsSummary = reports.summary || {};
  const moduleProficiency = reports.moduleProficiency || [];

  // Accordion open state: set of module IDs that are expanded
  const [openModules, setOpenModules] = React.useState(new Set());
  const toggleModule = (id) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Proficiency colour helpers
  const profColor = (pct) =>
    pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const profTextClass = (pct) =>
    pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-500' : 'text-red-500';
  const profBgClass = (pct) =>
    pct >= 75 ? 'bg-green-100 text-green-800' : pct >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700';

  // Status badge helper
  const StatusBadge = ({ status }) => {
    const styles = {
      GO: 'bg-green-100 text-green-800 border border-green-300',
      WATCH: 'bg-orange-100 text-orange-800 border border-orange-300',
      STOP: 'bg-red-100 text-red-800 border border-red-300',
    };
    const dots = { GO: '🟢', WATCH: '🟠', STOP: '🔴' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.STOP}`}>
        {dots[status] || '⚪'} {status || 'N/A'}
      </span>
    );
  };

  const studentProficiency = Array.isArray(teacherStudentProficiency)
    ? teacherStudentProficiency
    : [];
  const proficiencyLoading = loading.teacherStudentProficiency;

  // Filter class performance by selected class in analytics tab
  const filteredClassPerf = selectedClass
    ? classPerformance.filter((c) => c.class_id === selectedClass || c.class === selectedClass)
    : classPerformance;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRetry = () => {
    dispatch(clearError('teacherOverview'));
    dispatch(fetchTeacherOverview());
  };

  const handleApplyFilters = () => {
    const filters = {};
    if (reportClassId) filters.class_id = reportClassId;
    if (reportSubjectId) filters.subject_id = reportSubjectId;
    if (reportModuleId) filters.module_id = reportModuleId;
    if (reportChapterId) filters.chapter_id = reportChapterId;
    dispatch(fetchTeacherStudentProficiency(filters));
    setShowStudentTable(true);
  };

  // ── Label helpers ─────────────────────────────────────────────────────────
  const selectedClassName = () => {
    const cls = filterOptions.classes.find((c) => c.id === reportClassId);
    return cls ? cls.name : 'All Classes';
  };
  const selectedSubjectName = () => {
    const s = filterOptions.subjects.find((s) => s.id === reportSubjectId);
    return s ? s.name : 'All Subjects';
  };
  const selectedModuleName = () => {
    const m = filterOptions.modules.find((m) => m.id === reportModuleId);
    return m ? m.name : 'All Modules';
  };
  const selectedChapterName = () => {
    const c = filterOptions.chapters.find((c) => c.id === reportChapterId);
    return c ? c.name : 'All Topics';
  };

  // ── Cascaded filter lists ─────────────────────────────────────────────────
  // Modules: show all, or only those for selected subject
  const filteredModules = reportSubjectId
    ? filterOptions.modules.filter((m) => m.subject_id === reportSubjectId)
    : filterOptions.modules;

  // Topics (chapters): show only chapters for the selected module,
  // or chapters for the selected subject, or all
  const filteredChapters = reportModuleId
    ? filterOptions.chapters.filter((c) => c.module_id === reportModuleId)
    : reportSubjectId
      ? filterOptions.chapters.filter((c) => c.subject_id === reportSubjectId)
      : filterOptions.chapters;

  // ── Cascade-clearing handlers ─────────────────────────────────────────────
  const handleSubjectChange = (e) => {
    setReportSubjectId(e.target.value);
    setReportModuleId('');   // reset module when subject changes
    setReportChapterId('');  // reset topic too
  };
  const handleModuleChange = (e) => {
    setReportModuleId(e.target.value);
    setReportChapterId('');  // reset topic when module changes
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Error state
  // ─────────────────────────────────────────────────────────────────────────
  if (hasError && !isLoading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 flex flex-col items-center text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to load Reports & Analytics</h2>
          <p className="text-red-600 text-sm mb-6">{error.teacherOverview}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: '#00167a' }}
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Main page
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{ animationDelay: '0.1s' }}>
          Comprehensive insights into student performance and learning patterns.
        </p>
      </div>

      {/* Tabs - Analytics temporarily hidden as per request */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['reports'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-300 capitalize ${activeTab === tab
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Analytics Tab Content (Hidden) */}
      {/* 
      {activeTab === 'analytics' && (
        <>
          <div className="mb-6 flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200"
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last 6 months</option>
                <option>This year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Classes</option>
                {filterOptions.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-500 mb-2">{overallStats.totalStudents ?? '—'}</div>
                    <div className="text-sm text-gray-600">Total Students</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{overallStats.averageScore ?? '—'}%</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{overallStats.completionRate ?? '—'}%</div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{overallStats.activeStudents ?? '—'}</div>
                    <div className="text-sm text-gray-600">Active Students</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Performance</h3>
              {isLoading ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}</div>
              ) : subjectPerformance.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No subject data available.</p>
              ) : (
                <div className="space-y-4">
                  {subjectPerformance.map((subject, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800">{subject.subject}</h4>
                        <span className="text-sm text-gray-500">{subject.students} students</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Average Score</span>
                          <span className="font-medium">{subject.averageScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${subject.averageScore}%` }} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completion Rate</span>
                          <span className="font-medium">{subject.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${subject.completionRate}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Performance</h3>
              {isLoading ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}</div>
              ) : filteredClassPerf.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No class data available.</p>
              ) : (
                <div className="space-y-4">
                  {filteredClassPerf.map((classData, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800">{classData.class}</h4>
                        <span className="text-sm text-gray-500">{classData.students} students</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Average Score</span>
                          <span className="font-medium">{classData.averageScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${classData.averageScore}%` }} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completion Rate</span>
                          <span className="font-medium">{classData.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${classData.completionRate}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No recent activity found.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                        <span className="text-primary-500 text-sm">📚</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                        <div className="text-sm text-gray-500">{activity.student}{activity.subject ? ` — ${activity.subject}` : ''}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{activity.score}%</div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      */}

      {/* ────────── REPORTS TAB ────────── */}
      {activeTab === 'reports' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{reportsSummary.totalStudents ?? '—'}</p>
                    </div>
                    <div className="p-3 bg-primary-500/20 rounded-full">
                      <Users className="h-8 w-8 text-primary-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completion Rate</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">{reportsSummary.completionRate ?? '—'}%</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Score</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">{reportsSummary.averageScore ?? '—'}%</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Module Proficiency Accordion Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up mb-8" style={{ animationDelay: '0.3s' }}>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Module-wise Student Proficiency</h3>
                <p className="text-sm text-gray-500 mt-0.5">First-attempt accuracy by module and topic — click a module to expand chapters</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> ≥75% Proficient</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> 50–74% OK</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> &lt;50% Weak</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Module-level header (no Status column) */}
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-8" />
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Module / Chapter</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Proficiency</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Weak Subtopics</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Weak Levels</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-4">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : moduleProficiency.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">
                        No module data available. Ensure students are working through topics.
                      </td>
                    </tr>
                  ) : (
                    moduleProficiency.map((mod) => {
                      const isOpen = openModules.has(mod.id);
                      return (
                        <React.Fragment key={mod.id}>
                          {/* ── Module Row (no Status) ─────────────────── */}
                          <tr
                            className="hover:bg-blue-50 cursor-pointer transition-colors duration-150 bg-gray-50"
                            onClick={() => toggleModule(mod.id)}
                          >
                            {/* Expand icon */}
                            <td className="px-4 py-3 text-center w-8">
                              <span className={`inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-all duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                              </span>
                            </td>
                            {/* Module name */}
                            <td className="px-4 py-3 min-w-[200px]">
                              <span className="text-sm font-medium text-gray-800">{mod.name}</span>
                              <span className="ml-2 text-xs text-gray-400">{mod.chapters?.length ?? 0} topics</span>
                            </td>
                            {/* Proficiency bar */}
                            <td className="px-4 py-3 w-48">
                              <div className="flex items-center justify-start gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${mod.proficiency}%`, backgroundColor: profColor(mod.proficiency) }}
                                  />
                                </div>
                                <span className={`text-xs font-medium w-9 ${profTextClass(mod.proficiency)}`}>
                                  {mod.proficiency}%
                                </span>
                              </div>
                            </td>
                            {/* Weak subtopics (chapter names < 50%) */}
                            <td className="px-4 py-3 min-w-[250px] max-w-[350px]">
                              {mod.weakSubtopics?.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 items-start">
                                  {mod.weakSubtopics.map((s, i) => (
                                    <span key={i} className="inline-block bg-gray-100/80 text-red-600 text-xs px-2 py-1 rounded border border-gray-200 truncate max-w-full" title={s}>
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-green-600 font-medium">None</span>
                              )}
                            </td>
                            {/* Weak levels */}
                            <td className="px-4 py-3 text-center">
                              {mod.weakLevels?.length > 0 ? (
                                <div className="flex justify-center gap-1">
                                  {mod.weakLevels.map((lvl, i) => (
                                    <span key={i} className="inline-block bg-gray-100/80 text-red-600 font-semibold text-xs px-2 py-0.5 rounded border border-gray-200">
                                      {lvl}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-green-600">—</span>
                              )}
                            </td>
                            {/* Status: hidden at module level */}
                            <td className="px-4 py-4 text-center">
                              <span className="text-xs text-gray-300 italic">expand</span>
                            </td>
                          </tr>

                          {/* ── Chapter Rows (accordion, with Status) ──── */}
                          {isOpen && (mod.chapters || []).map((ch) => (
                            <tr
                              key={ch.id}
                              className="hover:bg-gray-50 transition-colors duration-150 border-l-4 border-primary-400"
                              style={{ backgroundColor: '#fafbff' }}
                            >
                              {/* Indent spacer */}
                              <td className="px-4 py-3" />
                              {/* Chapter name (indented) */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2 pl-4">
                                  <span className="text-gray-300">└</span>
                                  <span className="text-sm text-gray-700 font-medium">{ch.name}</span>
                                </div>
                              </td>
                              {/* Proficiency */}
                              <td className="px-4 py-2 w-48">
                                <div className="flex items-center justify-start gap-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="h-1.5 rounded-full transition-all duration-500"
                                      style={{ width: `${ch.proficiency}%`, backgroundColor: profColor(ch.proficiency) }}
                                    />
                                  </div>
                                  <span className={`text-xs font-medium w-9 ${profTextClass(ch.proficiency)}`}>
                                    {ch.proficiency}%
                                  </span>
                                </div>
                              </td>
                              {/* Weak subtopics (empty at chapter level) */}
                              <td className="px-4 py-3">
                                <span className="text-xs text-gray-400">—</span>
                              </td>
                              {/* Weak levels (Chapter) */}
                              <td className="px-4 py-2 text-center border-l border-gray-100">
                                {ch.weakLevels?.length > 0 ? (
                                  <div className="flex justify-center gap-1">
                                    {ch.weakLevels.map((lvl, i) => (
                                      <span key={i} className="inline-block bg-gray-100/80 text-red-600 font-semibold text-xs px-2 py-0.5 rounded border border-gray-200">
                                        {lvl}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </td>
                              {/* Status Badge (only at chapter level) */}
                              <td className="px-4 py-3 text-center">
                                <StatusBadge status={ch.status} />
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Filter Panel */}
          <div className="bg-gradient-to-r from-slate-50 to-primary-50 rounded-2xl p-6 border border-slate-200 shadow-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center mb-6">
              <Search className="h-5 w-5 text-primary-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Filter Student Performance</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Class */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Class</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-primary-500/20 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-primary-500" />
                  </div>
                  <select
                    value={reportClassId}
                    onChange={(e) => setReportClassId(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200"
                    disabled={isLoading}
                  >
                    <option value="">Select Class</option>
                    {filterOptions.classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Subject */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-green-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </div>
                  <select
                    value={reportSubjectId}
                    onChange={handleSubjectChange}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                    disabled={isLoading}
                  >
                    <option value="">Select Subject</option>
                    {filterOptions.subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Module — cascaded by Subject */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Module</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-purple-100 rounded-lg">
                    <Layers className="h-4 w-4 text-purple-600" />
                  </div>
                  <select
                    value={reportModuleId}
                    onChange={handleModuleChange}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                    disabled={isLoading}
                  >
                    <option value="">Select Module</option>
                    {filteredModules.map((mod) => (
                      <option key={mod.id} value={mod.id}>{mod.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Topic / Chapter — cascaded by Module (then Subject) */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Topic</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-orange-100 rounded-lg">
                    <FileText className="h-4 w-4 text-orange-600" />
                  </div>
                  <select
                    value={reportChapterId}
                    onChange={(e) => setReportChapterId(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                    disabled={isLoading}
                  >
                    <option value="">Select Topic</option>
                    {filteredChapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleApplyFilters}
                disabled={isLoading || proficiencyLoading}
                className="px-8 py-3 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}
              >
                {proficiencyLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                Apply Filters
              </button>
            </div>
          </div>

          {/* Student Proficiency Results Table */}
          {showStudentTable && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-secondary-500/10 to-primary-500/10">
                <h3 className="text-lg font-semibold text-gray-800">Student Proficiency Results</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Showing results for: {selectedClassName()} • {selectedSubjectName()} • {selectedModuleName()} • {selectedChapterName()}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S.No</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-500">Proficient %</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {proficiencyLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 3 }).map((_, j) => (
                            <td key={j} className="px-6 py-4">
                              <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : studentProficiency.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-10 text-center text-gray-500 text-sm">
                          No student data found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      studentProficiency.map((student, index) => (
                        <tr
                          key={student.id}
                          className="hover:bg-primary-500/10 transition-colors duration-150"
                          style={{ animation: 'fadeInUp 0.3s ease-out forwards', animationDelay: `${index * 40}ms` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold mr-3">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-24 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                                <div
                                  className={`h-3 rounded-full transition-all duration-700 ${student.proficient >= 75 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                    student.proficient >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                      'bg-gradient-to-r from-red-400 to-red-600'
                                    }`}
                                  style={{ width: `${student.proficient}%` }}
                                />
                              </div>
                              <span className={`text-sm font-bold ${student.proficient >= 75 ? 'text-green-600' :
                                student.proficient >= 50 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                {student.proficient}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsAnalytics;
