import React, { useState } from 'react';
import { Users, TrendingUp, Target, ChevronDown, GraduationCap, BookOpen, Layers, FileText, Search } from 'lucide-react';

const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [activeTab, setActiveTab] = useState('reports');
  
  // Report filters state
  const [reportClass, setReportClass] = useState('');
  const [reportSubject, setReportSubject] = useState('');
  const [reportModule, setReportModule] = useState('');
  const [reportChapter, setReportChapter] = useState('');
  const [showStudentTable, setShowStudentTable] = useState(false);

  const analyticsData = {
    overallStats: {
      totalStudents: 120,
      averageScore: 78,
      completionRate: 92,
      activeStudents: 95
    },
    subjectPerformance: [
      { subject: 'Mathematics', averageScore: 82, completionRate: 95, students: 30 },
      { subject: 'Science', averageScore: 76, completionRate: 88, students: 28 },
      { subject: 'English', averageScore: 74, completionRate: 90, students: 32 },
      { subject: 'Hindi', averageScore: 80, completionRate: 85, students: 30 }
    ],
    classPerformance: [
      { class: 'Class 9', averageScore: 75, completionRate: 88, students: 40 },
      { class: 'Class 10', averageScore: 81, completionRate: 95, students: 35 },
      { class: 'Class 11', averageScore: 78, completionRate: 90, students: 25 },
      { class: 'Class 12', averageScore: 79, completionRate: 92, students: 20 }
    ],
    recentActivity: [
      { action: 'Test Completed', student: 'Arjun Sharma', subject: 'Mathematics', time: '2 hours ago', score: 85 },
      { action: 'Module Completed', student: 'Priya Verma', subject: 'Science', time: '3 hours ago', score: 92 },
      { action: 'Assignment Submitted', student: 'Rohan Kapoor', subject: 'English', time: '4 hours ago', score: 78 },
      { action: 'Test Completed', student: 'Anika Singh', subject: 'Hindi', time: '5 hours ago', score: 88 },
      { action: 'Module Completed', student: 'Vikram Patel', subject: 'Mathematics', time: '6 hours ago', score: 76 }
    ]
  };

  // Reports tab data - Chapter-wise student proficiency
  const reportsData = {
    summary: {
      totalStudents: 120,
      completionRate: 85,
      averageScore: 72
    },
    chapterProficiency: [
      { id: 1, chapterName: 'Introduction to Algebra', proficient: 45, satisfactory: 35, needsImprovement: 20 },
      { id: 2, chapterName: 'Linear Equations', proficient: 38, satisfactory: 40, needsImprovement: 22 },
      { id: 3, chapterName: 'Quadratic Equations', proficient: 32, satisfactory: 38, needsImprovement: 30 },
      { id: 4, chapterName: 'Polynomials', proficient: 42, satisfactory: 33, needsImprovement: 25 },
      { id: 5, chapterName: 'Trigonometry Basics', proficient: 28, satisfactory: 42, needsImprovement: 30 },
      { id: 6, chapterName: 'Coordinate Geometry', proficient: 35, satisfactory: 40, needsImprovement: 25 },
      { id: 7, chapterName: 'Statistics', proficient: 50, satisfactory: 32, needsImprovement: 18 },
      { id: 8, chapterName: 'Probability', proficient: 40, satisfactory: 38, needsImprovement: 22 }
    ]
  };

  // Filter options for Reports tab
  const filterOptions = {
    classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'],
    modules: ['Module 1: Basics', 'Module 2: Intermediate', 'Module 3: Advanced', 'Module 4: Expert'],
    chapters: ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5']
  };

  // Student proficiency data (shown after Apply)
  const studentProficiencyData = [
    { id: 1, name: 'Arjun Sharma', proficient: 92 },
    { id: 2, name: 'Priya Verma', proficient: 88 },
    { id: 3, name: 'Rohan Kapoor', proficient: 85 },
    { id: 4, name: 'Anika Singh', proficient: 82 },
    { id: 5, name: 'Vikram Patel', proficient: 78 },
    { id: 6, name: 'Sneha Gupta', proficient: 75 },
    { id: 7, name: 'Rahul Mehra', proficient: 72 },
    { id: 8, name: 'Kavya Reddy', proficient: 68 },
    { id: 9, name: 'Amit Kumar', proficient: 65 },
    { id: 10, name: 'Neha Joshi', proficient: 60 }
  ];

  const handleApplyFilters = () => {
    setShowStudentTable(true);
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{animationDelay: '0.1s'}}>Comprehensive insights into student performance and learning patterns.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-300 ease-in-out hover:scale-105 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
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

      {/* Filters - Only show for Analytics tab */}
      {activeTab === 'analytics' && (
      <div className="mb-6 flex space-x-4">
        <div className="animate-slide-right" style={{animationDelay: '0.2s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
          >
            <option>All Classes</option>
            <option>Class 9</option>
            <option>Class 10</option>
            <option>Class 11</option>
            <option>Class 12</option>
          </select>
        </div>
      </div>
      )}

      {/* Analytics Tab Content */}
      {activeTab === 'analytics' && (
        <>
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2 animate-count-up">{analyticsData.overallStats.totalStudents}</div>
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
        {/* Subject Performance */}
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
                      className="bg-blue-500 h-2 rounded-full"
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

        {/* Class Performance */}
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

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {analyticsData.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">
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

      {/* Reports Tab Content */}
      {activeTab === 'reports' && (
        <>
          {/* Summary Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{reportsData.summary.totalStudents}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
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

          {/* Chapter Proficiency Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Chapter-wise Student Proficiency</h3>
              <p className="text-sm text-gray-500 mt-1">Performance breakdown by chapter</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chapter Name</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Proficient Students %
                      </span>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Satisfactory Students %
                      </span>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Needs Improvement %
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportsData.chapterProficiency.map((chapter, index) => (
                    <tr 
                      key={chapter.id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                      style={{ animationDelay: `${(index + 5) * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{chapter.chapterName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${chapter.proficient}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-green-600">{chapter.proficient}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${chapter.satisfactory}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-yellow-600">{chapter.satisfactory}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${chapter.needsImprovement}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-red-600">{chapter.needsImprovement}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Filter Section with Unique UI */}
          <div className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 shadow-sm animate-slide-up" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center mb-6">
              <Search className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Filter Student Performance</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Class Dropdown */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Class</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-blue-100 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                  </div>
                  <select
                    value={reportClass}
                    onChange={(e) => setReportClass(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 hover:border-blue-300"
                  >
                    <option value="">Select Class</option>
                    {filterOptions.classes.map((cls, idx) => (
                      <option key={idx} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Subject Dropdown */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-green-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </div>
                  <select
                    value={reportSubject}
                    onChange={(e) => setReportSubject(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 hover:border-green-300"
                  >
                    <option value="">Select Subject</option>
                    {filterOptions.subjects.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Module Dropdown */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Module</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-purple-100 rounded-lg">
                    <Layers className="h-4 w-4 text-purple-600" />
                  </div>
                  <select
                    value={reportModule}
                    onChange={(e) => setReportModule(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-purple-300"
                  >
                    <option value="">Select Module</option>
                    {filterOptions.modules.map((mod, idx) => (
                      <option key={idx} value={mod}>{mod}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Chapter Dropdown */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chapter</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-orange-100 rounded-lg">
                    <FileText className="h-4 w-4 text-orange-600" />
                  </div>
                  <select
                    value={reportChapter}
                    onChange={(e) => setReportChapter(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 hover:border-orange-300"
                  >
                    <option value="">Select Chapter</option>
                    {filterOptions.chapters.map((chap, idx) => (
                      <option key={idx} value={chap}>{chap}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-center">
              <button
                onClick={handleApplyFilters}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 focus:ring-4 focus:ring-blue-200"
              >
                Apply Filters
        </button>
      </div>
          </div>

          {/* Student Proficiency Table (shown after Apply) */}
          {showStudentTable && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                <h3 className="text-lg font-semibold text-gray-800">Student Proficiency Results</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Showing results for: {reportClass || 'All Classes'} • {reportSubject || 'All Subjects'} • {reportModule || 'All Modules'} • {reportChapter || 'All Chapters'}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S.No</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Proficient %
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentProficiencyData.map((student, index) => (
                      <tr 
                        key={student.id} 
                        className="hover:bg-blue-50 transition-colors duration-150"
                        style={{ animation: 'fadeInUp 0.3s ease-out forwards', animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold mr-3">
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
    </div>
  );
};

export default ReportsAnalytics;
