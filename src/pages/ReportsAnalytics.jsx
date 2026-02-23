import React, { useState } from 'react';
import { Users, TrendingUp, Target, ChevronDown, ChevronRight, GraduationCap, BookOpen, Layers, FileText, Search } from 'lucide-react';

const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [activeTab, setActiveTab] = useState('reports');
  
  const [reportClass, setReportClass] = useState('');
  const [reportSubject, setReportSubject] = useState('');
  const [reportModule, setReportModule] = useState('');
  const [reportChapter, setReportChapter] = useState('');
  const [showStudentTable, setShowStudentTable] = useState(false);
  const [expandedModules, setExpandedModules] = useState({ 1: true });

  const moduleProficiencyData = [
    {
      id: 1,
      moduleName: 'Number Systems',
      weakSubtopics: ['Number Line and Operations'],
      weakLevels: [1, 2, 3, 4, 5],
      chapters: [
        { name: 'Introduction to Number Systems', proficiency: 82, weakLevels: [] },
        { name: 'Rational Numbers', proficiency: 78, weakLevels: [] },
        { name: 'Irrational Numbers', proficiency: 65, weakLevels: [1, 2, 3] },
        { name: 'Real Numbers and Decimal Expansions', proficiency: 71, weakLevels: [1, 2] },
        { name: 'Laws of Exponents for Real Numbers', proficiency: 58, weakLevels: [1, 2, 3] },
        { name: 'Number Line and Operations', proficiency: 45, weakLevels: [1, 2, 3, 4, 5] },
        { name: 'Previous Knowledge Testing', proficiency: 88, weakLevels: [] },
      ],
    },
    {
      id: 2,
      moduleName: "Introduction to Euclid's Geometry",
      weakSubtopics: ['Theorems and Proofs'],
      weakLevels: [1, 2, 3, 4],
      chapters: [
        { name: "Euclid's Definitions", proficiency: 85, weakLevels: [] },
        { name: "Euclid's Axioms", proficiency: 79, weakLevels: [] },
        { name: "Euclid's Postulates", proficiency: 72, weakLevels: [1, 2] },
        { name: 'Equivalent Versions of Fifth Postulate', proficiency: 55, weakLevels: [1, 2, 3] },
        { name: 'Theorems and Proofs', proficiency: 48, weakLevels: [1, 2, 3, 4] },
        { name: 'Non-Euclidean Geometry Introduction', proficiency: 62, weakLevels: [1, 2] },
      ],
    },
    {
      id: 3,
      moduleName: 'Lines and Angles',
      weakSubtopics: [],
      weakLevels: [],
      chapters: [
        { name: 'Basic Terms and Definitions', proficiency: 90, weakLevels: [] },
        { name: 'Types of Angles', proficiency: 88, weakLevels: [] },
        { name: 'Pairs of Angles', proficiency: 82, weakLevels: [] },
        { name: 'Parallel Lines and Transversal', proficiency: 76, weakLevels: [] },
        { name: 'Angle Sum Property', proficiency: 71, weakLevels: [1, 2] },
        { name: 'Exterior Angle Theorem', proficiency: 65, weakLevels: [1, 2, 3] },
      ],
    },
    {
      id: 4,
      moduleName: 'Quadrilaterals',
      weakSubtopics: ['Mid-Point Theorem'],
      weakLevels: [1, 2, 3, 4],
      chapters: [
        { name: 'Types of Quadrilaterals', proficiency: 75, weakLevels: [] },
        { name: 'Properties of Parallelograms', proficiency: 68, weakLevels: [1, 2] },
        { name: 'Rectangles and Squares', proficiency: 79, weakLevels: [] },
        { name: 'Rhombus and Trapezium', proficiency: 55, weakLevels: [1, 2, 3] },
        { name: 'Mid-Point Theorem', proficiency: 42, weakLevels: [1, 2, 3, 4] },
        { name: 'Angle Sum Property', proficiency: 81, weakLevels: [] },
      ],
    },
    {
      id: 5,
      moduleName: 'Circles',
      weakSubtopics: ['Cyclic Quadrilaterals', 'Theorems on Circles'],
      weakLevels: [1, 2, 3, 4, 5],
      chapters: [
        { name: 'Basic Terms Related to Circles', proficiency: 88, weakLevels: [] },
        { name: 'Angle Subtended by a Chord', proficiency: 72, weakLevels: [1, 2] },
        { name: 'Perpendicular from Centre to Chord', proficiency: 65, weakLevels: [1, 2, 3] },
        { name: 'Cyclic Quadrilaterals', proficiency: 48, weakLevels: [1, 2, 3, 4] },
        { name: 'Tangent to a Circle', proficiency: 55, weakLevels: [1, 2, 3] },
        { name: 'Theorems on Circles', proficiency: 41, weakLevels: [1, 2, 3, 4, 5] },
      ],
    },
    {
      id: 6,
      moduleName: "Heron's Formula",
      weakSubtopics: [],
      weakLevels: [],
      chapters: [
        { name: "Introduction to Heron's Formula", proficiency: 92, weakLevels: [] },
        { name: 'Area of Triangle', proficiency: 87, weakLevels: [] },
        { name: 'Semi-Perimeter', proficiency: 83, weakLevels: [] },
        { name: 'Application to Scalene Triangles', proficiency: 76, weakLevels: [] },
        { name: 'Area of Quadrilaterals', proficiency: 68, weakLevels: [1, 2] },
        { name: 'Word Problems', proficiency: 58, weakLevels: [1, 2, 3] },
      ],
    },
    {
      id: 7,
      moduleName: 'Surface Areas and Volumes',
      weakSubtopics: ['Volume of Cone and Sphere'],
      weakLevels: [1, 2, 3, 4],
      chapters: [
        { name: 'Surface Area of Cuboid and Cube', proficiency: 82, weakLevels: [] },
        { name: 'Surface Area of Cylinder', proficiency: 74, weakLevels: [1, 2] },
        { name: 'Surface Area of Cone and Sphere', proficiency: 61, weakLevels: [1, 2] },
        { name: 'Volume of Cuboid and Cube', proficiency: 78, weakLevels: [] },
        { name: 'Volume of Cylinder', proficiency: 55, weakLevels: [1, 2, 3] },
        { name: 'Volume of Cone and Sphere', proficiency: 43, weakLevels: [1, 2, 3, 4] },
      ],
    },
    {
      id: 8,
      moduleName: 'Statistics',
      weakSubtopics: [],
      weakLevels: [],
      chapters: [
        { name: 'Collection of Data', proficiency: 91, weakLevels: [] },
        { name: 'Presentation of Data', proficiency: 85, weakLevels: [] },
        { name: 'Graphical Representation', proficiency: 78, weakLevels: [] },
        { name: 'Measures of Central Tendency', proficiency: 72, weakLevels: [1, 2] },
        { name: 'Mean of Grouped Data', proficiency: 64, weakLevels: [1, 2, 3] },
        { name: 'Median and Mode of Grouped Data', proficiency: 55, weakLevels: [1, 2, 3] },
      ],
    },
  ];

  const getModuleProficiency = (chapters) => {
    const avg = chapters.reduce((sum, ch) => sum + ch.proficiency, 0) / chapters.length;
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

  const filterOptions = {
    classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'],
    modules: ['Module 1: Basics', 'Module 2: Intermediate', 'Module 3: Advanced', 'Module 4: Expert'],
    chapters: ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5']
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{animationDelay: '0.1s'}}>Comprehensive insights into student performance and learning patterns.</p>
      </div>

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
            <option>Class 9</option>
            <option>Class 10</option>
            <option>Class 11</option>
            <option>Class 12</option>
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
                <h3 className="text-lg font-semibold text-gray-800">Module-wise Student Proficiency</h3>
                <p className="text-sm text-gray-500 mt-1">First-attempt accuracy by module and topic — click a module to expand chapters</p>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Topic-wise Student Proficiency</h3>
              <p className="text-sm text-gray-500 mt-1">Performance breakdown by topic</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Topic Name</th>
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

          <div className="mt-8 bg-gradient-to-r from-slate-50 to-primary-50 rounded-2xl p-6 border border-slate-200 shadow-sm animate-slide-up" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center mb-6">
              <Search className="h-5 w-5 text-primary-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Filter Student Performance</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="relative group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Class</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-primary-500/20 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-primary-500" />
                  </div>
                  <select
                    value={reportClass}
                    onChange={(e) => setReportClass(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 hover:border-primary-500/50"
                  >
                    <option value="">Select Class</option>
                    {filterOptions.classes.map((cls, idx) => (
                      <option key={idx} value={cls}>{cls}</option>
                    ))}
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

              <div className="relative group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Topic</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-orange-100 rounded-lg">
                    <FileText className="h-4 w-4 text-orange-600" />
                  </div>
                  <select
                    value={reportChapter}
                    onChange={(e) => setReportChapter(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-gray-700 font-medium appearance-none cursor-pointer focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 hover:border-orange-300"
                  >
                    <option value="">Select Topic</option>
                    {filterOptions.chapters.map((chap, idx) => (
                      <option key={idx} value={chap}>{chap}</option>
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
                  Showing results for: {reportClass || 'All Classes'} • {reportSubject || 'All Subjects'} • {reportModule || 'All Modules'} • {reportChapter || 'All Topics'}
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
    </div>
  );
};

export default ReportsAnalytics;
