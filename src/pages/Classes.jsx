import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchClasses, setFilters, createClass, updateClass } from '../features/classes/classesSlice'
import CreateClassModal from '../components/CreateClassModal'

const Classes = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { classes, loading, error, summary } = useSelector(state => state.classes)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)

  // Fetch classes on component mount
  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    if (error.classes) {
      return // Don't retry if there's already an error
    }
    dispatch(fetchClasses({}))
  }, [dispatch, error.classes])

  // Handle filter changes
  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    if (error.classes) {
      return // Don't retry if there's already an error
    }

    const filters = {}
    if (searchTerm) {
      filters.search = searchTerm
    }
    dispatch(setFilters(filters)) 
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      dispatch(fetchClasses(filters))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, dispatch, error.classes])

  // Use API data only
  const displayClasses = classes || []

  // Filter classes based on search term
  const filteredClasses = displayClasses.filter(cls => {
    const name = cls.name || cls.class_name || ''
    const teacherName = cls.teacher?.name || cls.class_teacher?.name || cls.classTeacher || ''
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacherName.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })
  
  // Helper function to get class name
  const getClassName = (classItem) => {
    return classItem.name || classItem.class_name || 'Unnamed Class'
  }
  
  // Helper function to get teacher name
  const getTeacherName = (classItem) => {
    if (classItem.teacher) {
      const teacher = classItem.teacher
      const firstName = teacher.first_name || teacher.firstName || ''
      const lastName = teacher.last_name || teacher.lastName || ''
      const title = teacher.title || ''
      return `${title ? title + ' ' : ''}${firstName} ${lastName}`.trim() || teacher.name || 'N/A'
    }
    if (classItem.class_teacher) {
      const teacher = classItem.class_teacher
      const firstName = teacher.first_name || teacher.firstName || ''
      const lastName = teacher.last_name || teacher.lastName || ''
      const title = teacher.title || ''
      return `${title ? title + ' ' : ''}${firstName} ${lastName}`.trim() || teacher.name || 'N/A'
    }
    if (classItem.classTeacher) {
      return classItem.classTeacher
    }
    return 'N/A'
  }
  
  // Helper function to get student count
  const getStudentCount = (classItem) => {
    return classItem.student_count || classItem.students || classItem.studentCount || 0
  }

  const handleViewDetails = (classId) => {
    navigate(`/classes/${classId}/roster`)
  }

  const handleAddClass = () => {
    setShowAddModal(true)
  }

  const handleEditClass = (classItem) => {
    setEditingClass(classItem)
    setShowAddModal(true)
  }

  const handleCreateClass = async (formData) => {
    try {
      await dispatch(createClass(formData)).unwrap()
      // Close modal on success
      setShowAddModal(false)
      setEditingClass(null)
      // Refresh classes list
      dispatch(fetchClasses({}))
    } catch (error) {
      // Error is handled by Redux, modal will stay open
      console.error('Failed to create class:', error)
    }
  }

  const handleUpdateClass = async (formData) => {
    if (!editingClass) return
    
    try {
      await dispatch(updateClass({ classId: editingClass.id || editingClass.uuid, classData: formData })).unwrap()
      // Close modal on success
      setShowAddModal(false)
      setEditingClass(null)
      // Refresh classes list
      dispatch(fetchClasses({}))
    } catch (error) {
      // Error is handled by Redux, modal will stay open
      console.error('Failed to update class:', error)
    }
  }

  // Show loading state
  if (loading.classes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show error state
  if (error.classes && classes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading classes: {error.classes}</p>
          <button
            onClick={() => dispatch(fetchClasses({}))}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
        <button 
          onClick={handleAddClass}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Class
        </button>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CLASS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CLASS TEACHER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STUDENTS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((classItem) => (
                  <tr key={classItem.id || classItem.uuid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getClassName(classItem)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTeacherName(classItem)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getStudentCount(classItem)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(classItem.id || classItem.uuid)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No classes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Class Modal */}
      <CreateClassModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingClass(null)
        }}
        onSave={editingClass ? handleUpdateClass : handleCreateClass}
        loading={editingClass ? loading.updating : loading.creating}
        error={editingClass ? error.updating : error.creating}
        classData={editingClass}
      />
    </div>
  )
}

export default Classes