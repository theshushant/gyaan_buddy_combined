import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Edit, User, BookOpen, Clock, TrendingUp } from 'lucide-react'
import { fetchTeacherById, fetchTeacherClasses, fetchTeacherPerformance, updateTeacher } from '../features/teachers/teachersSlice'
import teachersService from '../services/teachersService'
import AddTeacherModal from '../components/AddTeacherModal'
import SuccessModal from '../components/SuccessModal'

const TeacherProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, role } = useSelector(state => state.auth)
  const { currentTeacher, classes, performance, loading, error } = useSelector(state => state.teachers)
  const [activityInsights, setActivityInsights] = useState({ dashboardUsage: '0 hours/week', contentCreation: '0 items/month' })
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState({})
  
  // Determine teacher ID - use current user's ID if viewing own profile or no ID param
  const teacherId = id === 'me' || !id ? user?.id : id
  const isOwnProfile = role === 'teacher' && (id === 'me' || !id || id === user?.id?.toString())
  
  useEffect(() => {
    if (teacherId) {
      dispatch(fetchTeacherById(teacherId))
      // dispatch(fetchTeacherClasses(teacherId))
      dispatch(fetchTeacherPerformance(teacherId))
      
      // Fetch dashboard usage separately
      teachersService.getTeacherDashboardUsage(teacherId)
        .then(response => {
          // Handle response format - could be direct data or wrapped in data property
          const data = response.data || response
          if (data) {
            setActivityInsights({
              dashboardUsage: data.dashboardUsage || data.dashboard_usage || `${data.hours_per_week || 0} hours/week`,
              contentCreation: data.contentCreation || data.content_creation || `${data.items_per_month || 0} items/month`
            })
          }
        })
        .catch(err => {
          console.error('Error fetching dashboard usage:', err)
          // Keep default values on error
        })
    }
  }, [dispatch, teacherId])
  
  // Use fetched teacher data or fallback to current user data
  const teacherData = currentTeacher || (isOwnProfile && user ? {
    id: user.id,
    firstName: user.firstName || user.first_name || '',
    lastName: user.lastName || user.last_name || '',
    email: user.email || '',
    employeeId: user.employeeId || user.employee_id || '',
    subjects: user.subjects || [],
    classes: [],
  } : null)
  
  if (loading.currentTeacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (error.currentTeacher) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold">Error Loading Teacher Profile</h2>
        <p className="text-red-600 mt-2">{error.currentTeacher}</p>
      </div>
    )
  }
  
  if (!teacherData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No teacher data found.</p>
      </div>
    )
  }
  
  // Get performance data from Redux state
  const performanceData = performance[teacherId] || {}
  const performanceDataResponse = performanceData.data || performanceData
  
  // Process classes data - handle different API response formats
  let processedClasses = []
  const classesData = classes[teacherId]
  
  if (Array.isArray(classesData)) {
    processedClasses = classesData.map(cls => {
      // Handle API response format - could be direct class object or wrapped
      const classData = cls.data || cls
      // Handle subject as object or string
      const subjectObj = classData.subject || classData.subject_name
      const subjectName = typeof subjectObj === 'object' 
        ? (subjectObj.name || subjectObj.subject_name || '')
        : (subjectObj || '')
      
      // Determine role based on is_class_teacher flag
      const isClassTeacher = classData.is_class_teacher !== undefined 
        ? classData.is_class_teacher 
        : classData.role === 'Class Teacher' || classData.role === 'class_teacher'
      
      return {
        class: classData.name || classData.class_name || classData.class || '',
        subject: subjectName,
        role: isClassTeacher ? 'Class Teacher' : 'Subject Teacher'
      }
    }).filter(cls => cls.class) // Filter out entries without class name
  } else if (classesData && classesData.data && Array.isArray(classesData.data)) {
    // Handle nested data structure
    processedClasses = classesData.data.map(cls => ({
      class: cls.name || cls.class_name || cls.class || '',
      subject: cls.subject?.name || cls.subject_name || cls.subject || '',
      role: cls.is_class_teacher ? 'Class Teacher' : 'Subject Teacher'
    })).filter(cls => cls.class)
  } else if (teacherData.classes || teacherData.class_list) {
    // Fallback to teacher data classes
    processedClasses = teacherData.classes || teacherData.class_list || []
  }
  
  // Transform fetched data to match expected format
  const transformedData = {
    id: teacherData.id,
    firstName: teacherData.firstName || teacherData.first_name || '',
    lastName: teacherData.lastName || teacherData.last_name || '',
    email: teacherData.email || '',
    employeeId: teacherData.employeeId || teacherData.employee_id || '',
    profilePicture: teacherData.profilePicture || teacherData.profile_picture || null,
    classes: processedClasses,
    class_assignment: teacherData.teacher_assignments || teacherData.teacher_assignments || [],
    activityInsights: activityInsights,
    studentPerformance: {
      averageScore: performanceDataResponse.average_score || performanceDataResponse.averageClassScore || teacherData.average_class_score || teacherData.averageClassScore || 0,
      improvement: performanceDataResponse.improvement || performanceDataResponse.improvement_percentage || performanceDataResponse.improvementPercentage || 0,
      period: 'vs. last semester',
      classBreakdown: performanceDataResponse.class_breakdown || performanceDataResponse.classBreakdown || []
    }
  }
  
  // Extract class names for performance breakdown
  const classNames = transformedData.classes.length > 0 
    ? transformedData.classes.map(c => c.class).filter(Boolean)
    : transformedData.studentPerformance.classBreakdown.map(c => c.class || c.class_name).filter(Boolean) || ['Class 10', 'Class 11', 'Class 12', 'Class 9']

  // Transform teacher data for edit modal
  // Need to convert classes format to assignments format expected by modal
  const transformTeacherForEdit = () => {
    if (!teacherData) return null

    // Use raw classesData from Redux which should have IDs
    const assignments = []
    const rawClassesData = classes[teacherId]
    
    if (Array.isArray(rawClassesData)) {
      // Group by class_id to collect all subjects for each class
      const classSubjectMap = {}
      
      rawClassesData.forEach(cls => {
        const classData = cls.data || cls
        const classId = classData.id || classData.class_id || classData.class?.id
        const className = classData.name || classData.class_name || classData.class?.name
        
        if (!classId && !className) return // Skip if no class identifier
        
        const subjectObj = classData.subject || classData.subject_name || classData.subject_id
        let subjectId = null
        
        // Extract subject ID
        if (typeof subjectObj === 'object' && subjectObj) {
          subjectId = subjectObj.id || subjectObj.subject_id
        } else if (typeof subjectObj === 'string' || typeof subjectObj === 'number') {
          // If it's a string/number, it might be an ID or name
          subjectId = subjectObj
        }
        
        // Use class ID or name as key
        const key = classId || className
        
        if (!classSubjectMap[key]) {
          classSubjectMap[key] = {
            class: classId || className,
            subjects: [],
            isClassTeacher: classData.is_class_teacher !== undefined 
              ? classData.is_class_teacher 
              : classData.role === 'Class Teacher' || classData.role === 'class_teacher'
          }
        }
        
        // Add subject if it exists and isn't already in the list
        if (subjectId && !classSubjectMap[key].subjects.includes(subjectId)) {
          classSubjectMap[key].subjects.push(subjectId)
        }
      })
      
      // Convert map to array
      assignments.push(...Object.values(classSubjectMap))
    } else if (rawClassesData && rawClassesData.data && Array.isArray(rawClassesData.data)) {
      // Handle nested data structure
      const classSubjectMap = {}
      
      rawClassesData.data.forEach(cls => {
        const classId = cls.id || cls.class_id || cls.class?.id
        const className = cls.name || cls.class_name || cls.class?.name
        
        if (!classId && !className) return
        
        const subjectObj = cls.subject || cls.subject_id || cls.subject_name
        let subjectId = null
        
        if (typeof subjectObj === 'object' && subjectObj) {
          subjectId = subjectObj.id || subjectObj.subject_id
        } else if (subjectObj) {
          subjectId = subjectObj
        }
        
        const key = classId || className
        
        if (!classSubjectMap[key]) {
          classSubjectMap[key] = {
            class: classId || className,
            subjects: [],
            isClassTeacher: cls.is_class_teacher || false
          }
        }
        
        if (subjectId && !classSubjectMap[key].subjects.includes(subjectId)) {
          classSubjectMap[key].subjects.push(subjectId)
        }
      })
      
      assignments.push(...Object.values(classSubjectMap))
    }

    // Determine if teacher is a class teacher
    const isClassTeacher = assignments.some(assignment => assignment.isClassTeacher) ||
      processedClasses.some(cls => cls.role === 'Class Teacher')

    return {
      id: teacherData.id,
      firstName: teacherData.firstName || teacherData.first_name || '',
      lastName: teacherData.lastName || teacherData.last_name || '',
      email: teacherData.email || '',
      employeeId: teacherData.employeeId || teacherData.employee_id || '',
      isClassTeacher: isClassTeacher,
      assignments: assignments.filter(a => a.subjects.length > 0 || a.class) // Only include assignments with class or subjects
    }
  }

  const handleUpdateTeacher = async (teacherData) => {
    try {
      await dispatch(updateTeacher({ teacherId: teacherId, teacherData })).unwrap()
      setShowEditModal(false)
      setSuccessData({
        title: 'Profile Updated Successfully',
        message: `${teacherData.firstName} ${teacherData.lastName}'s profile has been updated.`
      })
      setShowSuccessModal(true)
      // Refresh teacher data
      dispatch(fetchTeacherById(teacherId))
      // dispatch(fetchTeacherClasses(teacherId)) 
    } catch (error) {
      console.error('Error updating teacher:', error)
      // You might want to show an error message here
    }
  }

  const handleEditClick = () => {
    setShowEditModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <nav className="text-sm text-gray-600">
            <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate('/teachers')}>Teachers</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Teacher Profile</span>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{transformedData.firstName} {transformedData.lastName}</h1>
              <p className="text-gray-600">View and manage teacher details and performance.</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/teachers')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleEditClick}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teacher Information Card - Top Left */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Teacher Information</h3>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {transformedData.profilePicture ? (
                  <img 
                    src={transformedData.profilePicture} 
                    alt={`${transformedData.firstName} ${transformedData.lastName}`}
                    className="h-32 w-32 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="h-32 w-32 bg-gradient-to-br from-pink-200 to-pink-400 rounded-full flex items-center justify-center border-4 border-gray-100">
                    <User className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
              
              {/* Teacher Details */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">
                    {transformedData.firstName} {transformedData.lastName}
                  </h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 sm:w-24">Email:</span>
                    <span className="text-gray-900">{transformedData.email || 'N/A'}</span>
                  </div>
                  
                  {transformedData.employeeId && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 sm:w-24">Employee ID:</span>
                      <span className="text-gray-900 font-semibold">{transformedData.employeeId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Classes & Subjects Card - Top Right */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Classes & Subjects</h3>
            <div className="space-y-4">
              {transformedData.class_assignment && transformedData.class_assignment.length > 0 ? transformedData.class_assignment.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">
                      {assignment.class.name}{assignment.subject.name ? ` - ${assignment.subject.name}` : ''}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    assignment.isClassTeacher 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {assignment.isClassTeacher ? 'Class Teacher' : 'Subject Teacher'}
                  </span>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No classes assigned yet.</p>
              )}
            </div>
          </div>

          {/* Activity Insights Card - Bottom Left */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Activity Insights</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dashboard Usage</p>
                <p className="text-lg font-medium text-gray-900">{transformedData.activityInsights.dashboardUsage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Content Creation</p>
                <p className="text-lg font-medium text-gray-900">{transformedData.activityInsights.contentCreation}</p>
              </div>
            </div>
          </div>

          {/* Student Performance Card - Bottom Right */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Student Performance</h3>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Average Student Score</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{transformedData.studentPerformance.averageScore}%</p>
              {transformedData.studentPerformance.improvement > 0 && (
                <div className="flex items-center justify-center mb-6">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    +{transformedData.studentPerformance.improvement}% {transformedData.studentPerformance.period}
                  </span>
                </div>
              )}
              {classNames.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end gap-4 text-sm text-gray-600">
                    {classNames.slice(0, 4).map((className, idx) => (
                      <span key={idx}>{className}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Teacher Modal */}
      {showEditModal && (
        <AddTeacherModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateTeacher}
          teacher={transformTeacherForEdit()}
          title="Edit Teacher Profile"
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

export default TeacherProfile