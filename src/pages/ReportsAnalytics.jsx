import React, { useState, useEffect, useCallback } from 'react';
import { Users, TrendingUp, Target, ChevronDown, ChevronRight, GraduationCap, BookOpen, Layers, FileText, Search, Loader2 } from 'lucide-react';
import reportsService from '../services/reportsService';

const PERIOD_MAP = {
  'Last 7 days': 7,
  'Last 30 days': 30,
  'Last 3 months': 90,
  'Last 6 months': 180,
  'This year': 365,
};

const defaultFilterOptions = {
  classes: [],
  subjects: [],
  modules: [],
  chapters: [],
};

const defaultSummary = { totalStudents: 0, completionRate: 0, averageScore: 0 };
const defaultOverallStats = { totalStudents: 0, averageScore: 0, completionRate: 0, activeStudents: 0 };

const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [activeTab, setActiveTab] = useState('reports');
  const [reportClass, setReportClass] = useState('');
  const [reportSubject, setReportSubject] = useState('');
  const [reportModule, setReportModule] = useState('');
  const [reportChapter, setReportChapter] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentSubject, setStudentSubject] = useState('');
  const [studentModule, setStudentModule] = useState('');
  const [studentChapter, setStudentChapter] = useState('');
  const [showStudentTable, setShowStudentTable] = useState(false);
  const [expandedModules, setExpandedModules] = useState({ 1: true });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(defaultSummary);
  const [filterOptions, setFilterOptions] = useState(defaultFilterOptions);
  const [studentFilterOptions, setStudentFilterOptions] = useState(defaultFilterOptions);
  const [moduleProficiencyData, setModuleProficiencyData] = useState([]);
  const [reportsData, setReportsData] = useState({ summary: defaultSummary, chapterProficiency: [] });
  const [analyticsData, setAnalyticsData] = useState({
    overallStats: defaultOverallStats,
    subjectPerformance: [],
    classPerformance: [],
    recentActivity: [],
  });
  const [studentProficiencyData, setStudentProficiencyData] = useState([]);

  const fetchReportsAnalytics = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const period = opts.period ?? PERIOD_MAP[selectedPeriod] ?? 30;
      const params = {
        period: String(period),
        class: opts.class ?? (reportClass || (selectedClass !== 'All Classes' ? selectedClass : '')),
        subject: (opts.subject ?? reportSubject) || '',
        module: (opts.module ?? reportModule) || '',
        chapter: (opts.chapter ?? reportChapter) || '',
      };
      const data = await reportsService.getReportsAnalytics(params);
      setSummary(data.summary ?? defaultSummary);
      setFilterOptions(data.filterOptions ?? defaultFilterOptions);
      setStudentFilterOptions(data.filterOptions ?? defaultFilterOptions);
      setModuleProficiencyData(Array.isArray(data.moduleProficiencyData) ? data.moduleProficiencyData : []);
      setReportsData(data.reportsData ?? { summary: (data.summary ?? defaultSummary), chapterProficiency: [] });
      setAnalyticsData({
        overallStats: data.analyticsData?.overallStats ?? defaultOverallStats,
        subjectPerformance: data.analyticsData?.subjectPerformance ?? [],
        classPerformance: data.analyticsData?.classPerformance ?? [],
        recentActivity: data.analyticsData?.recentActivity ?? [],
      });
      setStudentProficiencyData(Array.isArray(data.studentProficiencyData) ? data.studentProficiencyData : []);
    } catch (err) {
      setError(err.message || 'Failed to load reports analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedClass, reportClass, reportSubject, reportModule, reportChapter]);

  useEffect(() => {
    fetchReportsAnalytics();
  }, [selectedPeriod, selectedClass]);

  const handleReportClassChange = (e) => {
    const val = e.target.value;
    setReportClass(val);
    fetchReportsAnalytics({ class: val || undefined, subject: reportSubject, module: reportModule, chapter: reportChapter });
  };

  const handleSubjectChange = (e) => {
    const val = e.target.value;
    setReportSubject(val);
    setReportModule('');
    setReportChapter('');
    fetchReportsAnalytics({ class: reportClass || undefined, subject: val, module: '', chapter: '' });
  };

  const handleModuleChange = (e) => {
    const val = e.target.value;
    setReportModule(val);
    setReportChapter('');
    fetchReportsAnalytics({ class: reportClass || undefined, subject: reportSubject, module: val, chapter: '' });
  };

  const handleChapterChange = (e) => {
    const val = e.target.value;
    setReportChapter(val);
    fetchReportsAnalytics({ class: reportClass || undefined, subject: reportSubject, module: reportModule, chapter: val });
  };

  const fetchStudentProficiencyOnly = useCallback(async (opts = {}) => {
    try {
      const params = {
        period: String(PERIOD_MAP[selectedPeriod] ?? 30),
        class: (opts.class ?? studentClass) || '',
        subject: (opts.subject ?? studentSubject) || '',
        module: (opts.module ?? studentModule) || '',
        chapter: (opts.chapter ?? studentChapter) || '',
      };
      const data = await reportsService.getReportsAnalytics(params);
      setStudentFilterOptions(data.filterOptions ?? defaultFilterOptions);
      setStudentProficiencyData(Array.isArray(data.studentProficiencyData) ? data.studentProficiencyData : []);
    } catch (err) {
      setError(err.message || 'Failed to load student proficiency');
    }
  }, [selectedPeriod, studentClass, studentSubject, studentModule, studentChapter]);

  const handleStudentSubjectChange = (e) => {
    const val = e.target.value;
    setStudentSubject(val);
    setStudentModule('');
    setStudentChapter('');
    fetchStudentProficiencyOnly({ class: studentClass, subject: val, module: '', chapter: '' });
  };

  const handleStudentModuleChange = (e) => {
    const val = e.target.value;
    setStudentModule(val);
    setStudentChapter('');
    fetchStudentProficiencyOnly({ class: studentClass, subject: studentSubject, module: val, chapter: '' });
  };

  const handleStudentChapterChange = (e) => {
    const val = e.target.value;
    setStudentChapter(val);
    fetchStudentProficiencyOnly({ class: studentClass, subject: studentSubject, module: studentModule, chapter: val });
  };

  const getModuleProficiency = (chapters) => {
    if (!chapters?.length) return 0;
    const avg = chapters.reduce((sum, ch) => sum + (ch.proficiency ?? 0), 0) / chapters.length;
    return Math.round(avg * 10) / 10;
  };

  const getTopicStatus = (proficiency) => {
    if (proficiency > 75) return 'go';
    if (proficiency >= 50) return 'watch';
    return 'stop';
  };

  const getWeakLevels = (proficiency) => {
    if (proficiency > 80) return [5];
    if (proficiency >= 70) return [4, 5];
    if (proficiency >= 50) return [3, 4, 5];
    if (proficiency >= 20) return [2, 3, 4, 5];
    return [1, 2, 3, 4, 5];
  };

  const getProficiencyColor = (val) => {
    if (val > 75) return '#22c55e';
    if (val >= 50) return '#eab308';
    return '#ef4444';
  };

  const normalizeOptions = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => (typeof item === 'object' && item?.id != null ? item : { id: item, name: String(item) }));
  };

  const handleApplyFilters = async () => {
    await fetchStudentProficiencyOnly({
      class: studentClass || undefined,
      subject: studentSubject || undefined,
      module: studentModule || undefined,
      chapter: studentChapter || undefined,
    });
    setShowStudentTable(true);
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'reports', label: 'Reports' }
  ];

  const classesList = Array.isArray(filterOptions.classes) ? filterOptions.classes : [];
  const subjectsList = normalizeOptions(filterOptions.subjects);
  const modulesList = normalizeOptions(filterOptions.modules);
  const chaptersList = normalizeOptions(filterOptions.chapters);

  const studentClassesList = Array.isArray(studentFilterOptions.classes) ? studentFilterOptions.classes : [];
  const studentSubjectsList = normalizeOptions(studentFilterOptions.subjects);
  const studentModulesList = normalizeOptions(studentFilterOptions.modules);
  const studentChaptersList = normalizeOptions(studentFilterOptions.chapters);

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{animationDelay: '0.1s'}}>Comprehensive insights into student performance and learning patterns.</p>
      </div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 min-h-[320px]" aria-busy="true">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin mb-4" aria-hidden="true" />
          <p className="text-gray-600 font-medium">Loading reports…</p>
          <p className="text-sm text-gray-500 mt-1">Fetching analytics data</p>
        </div>
      )}

      {!loading && (
      <>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-300 ease-in-out hover:scale-105 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ 
                animationDelay: `${index * 100}ms`,
                display: tab.id === 'analytics' ? 'none' : 'block'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'analytics' && (
      <div className="mb-6 flex space-x-4">
        <div className="animate-slide-right" style={{animationDelay: '0.2s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>This year</option>
          </select>
        </div>
        
        <div className="animate-slide-right" style={{animationDelay: '0.3s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
          >
            <option>All Classes</option>
            {classesList.map((cls) => (
              <option key={typeof cls === 'string' ? cls : cls.name} value={typeof cls === 'string' ? cls : cls.name}>{typeof cls === 'string' ? cls : cls.name}</option>
            ))}
          </select>
        </div>
      </div>
      )}

      {activeTab === 'analytics' && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-500 mb-2 animate-count-up">{analyticsData.overallStats.totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.5s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2 animate-count-up">{analyticsData.overallStats.averageScore}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2 animate-count-up">{analyticsData.overallStats.completionRate}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.7s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2 animate-count-up">{analyticsData.overallStats.activeStudents}</div>
            <div className="text-sm text-gray-600">Active Students</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Performance</h3>
          <div className="space-y-4">
            {analyticsData.subjectPerformance.map((subject, index) => (
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
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${subject.averageScore}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-medium">{subject.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${subject.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Performance</h3>
          <div className="space-y-4">
            {analyticsData.classPerformance.map((classData, index) => (
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
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${classData.averageScore}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-medium">{classData.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${classData.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {analyticsData.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <span className="text-primary-500 text-sm">
                    {activity.action.includes('Test') ? '🧪' : activity.action.includes('Module') ? '📚' : '📝'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                  <div className="text-sm text-gray-500">{activity.student} - {activity.subject}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{activity.score}%</div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

        </>
      )}

      {activeTab === 'reports' && (
        <>
          {/* Chapter-wise filter (top) – drives summary and chapter-wise proficiency table */}
          <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Chapter-wise filter</h3>
            <p className="text-xs text-gray-500 mb-4">Filter report data and chapter-wise proficiency by subject, module, and topic.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Class</label>
                <select
                  value={reportClass}
                  onChange={handleReportClassChange}
                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">All Classes</option>
                  {classesList.map((cls) => {
                    const name = typeof cls === 'string' ? cls : cls?.name;
                    return <option key={name} value={name}>{name}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                <select
                  value={reportSubject}
                  onChange={handleSubjectChange}
                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Select Subject</option>
                  {subjectsList.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Module</label>
                <select
                  value={reportModule}
                  onChange={handleModuleChange}
                  disabled={!reportSubject}
                  className={`w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${!reportSubject ? 'cursor-not-allowed opacity-60 text-gray-400' : 'text-gray-700'}`}
                >
                  <option value="">Select Module</option>
                  {modulesList.map((mod) => (
                    <option key={mod.id} value={mod.id}>{mod.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Topic</label>
                <select
                  value={reportChapter}
                  onChange={handleChapterChange}
                  disabled={!reportModule}
                  className={`w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${!reportModule ? 'cursor-not-allowed opacity-60 text-gray-400' : 'text-gray-700'}`}
                >
                  <option value="">Select Topic</option>
                  {chaptersList.map((chap) => (
                    <option key={chap.id} value={chap.id}>{chap.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{reportsData.summary.totalStudents}</p>
                </div>
                <div className="p-3 bg-primary-500/20 rounded-full">
                  <Users className="h-8 w-8 text-primary-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completion Rate</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{reportsData.summary.completionRate}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Score</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{reportsData.summary.averageScore}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Module-wise Student Proficiency */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up mb-8" style={{animationDelay: '0.35s'}}>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Chapter-wise Student Proficiency</h3>
                <p className="text-sm text-gray-500 mt-1">First-attempt accuracy by chapter and topic — click a chapter to expand topics</p>
              </div>
              <div className="flex items-center gap-5 text-sm">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>≥75% Proficient</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>50–74% OK</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>&lt;50% Weak</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Module / Chapter</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/5">Proficiency</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Weak Subtopics</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Weak Levels</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {moduleProficiencyData.map((mod) => {
                    const modProficiency = getModuleProficiency(mod.chapters);
                    const modWeakLevels = getWeakLevels(modProficiency);
                    return (
                    <>
                      {/* Module row */}
                      <tr
                        key={mod.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={() => setExpandedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">
                              {expandedModules[mod.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </span>
                            <span className="font-semibold text-gray-800">{mod.moduleName}</span>
                            <span className="text-xs text-gray-400 font-normal">{mod.chapters.length} topics</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="h-2 rounded-full" style={{ width: `${modProficiency}%`, backgroundColor: getProficiencyColor(modProficiency) }}></div>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: getProficiencyColor(modProficiency) }}>{modProficiency}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {mod.weakSubtopics.length === 0
                            ? <span className="text-gray-400 text-sm">None</span>
                            : <div className="flex flex-wrap gap-1">{mod.weakSubtopics.map((s, i) => <span key={i} className="px-2 py-0.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded">{s}</span>)}</div>
                          }
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">{modWeakLevels.map((l) => <span key={l} className="w-6 h-6 flex items-center justify-center text-xs font-medium border border-red-300 text-red-600 rounded">{l}</span>)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-400 italic">expand</span>
                        </td>
                      </tr>

                      {/* Chapter rows */}
                      {expandedModules[mod.id] && mod.chapters.map((ch, ci) => {
                        const status = getTopicStatus(ch.proficiency);
                        const chWeakLevels = getWeakLevels(ch.proficiency);
                        return (
                        <tr key={`${mod.id}-${ci}`} className="bg-white border-l-4 border-blue-600 hover:bg-blue-50/30 transition-colors duration-150">
                          <td className="px-6 py-3 pl-12">
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-gray-300 text-xs">└</span>
                              <span className="text-sm font-medium">{ch.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${ch.proficiency}%`, backgroundColor: getProficiencyColor(ch.proficiency) }}></div>
                              </div>
                              <span className="text-sm font-semibold" style={{ color: getProficiencyColor(ch.proficiency) }}>{ch.proficiency}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-gray-400 text-sm">—</span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex gap-1">{chWeakLevels.map((l) => <span key={l} className="w-6 h-6 flex items-center justify-center text-xs font-medium border border-red-300 text-red-600 rounded">{l}</span>)}</div>
                          </td>
                          <td className="px-6 py-3">
                            {status === 'go'
                              ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-200"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>GO</span>
                              : status === 'watch'
                              ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>WATCH</span>
                              : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>STOP</span>
                            }
                          </td>
                        </tr>
                        );
                      })}
                    </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Topic-wise Student Proficiency */}


          <div className="mt-8 bg-gradient-to-r from-slate-50 to-primary-50 rounded-2xl p-6 border border-slate-200 shadow-sm animate-slide-up" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center mb-6">
              <Search className="h-5 w-5 text-primary-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Filter Student Performance</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Use these filters only for the student proficiency table below. Apply to load results.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="relative group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Class</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-primary-500/20 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-primary-500" />
                  </div>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 hover:border-primary-500/50"
                  >
                    <option value="">Select Class</option>
                    {studentClassesList.map((cls) => {
                      const name = typeof cls === 'string' ? cls : cls?.name;
                      return <option key={name} value={name}>{name}</option>;
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-green-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </div>
                  <select
                    value={studentSubject}
                    onChange={handleStudentSubjectChange}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 hover:border-green-300"
                  >
                    <option value="">Select Subject</option>
                    {studentSubjectsList.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Module</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-purple-100 rounded-lg">
                    <Layers className="h-4 w-4 text-purple-600" />
                  </div>
                  <select
                    value={studentModule}
                    onChange={handleStudentModuleChange}
                    disabled={!studentSubject}
                    className={`w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium appearance-none transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-300 ${!studentSubject ? 'cursor-not-allowed opacity-60 text-gray-400' : 'cursor-pointer text-gray-700'}`}
                  >
                    <option value="">Select Module</option>
                    {studentModulesList.map((mod) => (
                      <option key={mod.id} value={mod.id}>{mod.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Topic</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-orange-100 rounded-lg">
                    <FileText className="h-4 w-4 text-orange-600" />
                  </div>
                  <select
                    value={studentChapter}
                    onChange={handleStudentChapterChange}
                    disabled={!studentModule}
                    className={`w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium appearance-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 hover:border-orange-300 ${!studentModule ? 'cursor-not-allowed opacity-60 text-gray-400' : 'cursor-pointer text-gray-700'}`}
                  >
                    <option value="">Select Topic</option>
                    {studentChaptersList.map((chap) => (
                      <option key={chap.id} value={chap.id}>{chap.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleApplyFilters}
                className="px-8 py-3 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}
              >
                Apply Filters
              </button>
            </div>
          </div>

          {showStudentTable && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-secondary-500/10 to-primary-500/10">
                <h3 className="text-lg font-semibold text-gray-800">Student Proficiency Results</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Showing results for: {studentClass || 'All Classes'} • {studentSubjectsList.find(s => s.id === studentSubject)?.name || studentSubject || 'All Subjects'} • {studentModulesList.find(m => m.id === studentModule)?.name || studentModule || 'All Modules'} • {studentChaptersList.find(c => c.id === studentChapter)?.name || studentChapter || 'All Topics'}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S.No</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-500">
                          Proficient %
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentProficiencyData.map((student, index) => (
                      <tr 
                        key={student.id} 
                        className="hover:bg-primary-500/10 transition-colors duration-150"
                        style={{ animation: 'fadeInUp 0.3s ease-out forwards', animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold mr-3">
                              {student.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-24 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                              <div 
                                className={`h-3 rounded-full transition-all duration-700 ${
                                  student.proficient >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                  student.proficient >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                  'bg-gradient-to-r from-red-400 to-red-600'
                                }`}
                                style={{ width: `${student.proficient}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-bold ${
                              student.proficient >= 80 ? 'text-green-600' :
                              student.proficient >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {student.proficient}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </>
      )}
      </>
      )}
    </div>
  );
};

export default ReportsAnalytics;
