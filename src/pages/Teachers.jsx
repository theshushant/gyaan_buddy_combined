import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Plus, ChevronDown, AlertTriangle, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AddTeacherModal from '../components/AddTeacherModal'
import SuccessModal from '../components/SuccessModal'
import Modal from '../components/Modal'
import {
  fetchTeachers,
  fetchTeacherStats,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  setFilters,
  clearError
} from '../features/teachers/teachersSlice'
import { fetchSubjects } from '../features/subjects/subjectsSlice'

const Teachers = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const {
    teachers,
    teacherStats,
    summary,
    loading,
    error,
    filters
  } = useSelector(state => state.teachers)

  const { subjects } = useSelector(state => state.subjects)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState({})
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState(null)

  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    const hasError = error.teachers !== null || error.stats !== null
    if (hasError) {
      return // Don't retry if there's already an error
    }

    // Fetch teachers, stats, and subjects when component mounts
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchTeachers(filters)),
          dispatch(fetchTeacherStats()),
          dispatch(fetchSubjects({}))
        ])
      } catch (err) {
        console.error('Error fetching teachers data:', err)
      }
    }

    fetchData()
  }, [dispatch, error.teachers, error.stats])

  // Update filters when search terms change
  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    const hasError = error.teachers !== null
    if (hasError) {
      return // Don't retry if there's already an error
    }

    const newFilters = {
      search: filters.search,
      subject: filters.subject
    }
    
    dispatch(fetchTeachers(newFilters))
  }, [dispatch, filters.search, filters.subject, error.teachers])

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }))
  }

  const handleSubjectFilter = (value) => {
    dispatch(setFilters({ subject: value }))
  }

  const handleAddTeacher = async (teacherData) => {
    try {
      await dispatch(createTeacher(teacherData)).unwrap()
      setShowAddModal(false)
      setSuccessData({
        title: 'Teacher Added Successfully',
        message: `${teacherData.firstName} ${teacherData.lastName} has been added to the system.`
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error adding teacher:', error)
    }
  }

  const handleUpdateTeacher = async (teacherData) => {
    try {
      await dispatch(updateTeacher({ teacherId: editingTeacher.id, teacherData })).unwrap()
      setEditingTeacher(null)
      setSuccessData({
        title: 'Teacher Updated Successfully',
        message: `${teacherData.firstName} ${teacherData.lastName} has been updated.`
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error updating teacher:', error)
    }
  }

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete) return

    try {
      await dispatch(deleteTeacher(teacherToDelete.id)).unwrap()
      setSuccessData({
        title: 'Teacher Deleted Successfully',
        message: `${teacherToDelete.firstName || ''} ${teacherToDelete.lastName || ''} has been removed from the system.`
      })
      setShowDeleteModal(false)
      setTeacherToDelete(null)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error deleting teacher:', error)
      // Keep modal open on error so user can try again or cancel
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setTeacherToDelete(null)
  }

  const handleViewTeacher = (teacherId) => {
    navigate(`/teachers/${teacherId}`)
  }

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher)
    setShowAddModal(true)
  }

  const clearFilters = () => {
    dispatch(setFilters({
      search: '',
      subject: ''
    }))
  }

  const getProgressBarColor = (percentage, type = 'usage') => {
    if (type === 'usage') {
      // Dashboard Usage colors: green >= 80, orange >= 60, red < 60
      if (percentage >= 80) return 'bg-green-500'
      if (percentage >= 60) return 'bg-orange-500'
      return 'bg-red-500'
    } else {
      // Overall Mastery colors: blue >= 80, orange >= 60, red < 60
      if (percentage >= 80) return 'bg-blue-500'
      if (percentage >= 60) return 'bg-orange-500'
      return 'bg-red-500'
    }
  }
  
  // Format classes display (e.g., "9A, 10B")
  const formatClasses = (classes) => {
    if (!Array.isArray(classes) || classes.length === 0) {
      return 'No classes assigned'
    }
    return classes.map(cls => {
      // Handle both string and object formats
      if (typeof cls === 'string') return cls
      return cls.name || cls.class_name || cls.toString()
    }).join(', ')
  }
  
  // Get teacher's primary subject
  const getTeacherSubject = (teacher) => {
    if (teacher.subjects){
      return teacher.subjects[0].name
    }
    return 'N/A'
  }

  const isLoading = loading.teachers || loading.stats
  const hasError = error.teachers || error.stats

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
        <h2 className="text-red-800 font-semibold">Error Loading Teachers</h2>
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
      {/* Header with Title and Add Button */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-600 mt-2">Oversee teacher activity and class performance.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="h-5 w-5" />
          Add New Teacher
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers by name, subject..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={filters.subject || ''}
                onChange={(e) => handleSubjectFilter(e.target.value)}
                className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
              >
                <option value="">All Subjects</option>
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
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dashboard Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Mastery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(teachers) && teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-blue-600">
                            {(teacher.firstName || '').charAt(0).toUpperCase()}{(teacher.lastName || '').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.firstName || ''} {teacher.lastName || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTeacherSubject(teacher)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {teacher.class_name?? "No class assigned"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(teacher.dashboardUsage || 0, 'usage')}`}
                              style={{ width: `${teacher.dashboardUsage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 w-12 text-right">
                          {teacher.dashboardUsage || 0}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(teacher.overallMastery || 0, 'mastery')}`}
                              style={{ width: `${teacher.overallMastery || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 w-12 text-right">
                          {teacher.overallMastery || 0}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewTeacher(teacher.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(teacher)
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                          title="Delete Teacher"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No teachers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddTeacherModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setEditingTeacher(null)
          }}
          onSubmit={editingTeacher ? handleUpdateTeacher : handleAddTeacher}
          teacher={editingTeacher}
          title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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

      {showDeleteModal && teacherToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          title="Delete Teacher"
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
                  Are you sure you want to delete this teacher?
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  This action will permanently delete <span className="font-semibold text-gray-900">
                    {teacherToDelete.firstName || ''} {teacherToDelete.lastName || ''}
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
                    <span>Delete Teacher</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Teachers