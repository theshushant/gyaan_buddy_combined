import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Edit, User, Calendar, Phone, Mail, BookOpen, TrendingUp, TrendingDown, Clock, MapPin, GraduationCap } from 'lucide-react'
import { fetchStudentById, fetchStudentProgressTrends, updateStudent, clearError } from '../features/students/studentsSlice'
import AddStudentModal from '../components/AddStudentModal'
import SuccessModal from '../components/SuccessModal'

const StudentProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { currentStudent, loading, error, progressTrends } = useSelector(state => state.students)
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState({})
  
  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    const hasError = error.currentStudent !== null || error.progressTrends !== null
    if (hasError) {
      return // Don't retry if there's already an error
    }

    if (id) {
      dispatch(fetchStudentById(id))
      dispatch(fetchStudentProgressTrends({ studentId: id }))
    }
  }, [id, dispatch, error.currentStudent, error.progressTrends])
  
  // Transform backend data to frontend format
  const transformStudentData = (student) => {
    if (!student) return null
    
    // Handle both backend format (snake_case) and frontend format (camelCase)
    const firstName = student.firstName || student.first_name || ''
    const lastName = student.lastName || student.last_name || ''
    const rollNumber = student.rollNumber || student.roll_number || student.profile?.roll_number || 'N/A'
    const classValue = student.class || student.class_name || student.profile?.class_instance?.name || 'N/A'
    const grade = student.grade || student.profile?.level?.name || 'N/A'
    const dateOfBirth = student.dateOfBirth || student.date_of_birth || student.profile?.date_of_birth || 'N/A'
    const email = student.email || ''
    const phone = student.phone_number || student.phone || ''
    const parentName = student.parent_name || student.parentName || student.profile?.parent_name || 'N/A'
    const parentContact = email || phone || 'N/A'
    
    // Calculate grade from score if available
    const overallScore = student.overallScore || student.average_score || 0
    let averageGrade = 'N/A'
    if (overallScore >= 90) averageGrade = 'A+'
    else if (overallScore >= 80) averageGrade = 'A'
    else if (overallScore >= 70) averageGrade = 'B+'
    else if (overallScore >= 60) averageGrade = 'B'
    else if (overallScore >= 50) averageGrade = 'C'
    else if (overallScore > 0) averageGrade = 'F'
    
    return {
      id: student.id || id,
      firstName,
      lastName,
      rollNumber,
      class: classValue,
      class_id: student.class_id || student.class_instance || student.profile?.class_instance?.id || null,
      grade,
      dateOfBirth,
      email,
      phone,
      parentName,
      parentContact,
      subjects: student.subjects || [],
      subject_ids: student.subjects?.map(s => s.id || s) || [],
      overallScore,
      averageGrade,
      attendance: student.attendance || 0,
      weakTopics: student.weakTopics || [],
      recentTests: student.recentTests || []
    }
  }
  
  // Get progress trends from Redux state or use empty object
  const studentProgressTrends = progressTrends[id] || {}
  
  // Transform progress trends data from API response
  // API might return progressTrends object or array of subject trends
  const getProgressTrendsData = () => {
    if (!studentProgressTrends || Object.keys(studentProgressTrends).length === 0) {
      return {}
    }
    
    // Handle different API response formats
    if (studentProgressTrends.progressTrends) {
      return studentProgressTrends.progressTrends
    } else if (studentProgressTrends.subjects) {
      // Convert array format to object format
      const trendsObj = {}
      studentProgressTrends.subjects.forEach(subject => {
        trendsObj[subject.name?.toLowerCase() || subject.subject?.toLowerCase()] = {
          score: subject.score || subject.currentScore || 0,
          change: subject.change || subject.scoreChange || 0,
          period: subject.period || 'Last 3 Months'
        }
      })
      return trendsObj
    } else if (Array.isArray(studentProgressTrends)) {
      // Handle array of trend objects
      const trendsObj = {}
      studentProgressTrends.forEach(trend => {
        const subjectName = (trend.subject || trend.name || 'unknown').toLowerCase()
        trendsObj[subjectName] = {
          score: trend.score || trend.currentScore || 0,
          change: trend.change || trend.scoreChange || 0,
          period: trend.period || 'Last 3 Months'
        }
      })
      return trendsObj
    }
    
    // If it's already in the expected format, return as is
    return studentProgressTrends
  }
  
  const progressTrendsData = getProgressTrendsData()
  
  const studentData = transformStudentData(currentStudent) || {
    id: id || '1',
    firstName: '',
    lastName: '',
    rollNumber: 'N/A',
    class: 'N/A',
    grade: 'N/A',
    dateOfBirth: 'N/A',
    gender: 'N/A',
    parentContact: 'N/A',
    subjects: [],
    overallScore: 0,
    averageGrade: 'N/A',
    attendance: 0,
    weakTopics: [],
    recentTests: []
  }
  
  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleUpdateStudent = async (studentData) => {
    try {
      await dispatch(updateStudent({ studentId: id, studentData })).unwrap()
      setShowEditModal(false)
      // Refresh student data after update
      await dispatch(fetchStudentById(id))
      
      // Get student name from form data or current student as fallback
      const firstName = studentData.firstName || currentStudent?.firstName || currentStudent?.first_name || ''
      const lastName = studentData.lastName || currentStudent?.lastName || currentStudent?.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim() || 'Student'
      
      setSuccessData({
        title: 'Student Updated Successfully',
        message: `${fullName} has been updated.`
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error updating student:', error)
      // Error is handled by Redux, modal will stay open
    }
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    dispatch(clearError('update'))
  }
  
  if (loading.currentStudent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (error.currentStudent) {
    return (
      <div className="min-h-screen bg-gray-50bg-gray-900 flex items-center justify-center">
        <div className="bg-red-50bg-red-900/20 border border-red-200border-red-800 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800text-red-400 font-semibold text-xl mb-2">Error Loading Student</h2>
          <p className="text-red-600text-red-400">{error.currentStudent}</p>
          <button
            onClick={() => navigate('/students')}
            className="mt-4 px-4 py-2 bg-red-600bg-red-700 text-white rounded hover:bg-red-700hover:bg-red-600 transition-colors"
          >
            Back to Students
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900text-white">{studentData.firstName} {studentData.lastName}</h1>
              <p className="text-gray-600text-gray-300">Roll No: {studentData.rollNumber} • Class: {studentData.class}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600bg-blue-700 text-white rounded-lg hover:bg-blue-700hover:bg-blue-600 hover:scale-105 transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Information
              </button>
              <button
                onClick={() => navigate('/students')}
                className="px-4 py-2 border border-gray-300border-gray-600 text-gray-700text-gray-300 rounded-lg hover:bg-gray-50hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-whitebg-gray-800 rounded-xl shadow-sm border border-gray-200border-gray-700 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
              <div className="flex flex-col items-center text-center">
                <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
                  <User className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900text-white mb-2">{studentData.firstName} {studentData.lastName}</h3>
                <p className="text-gray-600text-gray-300 mb-1">Roll No: {studentData.rollNumber}</p>
                <p className="text-gray-600text-gray-300 mb-4">{studentData.class}</p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 w-full mt-6">
                  <div className="text-center p-3 bg-blue-50bg-blue-900/50 rounded-lg hover:bg-blue-100hover:bg-blue-900/70 hover:scale-105 transition-all duration-200">
                    <p className="text-2xl font-bold text-blue-600text-blue-400 animate-pulse">{studentData.overallScore}%</p>
                    <p className="text-xs text-gray-600text-gray-300">Overall Score</p>
                  </div>
                  <div className="text-center p-3 bg-green-50bg-green-900/50 rounded-lg hover:bg-green-100hover:bg-green-900/70 hover:scale-105 transition-all duration-200">
                    <p className="text-2xl font-bold text-green-600text-green-400 animate-pulse">{studentData.averageGrade}</p>
                    <p className="text-xs text-gray-600text-gray-300">Average Grade</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50bg-purple-900/50 rounded-lg hover:bg-purple-100hover:bg-purple-900/70 hover:scale-105 transition-all duration-200">
                    <p className="text-2xl font-bold text-purple-600text-purple-400 animate-pulse">{studentData.attendance}%</p>
                    <p className="text-xs text-gray-600text-gray-300">Attendance</p>
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
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{studentData.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors duration-200">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{studentData.phone || 'N/A'}</p>
                    </div>
                  </div>
                  {studentData.parentName && studentData.parentName !== 'N/A' && (
                    <div className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors duration-200">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Parent/Guardian Name</p>
                        <p className="font-medium text-gray-900">{studentData.parentName}</p>
                      </div>
                    </div>
                  )}
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
              {loading.progressTrends ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : Object.keys(progressTrendsData).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No progress trends available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(progressTrendsData).map(([subjectName, trend]) => {
                    // Capitalize first letter of subject name
                    const displayName = subjectName.charAt(0).toUpperCase() + subjectName.slice(1).replace(/_/g, ' ')
                    const trendData = trend || {}
                    const score = trendData.score || 0
                    const change = trendData.change || 0
                    const period = trendData.period || 'Last 3 Months'
                    
                    return (
                      <div key={subjectName} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{displayName}</p>
                            <p className="text-sm text-gray-600">{period}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{score}%</p>
                            <div className="flex items-center">
                              {change > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                              ) : change < 0 ? (
                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                              ) : null}
                              {change !== 0 && (
                                <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {change > 0 ? '+' : ''}{change}%
                                </span>
                              )}
                              {change === 0 && (
                                <span className="text-sm font-medium text-gray-500">No change</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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

      {/* Edit Student Modal */}
      {showEditModal && (
        <AddStudentModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleUpdateStudent}
          loading={loading.update}
          error={error.update}
          student={currentStudent}
          title="Edit Student Information"
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title={successData.title}
          message={successData.message}
        />
      )}
    </div>
  )
}

export default StudentProfile