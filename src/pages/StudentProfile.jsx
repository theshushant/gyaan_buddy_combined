import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, User, Calendar, Phone, Mail, BookOpen, TrendingUp, TrendingDown, Clock, MapPin, GraduationCap } from 'lucide-react'

const StudentProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Mock student data - in real app, this would come from API
  const studentData = {
    id: id || '1',
    firstName: 'Aarav',
    lastName: 'Sharma',
    rollNumber: '101',
    class: 'Class 10A',
    grade: '10',
    dateOfBirth: '2006-05-15',
    gender: 'Male',
    parentName: 'Priya Sharma',
    parentContact: 'priya.sharma@example.com',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    subjects: ['Mathematics', 'Science', 'English', 'History'],
    overallScore: 85,
    averageGrade: 'B+',
    attendance: 92,
    weakTopics: ['Algebra', 'Thermodynamics', 'Organic Chemistry', 'Trigonometry', 'Cell Biology'],
    progressTrends: {
      math: { score: 88, change: 5, period: 'Last 3 Months' },
      science: { score: 76, change: -3, period: 'Last 3 Months' }
    },
    recentTests: [
      { name: 'Algebra Chapter 5', date: '2024-03-15', score: 75, status: 'Completed' },
      { name: 'Physics: Motion', date: '2024-03-20', score: 60, status: 'Completed' },
      { name: 'English Grammar', date: '2024-03-25', score: 80, status: 'Completed' }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/students')}
                className="flex items-center text-gray-600 hover:text-gray-800 hover:scale-105 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Students
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{studentData.firstName} {studentData.lastName}</h1>
                <p className="text-gray-600">Roll No: {studentData.rollNumber} • Class: {studentData.class}</p>
              </div>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200">
              <Edit className="h-4 w-4 mr-2" />
              Edit Information
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
              <div className="flex flex-col items-center text-center">
                <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
                  <User className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{studentData.firstName} {studentData.lastName}</h3>
                <p className="text-gray-600 mb-1">Roll No: {studentData.rollNumber}</p>
                <p className="text-gray-600 mb-4">Class: {studentData.class}</p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 w-full mt-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 hover:scale-105 transition-all duration-200">
                    <p className="text-2xl font-bold text-blue-600 animate-pulse">{studentData.overallScore}%</p>
                    <p className="text-xs text-gray-600">Overall Score</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg hover:bg-green-100 hover:scale-105 transition-all duration-200">
                    <p className="text-2xl font-bold text-green-600 animate-pulse">{studentData.averageGrade}</p>
                    <p className="text-xs text-gray-600">Average Grade</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 hover:scale-105 transition-all duration-200">
                    <p className="text-2xl font-bold text-purple-600 animate-pulse">{studentData.attendance}%</p>
                    <p className="text-xs text-gray-600">Attendance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ease-in-out">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors duration-200">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium text-gray-900">{studentData.dateOfBirth}</p>
                    </div>
                  </div>
                  <div className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors duration-200">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900">{studentData.gender}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors duration-200">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Parent/Guardian</p>
                      <p className="font-medium text-gray-900">{studentData.parentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors duration-200">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium text-gray-900">{studentData.parentContact}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weak Topics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Weak Topics</h3>
              <div className="flex flex-wrap gap-3">
                {studentData.weakTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-red-100 text-red-800 text-sm rounded-full font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress Trends */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Progress Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">Math</p>
                      <p className="text-sm text-gray-600">{studentData.progressTrends.math.period}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{studentData.progressTrends.math.score}%</p>
                      <div className="flex items-center">
                        {studentData.progressTrends.math.change > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${studentData.progressTrends.math.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {studentData.progressTrends.math.change > 0 ? '+' : ''}{studentData.progressTrends.math.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">Science</p>
                      <p className="text-sm text-gray-600">{studentData.progressTrends.science.period}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{studentData.progressTrends.science.score}%</p>
                      <div className="flex items-center">
                        {studentData.progressTrends.science.change > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${studentData.progressTrends.science.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {studentData.progressTrends.science.change > 0 ? '+' : ''}{studentData.progressTrends.science.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Test Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Recent Test Reports</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentData.recentTests.map((test, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{test.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{test.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            test.score >= 80 ? 'text-green-600' : 
                            test.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {test.score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {test.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile