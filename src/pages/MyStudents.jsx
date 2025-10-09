import React, { useState } from 'react';

const MyStudents = () => {
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [searchTerm, setSearchTerm] = useState('');

  const students = [
    {
      id: 1,
      name: "Arjun Sharma",
      class: "Class 10A",
      email: "arjun.sharma@school.com",
      phone: "+91 98765 43210",
      lastActive: "2 hours ago",
      totalXP: 1500,
      averageScore: 85,
      completedModules: 12,
      pendingAssignments: 3
    },
    {
      id: 2,
      name: "Priya Verma",
      class: "Class 10B",
      email: "priya.verma@school.com",
      phone: "+91 98765 43211",
      lastActive: "1 hour ago",
      totalXP: 1450,
      averageScore: 88,
      completedModules: 11,
      pendingAssignments: 2
    },
    {
      id: 3,
      name: "Rohan Kapoor",
      class: "Class 9A",
      email: "rohan.kapoor@school.com",
      phone: "+91 98765 43212",
      lastActive: "3 hours ago",
      totalXP: 1400,
      averageScore: 82,
      completedModules: 10,
      pendingAssignments: 4
    },
    {
      id: 4,
      name: "Anika Singh",
      class: "Class 9B",
      email: "anika.singh@school.com",
      phone: "+91 98765 43213",
      lastActive: "5 hours ago",
      totalXP: 1350,
      averageScore: 79,
      completedModules: 9,
      pendingAssignments: 5
    },
    {
      id: 5,
      name: "Vikram Patel",
      class: "Class 10A",
      email: "vikram.patel@school.com",
      phone: "+91 98765 43214",
      lastActive: "1 day ago",
      totalXP: 1300,
      averageScore: 76,
      completedModules: 8,
      pendingAssignments: 6
    }
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All Classes' || student.class.includes(selectedClass);
    return matchesSearch && matchesClass;
  });

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">My Students</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{animationDelay: '0.1s'}}>Manage and track your students' progress and performance.</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 animate-slide-right" style={{animationDelay: '0.2s'}}>
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
          />
        </div>
        
        <div className="animate-slide-right" style={{animationDelay: '0.3s'}}>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2 animate-count-up">{students.length}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.5s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2 animate-count-up">
              {students.filter(s => s.lastActive.includes('hour')).length}
            </div>
            <div className="text-sm text-gray-600">Active Today</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2 animate-count-up">
              {students.reduce((sum, s) => sum + s.pendingAssignments, 0)}
            </div>
            <div className="text-sm text-gray-600">Pending Assignments</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.7s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2 animate-count-up">
              {Math.round(students.reduce((sum, s) => sum + s.averageScore, 0) / students.length)}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform hover:shadow-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.8s'}}>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                XP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student, index) => (
              <tr 
                key={student.id}
                className="transform hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 animate-slide-up"
                style={{animationDelay: `${0.9 + index * 0.05}s`}}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center transform transition-all duration-200 hover:scale-110">
                        <span className="text-sm font-medium text-blue-600">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.class}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.lastActive}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="animate-count-up">{student.totalXP}</span> XP
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full transform transition-all duration-200 hover:scale-110 ${
                    student.averageScore >= 80 ? 'bg-green-100 text-green-800' :
                    student.averageScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.averageScore}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>{student.completedModules} modules</span>
                    {student.pendingAssignments > 0 && (
                      <span className="text-red-600">({student.pendingAssignments} pending)</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 transform transition-all duration-200 hover:scale-105">View</button>
                    <button className="text-green-600 hover:text-green-900 transform transition-all duration-200 hover:scale-105">Message</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 animate-slide-up" style={{animationDelay: '1s'}}>
          <div className="text-gray-500 text-lg">No students found matching your criteria.</div>
        </div>
      )}
    </div>
  );
};

export default MyStudents;
