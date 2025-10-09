import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TestsQuizzes = () => {
  const [activeTab, setActiveTab] = useState('tests');

  const tests = [
    {
      id: 1,
      title: "Vedic Ganit Championship",
      class: "Class 10",
      subject: "Ganit",
      createdDate: "July 26, 2024",
      attempts: 28,
      averageScore: 82.5,
      highestScore: 98,
      lowestScore: 65
    },
    {
      id: 2,
      title: "Chapter 5: Algebra Basics",
      class: "Class 9",
      subject: "Mathematics",
      createdDate: "July 25, 2024",
      attempts: 15,
      averageScore: 75.2,
      highestScore: 95,
      lowestScore: 45
    }
  ];

  const students = [
    { name: "Priya Sharma", score: 98, time: "12:34" },
    { name: "Rohan Gupta", score: 95, time: "15:02" },
    { name: "Ananya Joshi", score: 88, time: "14:21" },
    { name: "Arjun Kumar", score: 75, time: "18:55" },
    { name: "Sneha Patel", score: 65, time: "19:10" }
  ];

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Tests & Quizzes</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'tests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Tests
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create New Test
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'tests' && (
        <div className="space-y-6">
          {tests.map((test, index) => (
            <div 
              key={test.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up"
              style={{animationDelay: `${0.1 + index * 0.1}s`}}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{test.title}</h3>
                  <p className="text-gray-600">{test.class} / {test.subject} | Created on: {test.createdDate}</p>
                </div>
                <Link 
                  to="/tests/performance/priya-sharma"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="transform transition-transform duration-200 hover:rotate-12">📊</span>
                  <span>View Results</span>
                </Link>
              </div>

              {/* Test Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center transform hover:scale-105 transition-all duration-300 animate-count-up" style={{animationDelay: '0.2s'}}>
                  <div className="text-2xl font-bold text-blue-600">{test.averageScore}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center transform hover:scale-105 transition-all duration-300 animate-count-up" style={{animationDelay: '0.3s'}}>
                  <div className="text-2xl font-bold text-green-600">{test.highestScore}%</div>
                  <div className="text-sm text-gray-600">Highest Score</div>
                </div>
                <div className="text-center transform hover:scale-105 transition-all duration-300 animate-count-up" style={{animationDelay: '0.4s'}}>
                  <div className="text-2xl font-bold text-red-600">{test.lowestScore}%</div>
                  <div className="text-sm text-gray-600">Lowest Score</div>
                </div>
                <div className="text-center transform hover:scale-105 transition-all duration-300 animate-count-up" style={{animationDelay: '0.5s'}}>
                  <div className="text-2xl font-bold text-gray-800">{test.attempts}</div>
                  <div className="text-sm text-gray-600">Attempts</div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.6s'}}>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600 transform transition-transform duration-200 hover:rotate-12">✨</span>
                  <span className="text-sm font-medium text-yellow-800">
                    AI Analysis: Common weak area: Questions on Sutra application.
                  </span>
                </div>
              </div>

              {/* Student Attempts */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Student Attempts</h4>
                <div className="flex space-x-4 mb-4">
                  <input
                    type="text"
                    placeholder="Search student.."
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Sort by Score (High-Low)</option>
                    <option>Sort by Score (Low-High)</option>
                    <option>Sort by Time</option>
                  </select>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time Taken
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              student.score >= 90 ? 'bg-green-100 text-green-800' :
                              student.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {student.score}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            <Link to="/tests/performance/priya-sharma" className="hover:text-blue-800">
                              View Performance →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Test</h2>
            <p className="text-gray-600">Enter the basic details for your new test.</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Title</label>
              <input
                type="text"
                placeholder="e.g., 'Modern Physics - Chapter 1 Test'"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Select Subject</option>
                <option>Mathematics</option>
                <option>Science</option>
                <option>English</option>
                <option>History</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class(es) to Assign</label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
                <label className="flex items-center space-x-2 mb-2">
                  <input type="checkbox" className="rounded" />
                  <span>Class 9 - Section A</span>
                </label>
                <label className="flex items-center space-x-2 mb-2">
                  <input type="checkbox" className="rounded" />
                  <span>Class 9 - Section B</span>
                </label>
                <label className="flex items-center space-x-2 mb-2">
                  <input type="checkbox" className="rounded" />
                  <span>Class 10 - Section A</span>
                </label>
                <label className="flex items-center space-x-2 mb-2">
                  <input type="checkbox" className="rounded" />
                  <span>Class 10 - Section B</span>
                </label>
                <label className="flex items-center space-x-2 mb-2">
                  <input type="checkbox" className="rounded" />
                  <span>Class 11 - Science</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Class 12 - Commerce</span>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">Hold Ctrl/Cmd to select multiple classes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Time</label>
                <input
                  type="time"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (in minutes)</label>
              <input
                type="number"
                placeholder="e.g., 60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="notification" className="rounded" />
              <label htmlFor="notification" className="text-sm text-gray-700">
                30-minute prior auto-notification to students
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Link
                to="/tests/generate"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <span>→</span>
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TestsQuizzes;
