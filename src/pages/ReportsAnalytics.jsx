import React, { useState } from 'react';

const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
  const [selectedClass, setSelectedClass] = useState('All Classes');

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

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{animationDelay: '0.1s'}}>Comprehensive insights into student performance and learning patterns.</p>
      </div>

      {/* Filters */}
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

      {/* Export Options */}
      <div className="mt-8 flex justify-end space-x-4">
        <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          Export PDF
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Export Excel
        </button>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
