import React, { useState } from 'react';

const Leaderboards = () => {
  const [activeTab, setActiveTab] = useState('xp');

  const students = [
    { rank: 1, name: "Aarav Sharma", class: "Kaksha 9A", xp: 1250, averageScore: 92, trophy: "🥇" },
    { rank: 2, name: "Diya Patel", class: "Kaksha 9B", xp: 1180, averageScore: 88, trophy: "🥈" },
    { rank: 3, name: "Rohan Verma", class: "Kaksha 9A", xp: 1120, averageScore: 85, trophy: "🥉" },
    { rank: 4, name: "Ishaan Kapoor", class: "Kaksha 9C", xp: 1050, averageScore: 82, trophy: "" },
    { rank: 5, name: "Siya Singh", class: "Kaksha 9B", xp: 980, averageScore: 79, trophy: "" },
    { rank: 6, name: "Ananya Joshi", class: "Kaksha 9A", xp: 955, averageScore: 78, trophy: "" },
    { rank: 7, name: "Kabir Mehra", class: "Kaksha 9C", xp: 920, averageScore: 75, trophy: "" },
    { rank: 8, name: "Priya Gupta", class: "Kaksha 9B", xp: 910, averageScore: 74, trophy: "" }
  ];

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Leaderboards</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <div className="animate-slide-right" style={{animationDelay: '0.1s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105">
            <option>Ganit (Mathematics)</option>
            <option>Vigyan (Science)</option>
            <option>Hindi</option>
            <option>English</option>
          </select>
        </div>
        
        <div className="animate-slide-right" style={{animationDelay: '0.2s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105">
            <option>Kaksha 9 (Class 9)</option>
            <option>Kaksha 10 (Class 10)</option>
            <option>Kaksha 8 (Class 8)</option>
          </select>
        </div>
      </div>

      {/* Scope Toggle */}
      <div className="mb-6 animate-slide-right" style={{animationDelay: '0.3s'}}>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Scope:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button className="px-4 py-2 text-sm font-medium text-gray-500 rounded-md transform transition-all duration-200 hover:scale-105">
              Class-specific
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
              Grade-wide
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('xp')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'xp'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              By XP
            </button>
            <button
              onClick={() => setActiveTab('mastery')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'mastery'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              By Mastery
            </button>
          </nav>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform hover:shadow-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.4s'}}>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current XP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student, index) => (
              <tr 
                key={student.rank} 
                className={`transform hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 animate-slide-up ${
                  student.rank <= 3 ? 'bg-yellow-50' : ''
                }`}
                style={{animationDelay: `${0.5 + index * 0.05}s`}}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span className="animate-count-up">{student.rank}</span>
                    {student.trophy && <span className="text-lg transform transition-transform duration-200 hover:scale-125 hover:rotate-12">{student.trophy}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.class}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="animate-count-up">{student.xp}</span> XP
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="animate-count-up">{student.averageScore}</span>%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Additional Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2 animate-count-up">1,250</div>
            <div className="text-sm text-gray-600">Highest XP</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.7s'}}>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2 animate-count-up">92%</div>
            <div className="text-sm text-gray-600">Best Average Score</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.8s'}}>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2 animate-count-up">8</div>
            <div className="text-sm text-gray-600">Active Students</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
