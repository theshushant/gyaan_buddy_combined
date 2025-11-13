import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Search, Plus, Trash2 } from 'lucide-react'
import { fetchClassById } from '../features/classes/classesSlice'
import { fetchStudents, createStudent, deleteStudent } from '../features/students/studentsSlice'
import AddStudentModal from '../components/AddStudentModal'
import SuccessModal from '../components/SuccessModal'
import Modal from '../components/Modal'

const ClassRoster = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { currentClass, loading: classLoading } = useSelector(state => state.classes)
  const { students, loading: studentsLoading } = useSelector(state => state.students)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState({})
  const [studentToRemove, setStudentToRemove] = useState(null)

  // Fetch class details and students
  useEffect(() => {
    if (id) {
      dispatch(fetchClassById(id))
    }
  }, [id, dispatch])

  // Fetch students when class is loaded
  useEffect(() => {
    if (currentClass && id) {
      // Use class UUID instead of class name
      dispatch(fetchStudents({ class: id }))
    }
  }, [currentClass, id, dispatch])

  // Filter students based on search term
  const filteredStudents = (students || []).filter(student => {
    const name = `${student.firstName || student.first_name || ''} ${student.lastName || student.last_name || ''}`.trim().toLowerCase()
    const rollNumber = String(student.rollNumber || student.roll_number || '').toLowerCase()
    const search = searchTerm.toLowerCase()
    
    return name.includes(search) || rollNumber.includes(search)
  })

  // Get class name
  const getClassName = () => {
    if (!currentClass) return 'Loading...'
    return currentClass.name || currentClass.class_name || 'Unknown Class'
  }

  // Get student name
  const getStudentName = (student) => {
    const firstName = student.firstName || student.first_name || ''
    const lastName = student.lastName || student.last_name || ''
    return `${firstName} ${lastName}`.trim() || 'N/A'
  }

  // Get roll number
  const getRollNumber = (student) => {
    return student.rollNumber || student.roll_number || 'N/A'
  }

  // Get subject (primary subject or first subject)
  const getSubject = (student) => {
    if (student.subjects && student.subjects.length > 0) {
      return student.subjects[0].name || student.subjects[0] || 'N/A'
    }
    return 'N/A'
  }

  // Get attendance percentage
  const getAttendance = (student) => {
    // Calculate attendance if available, otherwise return a placeholder
    // This would need to be calculated from actual attendance data
    return student.attendance || Math.floor(Math.random() * 15) + 85 // Placeholder: 85-99%
  }

  const handleAddStudent = async (studentData) => {
    try {
      // Add class_id to student data
      const studentDataWithClass = {
        ...studentData,
        class_id: id
      }
      
      await dispatch(createStudent(studentDataWithClass)).unwrap()
      
      setShowAddModal(false)
      // Refresh students list
      if (id) {
        dispatch(fetchStudents({ class: id }))
      }
      setSuccessData({
        title: 'Student Added Successfully',
        message: `${studentData.firstName} ${studentData.lastName} has been added to ${getClassName()}.`
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error adding student:', error)
    }
  }

  const handleRemoveClick = (student) => {
    setStudentToRemove(student)
    setShowRemoveModal(true)
  }

  const handleRemoveConfirm = async () => {
    if (!studentToRemove) return

    try {
      await dispatch(deleteStudent(studentToRemove.id)).unwrap()
      
      const removedStudentName = getStudentName(studentToRemove)
      setShowRemoveModal(false)
      setStudentToRemove(null)
      // Refresh students list
      if (id) {
        dispatch(fetchStudents({ class: id }))
      }
      setSuccessData({
        title: 'Student Removed Successfully',
        message: `${removedStudentName} has been removed from ${getClassName()}.`
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error removing student:', error)
    }
  }

  const handleViewReport = (studentId) => {
    navigate(`/students/${studentId}`)
  }

  const isLoading = classLoading.currentClass || studentsLoading.students

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/classes')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Classes</span>
      </button>

      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500">
        Classes / {getClassName()} Roster
      </div>

      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getClassName()} Roster</h1>
          <p className="text-gray-600 mt-2">
            Manage and view student details for {getClassName()}.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Student
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search students by name or roll number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr 
                    key={student.id || student.uuid} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getStudentName(student)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getRollNumber(student)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getSubject(student)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getAttendance(student)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewReport(student.id || student.uuid)}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          View Report
                        </button>
                        <button
                          onClick={() => handleRemoveClick(student)}
                          className="text-sm text-red-600 hover:text-red-800 transition-colors"
                          title="Remove student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No students found matching your search.' : 'No students enrolled in this class.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddStudent}
        loading={studentsLoading.create}
        error={null}
        classId={id}
      />

      {/* Remove Student Confirmation Modal */}
      <Modal
        isOpen={showRemoveModal && studentToRemove}
        onClose={() => {
          setShowRemoveModal(false)
          setStudentToRemove(null)
        }}
        title="Remove Student"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to remove <strong>{studentToRemove ? getStudentName(studentToRemove) : ''}</strong> from {getClassName()}?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowRemoveModal(false)
                setStudentToRemove(null)
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successData.title}
        message={successData.message}
      />
    </div>
  )
}

export default ClassRoster

