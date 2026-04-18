import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import classesService from '../services/classesService'
import subjectsService from '../services/subjectsService'
import CreateClassSubjectModal from './CreateClassSubjectModal'

const AddTeacherModal = ({ isOpen, onClose, onSave, onSubmit, teacher, title = 'Add New Teacher' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    isClassTeacher: false,
    assignments: []
  })

  const [newAssignment, setNewAssignment] = useState({ class: '', subjects: [] })

  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCreateClassSubjectModal, setShowCreateClassSubjectModal] = useState(false)
  const [createClassSubjectType, setCreateClassSubjectType] = useState('class')

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && teacher) {
      setFormData({
        firstName: teacher.firstName || teacher.first_name || '',
        lastName: teacher.lastName || teacher.last_name || '',
        email: teacher.email || '',
        password: '',
        confirmPassword: '',
        employeeId: teacher.employeeId || teacher.employee_id || '',
        isClassTeacher: teacher.isClassTeacher || teacher.is_class_teacher || false,
        assignments: []
      })
      setNewAssignment({ class: '', subjects: [] })
    } else if (isOpen && !teacher) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        employeeId: '',
        isClassTeacher: false,
        assignments: []
      })
      setNewAssignment({ class: '', subjects: [] })
    }
    setPasswordError('')
    setSaveError('')
  }, [isOpen, teacher])

  // Fetch classes and subjects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchClasses()
      fetchSubjects()
    }
  }, [isOpen])

  // Populate assignments from teacher data once classes/subjects are loaded
  useEffect(() => {
    if (!isOpen || !teacher || classes.length === 0 || subjects.length === 0) return

    let rawAssignments = []

    if (Array.isArray(teacher.assignments) && teacher.assignments.length > 0) {
      rawAssignments = teacher.assignments
    } else if (Array.isArray(teacher.class_assignment) && teacher.class_assignment.length > 0) {
      rawAssignments = teacher.class_assignment
    } else if (teacher.teacher_assignments && teacher.teacher_assignments.length > 0) {
      const classSubjectMap = {}
      teacher.teacher_assignments.forEach(ta => {
        const classId = ta.class?.id || ta.class_id || ta.class
        const subjectId = ta.subject?.id || ta.subject_id || ta.subject
        if (classId && subjectId) {
          if (!classSubjectMap[classId]) classSubjectMap[classId] = { class: classId, subjects: [] }
          if (!classSubjectMap[classId].subjects.includes(subjectId)) {
            classSubjectMap[classId].subjects.push(subjectId)
          }
        }
      })
      rawAssignments = Object.values(classSubjectMap)
    } else if (teacher.class_id && teacher.subject_ids?.length > 0) {
      rawAssignments = [{ class: teacher.class_id, subjects: teacher.subject_ids }]
    }

    if (rawAssignments.length === 0) return

    const normalized = rawAssignments.map(a => {
      const classValue = a.class ?? a.class_id
      const classId = typeof classValue === 'object' ? (classValue?.id || classValue?.uuid) : classValue
      const subjectSource = a.subjects ?? (a.subject ? [a.subject] : (a.subject_id ? [a.subject_id] : []))
      const subjectIds = subjectSource.map(s => (typeof s === 'object' ? (s?.id || s?.uuid) : s)).filter(Boolean)
      return { class: String(classId), subjects: subjectIds.map(String) }
    }).filter(a => a.class && a.subjects.length > 0)

    if (normalized.length > 0) {
      setFormData(prev => ({ ...prev, assignments: normalized }))
    }
  }, [isOpen, teacher, classes, subjects])

  const fetchClasses = async () => {
    setLoadingClasses(true)
    try {
      const response = await classesService.getClasses()
      const data = response.data || response || []
      setClasses(data.map(c => ({ id: String(c.id), name: c.name })))
    } catch {
      setClasses([])
    } finally {
      setLoadingClasses(false)
    }
  }

  const fetchSubjects = async () => {
    setLoadingSubjects(true)
    try {
      const response = await subjectsService.getSubjects()
      const data = response.data || response || []
      setSubjects(data.map(s => ({ id: String(s.id), name: s.name })))
    } catch {
      setSubjects([])
    } finally {
      setLoadingSubjects(false)
    }
  }

  const handleCreateClassSubjectSuccess = (type, createdId) => {
    if (type === 'class') {
      fetchClasses().then(() => {
        if (createdId) setNewAssignment(prev => ({ ...prev, class: String(createdId) }))
      })
    } else {
      fetchSubjects().then(() => {
        if (createdId) {
          const id = String(createdId)
          setNewAssignment(prev => ({
            ...prev,
            subjects: prev.subjects.includes(id) ? prev.subjects : [...prev.subjects, id]
          }))
        }
      })
    }
  }

  const handleAssignmentSubjectToggle = (subjectId) => {
    const id = String(subjectId)
    setNewAssignment(prev => ({
      ...prev,
      subjects: prev.subjects.includes(id)
        ? prev.subjects.filter(s => s !== id)
        : [...prev.subjects, id]
    }))
  }

  const addAssignment = () => {
    if (!newAssignment.class || newAssignment.subjects.length === 0) return
    setFormData(prev => {
      const existingIdx = prev.assignments.findIndex(a => String(a.class) === String(newAssignment.class))
      if (existingIdx >= 0) {
        const updated = [...prev.assignments]
        const merged = [...new Set([...updated[existingIdx].subjects, ...newAssignment.subjects])]
        updated[existingIdx] = { ...updated[existingIdx], subjects: merged }
        return { ...prev, assignments: updated }
      }
      return { ...prev, assignments: [...prev.assignments, { class: String(newAssignment.class), subjects: [...newAssignment.subjects] }] }
    })
    setNewAssignment({ class: '', subjects: [] })
  }

  const removeAssignment = (index) => {
    setFormData(prev => ({ ...prev, assignments: prev.assignments.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveError('')

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match')
        return
      }
      if (formData.password && formData.password.length < 8) {
        setPasswordError('Password must be at least 8 characters long')
        return
      }
    }
    setPasswordError('')

    // Collect all assignments (include pending newAssignment if filled)
    let allAssignments = [...formData.assignments]
    if (newAssignment.class && newAssignment.subjects.length > 0) {
      const existingIdx = allAssignments.findIndex(a => String(a.class) === String(newAssignment.class))
      if (existingIdx >= 0) {
        const merged = [...new Set([...allAssignments[existingIdx].subjects, ...newAssignment.subjects])]
        allAssignments[existingIdx] = { ...allAssignments[existingIdx], subjects: merged }
      } else {
        allAssignments.push({ class: newAssignment.class, subjects: [...newAssignment.subjects] })
      }
    }

    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      isClassTeacher: formData.isClassTeacher,
      employeeId: formData.employeeId,
      assignments: allAssignments,
    }
    if (formData.password) {
      submitData.password = formData.password
      submitData.confirmPassword = formData.confirmPassword
    }

    const saveHandler = onSubmit || onSave
    setSaving(true)
    try {
      await saveHandler(submitData)
      // Parent (Teachers.jsx handleAddTeacher) calls setShowAddModal(false) on success,
      // so we don't call onClose here — it's handled by the parent after success.
    } catch (err) {
      setSaveError(err?.message || 'Failed to save teacher. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Last name (optional)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="teacher@school.edu"
                    required
                  />
                </div>
                {!teacher && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={e => { setFormData(prev => ({ ...prev, password: e.target.value })); setPasswordError('') }}
                        className={`w-full px-3 py-2 border ${passwordError ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm`}
                        placeholder="Min. 8 characters"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={e => { setFormData(prev => ({ ...prev, confirmPassword: e.target.value })); setPasswordError('') }}
                        className={`w-full px-3 py-2 border ${passwordError ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm`}
                        placeholder="Repeat password"
                        required
                      />
                    </div>
                    {passwordError && (
                      <p className="md:col-span-2 text-sm text-red-600 -mt-2">{passwordError}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Class & Subject Assignments */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Class &amp; Subject Assignments</h4>
              <p className="text-xs text-gray-500 mb-3">Assign this teacher to one or more classes and subjects.</p>

              {/* Saved assignments list */}
              {formData.assignments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.assignments.map((assignment, index) => {
                    const cls = classes.find(c => String(c.id) === String(assignment.class))
                    const subjectNames = assignment.subjects
                      .map(sid => subjects.find(s => String(s.id) === String(sid))?.name || sid)
                      .join(', ')
                    return (
                      <div key={index} className="flex items-center justify-between px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{cls?.name || assignment.class}</span>
                          <span className="text-gray-500 ml-2">— {subjectNames}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAssignment(index)}
                          className="text-red-400 hover:text-red-600 ml-3 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* New assignment builder */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {/* Class selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-600">Class</label>
                      <button
                        type="button"
                        onClick={() => { setCreateClassSubjectType('class'); setShowCreateClassSubjectModal(true) }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 underline"
                      >
                        + New class
                      </button>
                    </div>
                    <select
                      value={newAssignment.class}
                      onChange={e => setNewAssignment(prev => ({ ...prev, class: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loadingClasses}
                    >
                      <option value="">{loadingClasses ? 'Loading…' : 'Select class'}</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subject multi-select */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-600">Subjects</label>
                      <button
                        type="button"
                        onClick={() => { setCreateClassSubjectType('subject'); setShowCreateClassSubjectModal(true) }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 underline"
                      >
                        + New subject
                      </button>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-2 max-h-32 overflow-y-auto">
                      {loadingSubjects ? (
                        <p className="text-xs text-gray-400 py-2 text-center">Loading…</p>
                      ) : subjects.length === 0 ? (
                        <p className="text-xs text-gray-400 py-2 text-center">No subjects available</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-1">
                          {subjects.map(subject => (
                            <label key={subject.id} className="flex items-center gap-1.5 cursor-pointer text-xs min-w-0">
                              <input
                                type="checkbox"
                                checked={newAssignment.subjects.includes(String(subject.id))}
                                onChange={() => handleAssignmentSubjectToggle(subject.id)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                              />
                              <span className="text-gray-700 min-w-0 break-words leading-snug">{subject.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addAssignment}
                  disabled={!newAssignment.class || newAssignment.subjects.length === 0}
                  className="flex items-center px-3 py-1.5 text-sm text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#00167a' }}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Class & Subjects
                </button>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Details</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={e => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="e.g. GYB-12345"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isClassTeacher}
                    onChange={e => setFormData(prev => ({ ...prev, isClassTeacher: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Is Class Teacher
                    {formData.isClassTeacher && formData.assignments.length > 0 && (
                      <span className="font-normal text-gray-500 ml-1">
                        (for {classes.find(c => String(c.id) === String(formData.assignments[0].class))?.name || 'first assigned class'})
                      </span>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Error message */}
            {saveError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {saveError}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
                style={{ backgroundColor: '#00167a' }}
              >
                {saving && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saving ? 'Saving…' : 'Save Teacher'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showCreateClassSubjectModal && (
        <CreateClassSubjectModal
          isOpen={showCreateClassSubjectModal}
          onClose={() => setShowCreateClassSubjectModal(false)}
          onSuccess={handleCreateClassSubjectSuccess}
          initialType={createClassSubjectType}
        />
      )}
    </div>
  )
}

export default AddTeacherModal
