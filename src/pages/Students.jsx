import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Filter, Plus, Eye, Trash2, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AddStudentModal from '../components/AddStudentModal'
import SuccessModal from '../components/SuccessModal'
import Modal from '../components/Modal'
import {
  fetchStudents,
  fetchStudentStats,
  fetchStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  setFilters,
  clearError
} from '../features/students/studentsSlice'
import { fetchClasses } from '../features/classes/classesSlice'
import { fetchSubjects } from '../features/subjects/subjectsSlice'

const Students = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const {
    students,
    studentStats,
    summary,
    loading,
    error,
    filters
  } = useSelector(state => state.students)

  const { classes } = useSelector(state => state.classes)
  const { subjects } = useSelector(state => state.subjects)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState({})
  const [editingStudent, setEditingStudent] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)

  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    const hasError = error.students !== null || error.stats !== null
    if (hasError) {
      return // Don't retry if there's already an error
    }

    // Fetch all students once on mount (without filters), stats, classes, and subjects
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchStudents({})), // Fetch all students without filters
          dispatch(fetchStudentStats()),
          dispatch(fetchClasses({})),
          dispatch(fetchSubjects({}))
        ])
      } catch (err) {
        console.error('Error fetching students data:', err)
      }
    }

    fetchData()
  }, [dispatch, error.students, error.stats])

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }))
  }

  const handleClassFilter = (value) => {
    dispatch(setFilters({ class: value }))
  }

  const handleSubjectFilter = (value) => {
    dispatch(setFilters({ subject: value }))
  }

  const handleAddStudent = async (studentData) => {
    try {
      await dispatch(createStudent(studentData)).unwrap()
      // Close modal on success
      setShowAddModal(false)
      // Refresh students list (without filters) and stats
      await Promise.all([
        dispatch(fetchStudents({})), // Fetch all students without filters
        dispatch(fetchStudentStats())
      ])
      setSuccessData({
        title: 'Student Added Successfully',
        message: `${studentData.firstName} ${studentData.lastName} has been added to the system.`
      })
      setShowSuccessModal(true)
    } catch (error) {
      // Error is handled by Redux, modal will stay open
      console.error('Error adding student:', error)
    }
  }

  const handleUpdateStudent = async (studentData) => {
    try {
      await dispatch(updateStudent({ studentId: editingStudent.id, studentData })).unwrap()
      setEditingStudent(null)
      setShowAddModal(false)
      // Refresh students list (without filters) and stats
      await Promise.all([
        dispatch(fetchStudents({})), // Fetch all students without filters
        dispatch(fetchStudentStats())
      ])
      setSuccessData({
        title: 'Student Updated Successfully',
        message: `${studentData.first_name} ${studentData.last_name} has been updated.`
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error updating student:', error)
    }
  }

  const handleDeleteClick = (student) => {
    setStudentToDelete(student)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return

    try {
      await dispatch(deleteStudent(studentToDelete.id)).unwrap()
      // Refresh students list (without filters) and stats
      await Promise.all([
        dispatch(fetchStudents({})), // Fetch all students without filters
        dispatch(fetchStudentStats())
      ])
      setSuccessData({
        title: 'Student Deleted Successfully',
        message: `${studentToDelete.first_name || ''} ${studentToDelete.last_name || ''} has been removed from the system.`
      })
      setShowDeleteModal(false)
      setStudentToDelete(null)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error deleting student:', error)
      // Keep modal open on error so user can try again or cancel
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setStudentToDelete(null)
  }

  const handleViewStudent = (studentId) => {
    navigate(`/students/${studentId}`)
  }

  const handleEditStudent = async (student) => {
    try {
      // Fetch full student details to ensure we have all fields (parent_name, date_of_birth, subjects, etc.)
      const fullStudent = await dispatch(fetchStudentById(student.id)).unwrap()
      setEditingStudent(fullStudent)
      setShowAddModal(true)
    } catch (error) {
      console.error('Error fetching student details:', error)
      // Fallback to using the student from the list if fetch fails
      setEditingStudent(student)
      setShowAddModal(true)
    }
  }

  const clearFilters = () => {
    dispatch(setFilters({
      search: '',
      class: '',
      subject: ''
    }))
  }

  // Local filtering logic - filter students based on search, class, and subject
  const filteredStudents = (students || []).filter(student => {
    // Search filter - check if name matches search term
    if (filters.search) {
      const firstName = (student.first_name || student.firstName || '').toLowerCase()
      const lastName = (student.last_name || student.lastName || '').toLowerCase()
      const fullName = `${firstName} ${lastName}`.trim()
      const searchTerm = filters.search.toLowerCase()
      
      if (!fullName.includes(searchTerm)) {
        return false
      }
    }

    // Class filter - check if student's class matches selected class
    if (filters.class) {
      const studentClassId = (
        student.class_id?.toString() || 
        student.class_instance?.toString() || 
        student.profile?.class_instance?.id?.toString() ||
        ''
      )
      const studentClassName = (
        student.class_name || 
        student.class || 
        student.profile?.class_instance?.name ||
        ''
      ).toString()
      const filterClassValue = filters.class.toString()
      
      // Match by ID or name
      if (studentClassId !== filterClassValue && studentClassName !== filterClassValue) {
        return false
      }
    }

    // Subject filter - check if student has the selected subject
    if (filters.subject) {
      const studentSubjects = student.subjects || student.subject_ids || []
      const filterSubjectValue = filters.subject.toString()
      
      // Check if student has this subject (by ID or name)
      const hasSubject = studentSubjects.some(subject => {
        if (typeof subject === 'object') {
          const subjectId = (subject.id || subject.uuid || '').toString()
          const subjectName = (subject.name || subject.subject_name || '').toString().toLowerCase()
          return subjectId === filterSubjectValue || subjectName === filterSubjectValue.toLowerCase()
        } else {
          // Subject might be a string or ID
          const subjectStr = subject.toString()
          return subjectStr === filterSubjectValue || subjectStr === filterSubjectValue.toLowerCase()
        }
      })
      
      if (!hasSubject) {
        return false
      }
    }

    return true
  })

  // Prepare summary cards data
  const summaryCards = [
    { label: 'Total Students', value: studentStats?.totalStudents?.toString() || '0' },
    { label: 'Average Score', value: `${studentStats?.averageScore || 0}%` },
    { label: 'Top Performer', value: summary?.topPerformer || 'N/A' }
  ]

  const isLoading = loading.students || loading.stats
  const hasError = error.students || error.stats

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold">Error Loading Students</h2>
        <p className="text-red-600 mt-2">{hasError}</p>
        <button
          onClick={() => dispatch(clearError())}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Clear Error
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Overview</h1>
        <p className="text-gray-600 mt-2">Filter and view student performance data.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a student by name..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={filters.class}
              onChange={(e) => handleClassFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Class</option>
              {Array.isArray(classes) && classes.map((classItem) => {
                const className = classItem.name || classItem.class_name || `${classItem.id}`
                const classValue = classItem.id?.toString() || classItem.name || classItem.class_name || ''
                return (
                  <option key={classItem.id || classItem.name} value={classValue}>
                    {className}
                  </option>
                )
              })}
            </select>
            
            <select
              value={filters.subject}
              onChange={(e) => handleSubjectFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Subject</option>
              {Array.isArray(subjects) && subjects.map((subject) => {
                const subjectName = subject.name || subject.subject_name || `${subject.id}`
                const subjectValue = subject.id?.toString() || subject.name || subject.subject_name || ''
                return (
                  <option key={subject.id || subject.name} value={subjectValue}>
                    {subjectName}
                  </option>
                )
              })}
            </select>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Students</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {(student.first_name?.charAt(0) || '').toUpperCase()}{(student.last_name?.charAt(0) || '').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {[student.first_name, student.last_name].filter(Boolean).join(' ') || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.class_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.averageScore || 0}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.attendance || 0}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewStudent(student.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setEditingStudent(null)
          }}
          onSave={editingStudent ? handleUpdateStudent : handleAddStudent}
          loading={loading.create || loading.update}
          error={error.create || error.update}
          student={editingStudent}
          title={editingStudent ? 'Edit Student' : 'Add New Student'}
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

      {showDeleteModal && studentToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          title="Delete Student"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Are you sure you want to delete this student?
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  This action will permanently delete <span className="font-semibold text-gray-900">
                    {studentToDelete.first_name || ''} {studentToDelete.last_name || ''}
                  </span> from the system.
                </p>
                <p className="text-sm text-red-600 font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading.delete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading.delete ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Student</span>
                  </>
                )}
              </button>
            </div>

            {error.delete && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error.delete}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Students