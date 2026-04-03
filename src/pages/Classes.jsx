import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchClasses, setFilters, createClass, updateClass } from '../features/classes/classesSlice'
import CreateClassModal from '../components/CreateClassModal'
import CreateSubjectModal from '../components/CreateSubjectModal'
import subjectsService from '../services/subjectsService'

const Classes = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { classes, loading, error, summary } = useSelector(state => state.classes)
  const [activeTab, setActiveTab] = useState('classes')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)

  // Subjects state
  const [subjects, setSubjects] = useState([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectsError, setSubjectsError] = useState(null)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [deletingSubjectId, setDeletingSubjectId] = useState(null)
  const [subjectSearch, setSubjectSearch] = useState('')

  useEffect(() => {
    if (error.classes) return
    dispatch(fetchClasses({}))
  }, [dispatch, error.classes])

  useEffect(() => {
    if (error.classes) return
    const filters = {}
    if (searchTerm) filters.search = searchTerm
    dispatch(setFilters(filters))
    const timeoutId = setTimeout(() => {
      dispatch(fetchClasses(filters))
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, dispatch, error.classes])

  const fetchSubjects = useCallback(async () => {
    setSubjectsLoading(true)
    setSubjectsError(null)
    try {
      const response = await subjectsService.getSubjects()
      const data = response.data || response || []
      setSubjects(Array.isArray(data) ? data : [])
    } catch (err) {
      setSubjectsError(err.message || 'Failed to load subjects')
    } finally {
      setSubjectsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchSubjects()
    }
  }, [activeTab, fetchSubjects])

  const displayClasses = classes || []

  const filteredClasses = displayClasses.filter(cls => {
    const name = cls.name || cls.class_name || ''
    const teacherName = cls.teacher?.name || cls.class_teacher?.name || cls.classTeacher || ''
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const filteredSubjects = subjects.filter(sub => {
    const name = sub.name || ''
    const code = sub.code || ''
    return name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
           code.toLowerCase().includes(subjectSearch.toLowerCase())
  })

  const getClassName = (classItem) => classItem.name || classItem.class_name || 'Unnamed Class'

  const getTeacherName = (classItem) => {
    if (classItem.teacher) {
      const t = classItem.teacher
      return `${t.title ? t.title + ' ' : ''}${t.first_name || ''} ${t.last_name || ''}`.trim() || t.name || 'N/A'
    }
    if (classItem.class_teacher) {
      const t = classItem.class_teacher
      return `${t.title ? t.title + ' ' : ''}${t.first_name || ''} ${t.last_name || ''}`.trim() || t.name || 'N/A'
    }
    return classItem.classTeacher || 'N/A'
  }

  const getStudentCount = (classItem) => classItem.student_count || classItem.students || classItem.studentCount || 0

  const handleViewDetails = (classId) => navigate(`/classes/${classId}/roster`)

  const handleCreateClass = async (formData) => {
    try {
      await dispatch(createClass(formData)).unwrap()
      setShowAddModal(false)
      setEditingClass(null)
      dispatch(fetchClasses({}))
    } catch (error) {
      console.error('Failed to create class:', error)
    }
  }

  const handleUpdateClass = async (formData) => {
    if (!editingClass) return
    try {
      await dispatch(updateClass({ classId: editingClass.id || editingClass.uuid, classData: formData })).unwrap()
      setShowAddModal(false)
      setEditingClass(null)
      dispatch(fetchClasses({}))
    } catch (error) {
      console.error('Failed to update class:', error)
    }
  }

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return
    setDeletingSubjectId(subjectId)
    try {
      await subjectsService.deleteSubject(subjectId)
      setSubjects(prev => prev.filter(s => s.id !== subjectId))
    } catch (err) {
      alert(err.message || 'Failed to delete subject')
    } finally {
      setDeletingSubjectId(null)
    }
  }

  const handleSubjectSuccess = () => {
    fetchSubjects()
  }

  if (loading.classes && activeTab === 'classes') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error.classes && classes.length === 0 && activeTab === 'classes') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading classes: {error.classes}</p>
          <button
            onClick={() => dispatch(fetchClasses({}))}
            className="mt-2 px-4 py-2 text-white rounded-lg hover:bg-primary-600 transition-colors" style={{ backgroundColor: '#00167a' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
        {activeTab === 'classes' && (
          <button
            onClick={() => { setEditingClass(null); setShowAddModal(true) }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-primary-600 transition-colors" style={{ backgroundColor: '#00167a' }}
          >
            <Plus className="h-5 w-5" />
            New Class
          </button>
        )}
        {activeTab === 'subjects' && (
          <button
            onClick={() => { setEditingSubject(null); setShowSubjectModal(true) }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-primary-600 transition-colors" style={{ backgroundColor: '#00167a' }}
          >
            <Plus className="h-5 w-5" />
            Add Subject
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('classes')}
            className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'classes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Classes
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'subjects'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subjects
          </button>
        </nav>
      </div>

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLASS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLASS TEACHER</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STUDENTS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((classItem) => (
                    <tr key={classItem.id || classItem.uuid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{getClassName(classItem)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getTeacherName(classItem)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getStudentCount(classItem)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(classItem.id || classItem.uuid)}
                          className="text-sm text-primary-500 hover:text-primary-600 hover:underline transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No classes found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={subjectSearch}
              onChange={e => setSubjectSearch(e.target.value)}
              placeholder="Search subjects..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
            />
          </div>

          {subjectsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : subjectsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{subjectsError}</p>
              <button onClick={fetchSubjects} className="mt-2 px-4 py-2 text-white rounded-lg transition-colors" style={{ backgroundColor: '#00167a' }}>
                Retry
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SUBJECT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CODE</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DESCRIPTION</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubjects.length > 0 ? (
                      filteredSubjects.map((subject) => (
                        <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {subject.logo ? (
                                <img src={subject.logo} alt={subject.name} className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                  {(subject.name || '?')[0].toUpperCase()}
                                </div>
                              )}
                              <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {subject.code}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate">{subject.description || '—'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              subject.is_active !== false
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {subject.is_active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => { setEditingSubject(subject); setShowSubjectModal(true) }}
                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(subject.id)}
                                disabled={deletingSubjectId === subject.id}
                                className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                                title="Delete"
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
                          {subjectSearch ? 'No subjects match your search' : 'No subjects found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <CreateClassModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingClass(null) }}
        onSave={editingClass ? handleUpdateClass : handleCreateClass}
        loading={editingClass ? loading.updating : loading.creating}
        error={editingClass ? error.updating : error.creating}
        classData={editingClass}
      />

      <CreateSubjectModal
        isOpen={showSubjectModal}
        onClose={() => { setShowSubjectModal(false); setEditingSubject(null) }}
        onSuccess={handleSubjectSuccess}
        subject={editingSubject}
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
      />
    </div>
  )
}

export default Classes
