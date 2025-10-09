import React from 'react';

const TeacherDashboard = () => {
  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Teacher Dashboard</h1>
      </div>

      {/* Class-wise quick stats */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700 animate-slide-right">Class-wise quick stats</h2>
          <button className="text-blue-600 hover:text-blue-800 font-medium transform hover:scale-105 transition-all duration-200">
            More &gt;
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2 animate-count-up">78%</div>
              <div className="text-gray-600">Average Score</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2 animate-count-up">92%</div>
              <div className="text-gray-600">Completion Rate</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2 animate-count-up">120</div>
              <div className="text-gray-600">Active Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts to most-used actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 animate-slide-right">Shortcuts to most-used actions</h2>
        
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
            <span className="text-xl transform transition-transform duration-200 hover:rotate-90">+</span>
            <span>Create Test</span>
          </button>
          
          <button className="bg-blue-50 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-100 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.5s'}}>
            <span className="text-xl transform transition-transform duration-200 hover:scale-110">📄</span>
            <span>Assign Module</span>
          </button>
          
          <button className="bg-blue-50 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-100 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
            <span className="text-xl transform transition-transform duration-200 hover:rotate-12">✏️</span>
            <span>Edit Learn Mode</span>
          </button>
        </div>
      </div>

      {/* Student XP/leaderboard highlights */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4 animate-slide-right">Student XP/leaderboard highlights</h2>
        
        <div className="flex space-x-4 mb-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105">
            <option>All Classes</option>
            <option>Class 9</option>
            <option>Class 10</option>
            <option>Class 11</option>
            <option>Class 12</option>
          </select>
          
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105">
            <option>All Subjects</option>
            <option>Mathematics</option>
            <option>Science</option>
            <option>English</option>
            <option>History</option>
          </select>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform hover:shadow-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.7s'}}>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leaderboard Rank
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { name: "Arjun Sharma", xp: "1500 XP", rank: "Rank 1" },
                { name: "Priya Verma", xp: "1450 XP", rank: "Rank 2" },
                { name: "Rohan Kapoor", xp: "1400 XP", rank: "Rank 3" },
                { name: "Anika Singh", xp: "1350 XP", rank: "Rank 4" },
                { name: "Vikram Patel", xp: "1300 XP", rank: "Rank 5" }
              ].map((student, index) => (
                <tr key={student.name} className="transform hover:bg-gray-50 transition-all duration-200 hover:translate-x-1" style={{animationDelay: `${0.8 + index * 0.1}s`}}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.xp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.rank}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
