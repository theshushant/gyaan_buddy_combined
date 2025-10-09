import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, User, Mail, BookOpen, Clock, TrendingUp, Award, Users, Calendar, MapPin, GraduationCap } from 'lucide-react'

const TeacherProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Mock teacher data - in real app, this would come from API
  const teacherData = {
    id: id || '1',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'p.sharma@school.edu',
    employeeId: '12345',
    subjects: ['Mathematics', 'Physics'],
    classes: [
      { class: 'Class 10', subject: 'Mathematics', role: 'Subject Teacher' },
      { class: 'Class 11', subject: 'Physics', role: 'Subject Teacher' },
      { class: 'Class 12', subject: 'Chemistry', role: 'Subject Teacher' },
      { class: 'Class 9', subject: 'Science', role: 'Class Teacher' }
    ],
    activityInsights: {
      dashboardUsage: '15 hours/week',
      contentCreation: '20 items/month'
    },
    studentPerformance: {
      averageScore: 75,
      improvement: 5,
      period: 'vs. last semester'
    },
    profileImage: null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/teachers')}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teachers
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{teacherData.firstName} {teacherData.lastName}</h1>
                <p className="text-gray-600">View and manage teacher details and performance.</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Teacher Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-32 w-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <User className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{teacherData.firstName} {teacherData.lastName}</h3>
              <p className="text-gray-600 mb-1">{teacherData.email}</p>
              <p className="text-gray-600 mb-4">Employee ID: {teacherData.employeeId}</p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{teacherData.studentPerformance.averageScore}%</p>
                  <p className="text-xs text-gray-600">Avg Score</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">+{teacherData.studentPerformance.improvement}%</p>
                  <p className="text-xs text-gray-600">Improvement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Classes & Subjects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Classes & Subjects</h3>
            <div className="space-y-4">
              {teacherData.classes.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{assignment.class} - {assignment.subject}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    assignment.role === 'Class Teacher' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {assignment.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Activity Insights</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-gray-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-600">Dashboard Usage</p>
                  <p className="font-medium text-gray-900">{teacherData.activityInsights.dashboardUsage}</p>
                </div>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-gray-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-600">Content Creation</p>
                  <p className="font-medium text-gray-900">{teacherData.activityInsights.contentCreation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Student Performance</h3>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Average Student Score</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{teacherData.studentPerformance.averageScore}%</p>
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">
                  +{teacherData.studentPerformance.improvement}% {teacherData.studentPerformance.period}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Class 10</span>
                  <span>Class 11</span>
                  <span>Class 12</span>
                  <span>Class 9</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Teaching Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Teaching Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Monday - Mathematics</p>
                  <p className="text-sm text-gray-600">Class 10A, 10B</p>
                </div>
                <span className="text-sm text-gray-600">9:00 AM - 12:00 PM</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Tuesday - Physics</p>
                  <p className="text-sm text-gray-600">Class 11A, 11B</p>
                </div>
                <span className="text-sm text-gray-600">10:00 AM - 1:00 PM</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Wednesday - Chemistry</p>
                  <p className="text-sm text-gray-600">Class 12A, 12B</p>
                </div>
                <span className="text-sm text-gray-600">11:00 AM - 2:00 PM</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Thursday - Science</p>
                  <p className="text-sm text-gray-600">Class 9A, 9B</p>
                </div>
                <span className="text-sm text-gray-600">8:00 AM - 11:00 AM</span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-3 w-3 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Created new assignment</p>
                  <p className="text-xs text-gray-600">Mathematics - Class 10A</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-3 w-3 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Graded test papers</p>
                  <p className="text-xs text-gray-600">Physics - Class 11B</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-3 w-3 bg-yellow-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Updated student progress</p>
                  <p className="text-xs text-gray-600">Chemistry - Class 12A</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-3 w-3 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Attended faculty meeting</p>
                  <p className="text-xs text-gray-600">General</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherProfile