import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Pencil, Trash2, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchClasses, setFilters, createClass, updateClass } from '../features/classes/classesSlice'
import CreateClassModal from '../components/CreateClassModal'
import CreateSubjectModal from '../components/CreateSubjectModal'
import Modal from '../components/Modal'
import subjectsService from '../services/subjectsService'
import teachersService from '../services/teachersService'

const Classes = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { classes, loading, error } = useSelector(state => state.classes)
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
  const [teachers, setTeachers] = useState([])
  const [teachersLoading, setTeachersLoading] = useState(false)
  const [assignTeacherState, setAssignTeacherState] = useState({ classItem: null, teacherId: '' })
  const [assignTeacherLoading, setAssignTeacherLoading] = useState(false)
  const [assignTeacherError, setAssignTeacherError] = useState('')

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

  const fetchTeachers = useCallback(async () => {
    setTeachersLoading(true)
    try {
      const response = await teachersService.getTeachers({})
      const data = response?.data || response || []
      setTeachers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load teachers for class assignment:', err)
      setTeachers([])
    } finally {
      setTeachersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchSubjects()
    }
  }, [activeTab, fetchSubjects])

  useEffect(() => {
    if (activeTab === 'classes') {
      fetchTeachers()
    }
  }, [activeTab, fetchTeachers])

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

  const getTeacherDisplayName = (teacher) => {
    const firstName = teacher.firstName || teacher.first_name || ''
    const lastName = teacher.lastName || teacher.last_name || ''
    return `${firstName} ${lastName}`.trim() || teacher.name || teacher.username || 'Unnamed Teacher'
  }

  const getTeacherAssignments = (teacher) => {
    if (Array.isArray(teacher.assignments) && teacher.assignments.length > 0) {
      return teacher.assignments
    }

    if (Array.isArray(teacher.class_assignment) && teacher.class_assignment.length > 0) {
      return teacher.class_assignment
    }

    if (Array.isArray(teacher.teacher_assignments) && teacher.teacher_assignments.length > 0) {
      return teacher.teacher_assignments
    }

    return []
  }

  const getTeacherClassNames = (teacher) => {
    const classNames = new Set()

    if (Array.isArray(teacher.class_list)) {
      teacher.class_list.forEach((className) => {
        if (className) classNames.add(String(className))
      })
    }

    getTeacherAssignments(teacher).forEach((assignment) => {
      const classItem = assignment.class || assignment.class_instance
      const className = classItem?.name || classItem?.class_name || assignment.class_name
      if (className) classNames.add(String(className))
    })

    return [...classNames]
  }

  const normalizeTeacherAssignments = (teacher) => {
    let rawAssignments = []

    if (Array.isArray(teacher.assignments) && teacher.assignments.length > 0) {
      rawAssignments = teacher.assignments
    } else if (Array.isArray(teacher.class_assignment) && teacher.class_assignment.length > 0) {
      rawAssignments = teacher.class_assignment
    } else if (Array.isArray(teacher.teacher_assignments) && teacher.teacher_assignments.length > 0) {
      const classSubjectMap = {}

      teacher.teacher_assignments.forEach((assignment) => {
        const classId = assignment.class?.id || assignment.class_id || assignment.class_instance?.id || assignment.class_instance_id
        const subjectId = assignment.subject?.id || assignment.subject_id

        if (!classId || !subjectId) return

        if (!classSubjectMap[classId]) {
          classSubjectMap[classId] = { class: String(classId), subjects: [] }
        }

        if (!classSubjectMap[classId].subjects.includes(String(subjectId))) {
          classSubjectMap[classId].subjects.push(String(subjectId))
        }
      })

      rawAssignments = Object.values(classSubjectMap)
    } else if (teacher.class_id && Array.isArray(teacher.subject_ids) && teacher.subject_ids.length > 0) {
      rawAssignments = [{ class: teacher.class_id, subjects: teacher.subject_ids }]
    }

    return rawAssignments.map((assignment) => {
      const classValue = assignment.class ?? assignment.class_id
      const classId = typeof classValue === 'object' ? (classValue?.id || classValue?.uuid) : classValue
      const subjectSource = assignment.subjects ?? (assignment.subject ? [assignment.subject] : [])
      const subjectIds = subjectSource
        .map((subject) => (typeof subject === 'object' ? (subject?.id || subject?.uuid) : subject))
        .filter(Boolean)
        .map(String)

      return {
        class: String(classId),
        subjects: [...new Set(subjectIds)],
      }
    }).filter((assignment) => assignment.class && assignment.subjects.length > 0)
  }

  const assignableTeachers = useMemo(() => {
    if (!assignTeacherState.classItem) return []

    const targetClassName = getClassName(assignTeacherState.classItem)

    return teachers.filter((teacher) => {
      const teachesTargetClass = getTeacherClassNames(teacher).includes(targetClassName)
      const alreadyClassTeacher = teacher.isClassTeacher || teacher.is_class_teacher
      return teachesTargetClass && !alreadyClassTeacher
    })
  }, [assignTeacherState.classItem, teachers])

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

  const openAssignTeacherModal = (classItem) => {
    setAssignTeacherError('')
    setAssignTeacherState({ classItem, teacherId: '' })
  }

  const closeAssignTeacherModal = (force = false) => {
    if (assignTeacherLoading && !force) return
    setAssignTeacherError('')
    setAssignTeacherState({ classItem: null, teacherId: '' })
  }

  const handleAssignTeacher = async () => {
    if (!assignTeacherState.classItem || !assignTeacherState.teacherId) return

    setAssignTeacherLoading(true)
    setAssignTeacherError('')

    try {
      const teacherResponse = await teachersService.getTeacherById(assignTeacherState.teacherId)
      const teacher = teacherResponse?.data || teacherResponse || {}
      const normalizedAssignments = normalizeTeacherAssignments(teacher)
      const targetClassId = String(assignTeacherState.classItem.id || assignTeacherState.classItem.uuid)
      const targetAssignment = normalizedAssignments.find((assignment) => String(assignment.class) === targetClassId)

      if (!targetAssignment) {
        setAssignTeacherError('This teacher is not linked to the selected class yet. Add the class in the teacher profile first.')
        return
      }

      const reorderedAssignments = [
        targetAssignment,
        ...normalizedAssignments.filter((assignment) => String(assignment.class) !== targetClassId),
      ]

      await teachersService.updateTeacher(assignTeacherState.teacherId, {
        firstName: teacher.firstName || teacher.first_name || '',
        lastName: teacher.lastName || teacher.last_name || '',
        email: teacher.email || '',
        employeeId: teacher.employeeId || teacher.employee_id || '',
        isClassTeacher: true,
        assignments: reorderedAssignments,
      })

      await Promise.all([
        dispatch(fetchClasses({})).unwrap(),
        fetchTeachers(),
      ])

      closeAssignTeacherModal(true)
    } catch (err) {
      setAssignTeacherError(err.message || 'Failed to assign class teacher')
    } finally {
      setAssignTeacherLoading(false)
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
                        {getTeacherName(classItem) !== 'N/A' ? (
                          <div className="text-sm text-gray-900">{getTeacherName(classItem)}</div>
                        ) : (
                          <button
                            onClick={() => openAssignTeacherModal(classItem)}
                            className="inline-flex items-center gap-2 rounded-full border border-dashed border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            Add teacher
                          </button>
                        )}
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

      <Modal
        isOpen={Boolean(assignTeacherState.classItem)}
        onClose={closeAssignTeacherModal}
        title={assignTeacherState.classItem ? `Assign Teacher to ${getClassName(assignTeacherState.classItem)}` : 'Assign Teacher'}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose a teacher who already teaches this class. This safely fills the missing class teacher name without changing their subjects.
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Teacher</label>
            <select
              value={assignTeacherState.teacherId}
              onChange={(e) => setAssignTeacherState((prev) => ({ ...prev, teacherId: e.target.value }))}
              disabled={teachersLoading || assignTeacherLoading || assignableTeachers.length === 0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {teachersLoading
                  ? 'Loading teachers...'
                  : assignableTeachers.length > 0
                    ? 'Select teacher'
                    : 'No matching teachers available'}
              </option>
              {assignableTeachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {getTeacherDisplayName(teacher)}
                </option>
              ))}
            </select>
          </div>

          {assignTeacherError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {assignTeacherError}
            </div>
          )}

          {assignableTeachers.length === 0 && !teachersLoading && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No teacher is currently linked to this class. Add the class in the teacher profile first, then assign them here in one click.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeAssignTeacherModal}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssignTeacher}
              disabled={!assignTeacherState.teacherId || assignTeacherLoading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: '#00167a' }}
            >
              {assignTeacherLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Classes
