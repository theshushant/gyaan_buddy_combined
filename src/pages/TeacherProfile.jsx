import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Edit, User, BookOpen, Clock, TrendingUp } from 'lucide-react'
import { fetchTeacherById, fetchTeacherClasses, fetchTeacherPerformance, updateTeacher } from '../features/teachers/teachersSlice'
import teachersService from '../services/teachersService'
import AddTeacherModal from '../components/AddTeacherModal'
import SuccessModal from '../components/SuccessModal'

const isMeaningfulEmail = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return false
  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  if (!looksLikeEmail) return false
  return !normalized.endsWith('@school.gyaanbuddy.com')
}

const resolveTeacherEmail = (...values) => {
  const match = values.find((value) => isMeaningfulEmail(value))
  return match ? String(match).trim() : ''
}

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
  
  const teacherId = id === 'me' || !id ? user?.id : id
  const isOwnProfile = role === 'teacher' && (id === 'me' || !id || id === user?.id?.toString())
  
  useEffect(() => {
    if (teacherId) {
      dispatch(fetchTeacherById(teacherId))
      dispatch(fetchTeacherPerformance(teacherId))
      
    }
  }, [dispatch, teacherId])

  useEffect(() => {
    if (currentTeacher) {
      const teacherData = currentTeacher.data || currentTeacher
      if (teacherData.content_created !== undefined) {
        setActivityInsights(prev => ({
          ...prev,
          contentCreation: teacherData.content_created || prev.contentCreation
        }))
      }
    }
  }, [currentTeacher])
  
  const teacherData = currentTeacher || (isOwnProfile && user ? {
    id: user.id,
    firstName: user.firstName || user.first_name || '',
    lastName: user.lastName || user.last_name || '',
    email: user.email || '',
    username: user.username || '',
    employeeId: user.employeeId || user.employee_id || '',
    subjects: user.subjects || [],
    classes: [],
  } : null)
  
  if (loading.currentTeacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
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
  
  const performanceData = performance[teacherId] || {}
  const performanceDataResponse = performanceData.data || performanceData
  
  let processedClasses = []
  const classesData = classes[teacherId]
  
  if (Array.isArray(classesData)) {
    processedClasses = classesData.map(cls => {
      const classData = cls.data || cls
      const subjectObj = classData.subject || classData.subject_name
      const subjectName = typeof subjectObj === 'object' 
        ? (subjectObj.name || subjectObj.subject_name || '')
        : (subjectObj || '')
      
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
    processedClasses = classesData.data.map(cls => ({
      class: cls.name || cls.class_name || cls.class || '',
      subject: cls.subject?.name || cls.subject_name || cls.subject || '',
      role: cls.is_class_teacher ? 'Class Teacher' : 'Subject Teacher'
    })).filter(cls => cls.class)
  } else if (teacherData.classes || teacherData.class_list) {
    processedClasses = teacherData.classes || teacherData.class_list || []
  }
  
  const transformedData = {
    id: teacherData.id,
    firstName: teacherData.firstName || teacherData.first_name || '',
    lastName: teacherData.lastName || teacherData.last_name || '',
    email: resolveTeacherEmail(
      teacherData.email,
      teacherData.user?.email,
      teacherData.username,
      teacherData.user?.username,
      isOwnProfile ? user?.email : '',
      isOwnProfile ? user?.username : '',
    ),
    username: teacherData.username || '',
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
  
  const classNames = transformedData.classes.length > 0 
    ? transformedData.classes.map(c => c.class).filter(Boolean)
    : transformedData.studentPerformance.classBreakdown.map(c => c.class || c.class_name).filter(Boolean) || ['Class 10', 'Class 11', 'Class 12', 'Class 9']

  const transformTeacherForEdit = () => {
    if (!teacherData) return null

    const assignments = []
    const classSubjectMap = {}
    
    if (teacherData.teacher_assignments && Array.isArray(teacherData.teacher_assignments) && teacherData.teacher_assignments.length > 0) {
      teacherData.teacher_assignments.forEach(ta => {
        const classId = ta.class?.id || ta.class_id || ta.class
        const className = ta.class?.name || ta.class_name
        
        const subjectId = ta.subject?.id || ta.subject_id || ta.subject
        const subjectName = ta.subject?.name || ta.subject_name
        
        if (!classId) return
        
        const key = classId
        
        if (!classSubjectMap[key]) {
          classSubjectMap[key] = {
            class: classId, // Always use ID, not name
            subjects: [],
            isClassTeacher: ta.isClassTeacher !== undefined 
              ? ta.isClassTeacher 
              : (ta.is_class_teacher !== undefined ? ta.is_class_teacher : false)
          }
        }
        
        if (subjectId && !classSubjectMap[key].subjects.includes(subjectId)) {
          classSubjectMap[key].subjects.push(subjectId)
        }
      })
      
      assignments.push(...Object.values(classSubjectMap))
    } else {
      const rawClassesData = classes[teacherId]
      
      if (Array.isArray(rawClassesData)) {
        rawClassesData.forEach(cls => {
          const classData = cls.data || cls
          const classId = classData.id || classData.class_id || classData.class?.id
          const className = classData.name || classData.class_name || classData.class?.name
          
          if (!classId && !className) return // Skip if no class identifier
          
          const subjectObj = classData.subject || classData.subject_name || classData.subject_id
          let subjectId = null
          
          if (typeof subjectObj === 'object' && subjectObj) {
            subjectId = subjectObj.id || subjectObj.subject_id
          } else if (typeof subjectObj === 'string' || typeof subjectObj === 'number') {
            subjectId = subjectObj
          }
          
          const key = classId || className
          
          if (!classSubjectMap[key]) {
            classSubjectMap[key] = {
              class: classId || className, // Prefer ID, fallback to name
              subjects: [],
              isClassTeacher: classData.is_class_teacher !== undefined 
                ? classData.is_class_teacher 
                : (classData.role === 'Class Teacher' || classData.role === 'class_teacher')
            }
          }
          
          if (subjectId && !classSubjectMap[key].subjects.includes(subjectId)) {
            classSubjectMap[key].subjects.push(subjectId)
          }
        })
        
        assignments.push(...Object.values(classSubjectMap))
      } else if (rawClassesData && rawClassesData.data && Array.isArray(rawClassesData.data)) {
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
    }

    const isClassTeacher = assignments.some(assignment => assignment.isClassTeacher) ||
      processedClasses.some(cls => cls.role === 'Class Teacher') ||
      teacherData.is_class_teacher ||
      teacherData.isClassTeacher

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
      dispatch(fetchTeacherById(teacherId))
    } catch (error) {
      console.error('Error updating teacher:', error)
    }
  }

  const handleEditClick = () => {
    setShowEditModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <nav className="text-sm text-gray-600">
            <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate('/teachers')}>Teachers</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Teacher Profile</span>
          </nav>
        </div>

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
                className="flex items-center px-4 py-2 text-white rounded-lg hover:bg-primary-600 transition-colors" style={{ backgroundColor: '#00167a' }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Teacher Information</h3>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
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
              
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">
                    {transformedData.firstName} {transformedData.lastName}
                  </h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 sm:w-24">Username:</span>
                    <span className="text-gray-900">{transformedData.username || 'N/A'}</span>
                  </div>
                  
                  {transformedData.email && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 sm:w-24 shrink-0">Email:</span>
                      <span className="text-gray-900 break-all">{transformedData.email}</span>
                    </div>
                  )}
                  
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
                      : 'bg-primary-500/20 text-primary-500'
                  }`}>
                    {assignment.isClassTeacher ? 'Class Teacher' : 'Subject Teacher'}
                  </span>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No classes assigned yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Student Performance</h3>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">Average Student Score</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{transformedData.studentPerformance.averageScore}%</p>
              {transformedData.studentPerformance.improvement > 0 && (
                <div className="flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    +{transformedData.studentPerformance.improvement}% {transformedData.studentPerformance.period}
                  </span>
                </div>
              )}
            </div>
            {transformedData.studentPerformance.classBreakdown.length > 0 && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Score by Class</p>
                {transformedData.studentPerformance.classBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.class || item.class_name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.average_score || item.averageScore || 0}%`,
                            backgroundColor: '#00167a'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-10 text-right">
                        {item.average_score || item.averageScore || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <AddTeacherModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateTeacher}
          teacher={transformTeacherForEdit()}
          title="Edit Teacher Profile"
        />
      )}

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
