import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import classesService from '../services/classesService'
import subjectsService from '../services/subjectsService'

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

  const [newAssignment, setNewAssignment] = useState({
    class: '',
    subjects: []
  })

  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Pre-fill form when editing a teacher
  useEffect(() => {
    if (isOpen && teacher) {
      setFormData({
        firstName: teacher.firstName || teacher.first_name || '',
        lastName: teacher.lastName || teacher.last_name || '',
        email: teacher.email || '',
        password: '', // Don't pre-fill password for security
        confirmPassword: '',
        employeeId: teacher.employeeId || teacher.employee_id || '',
        isClassTeacher: teacher.isClassTeacher || teacher.is_class_teacher || false,
        assignments: teacher.assignments || teacher.classes || []
      })
      setNewAssignment({ class: '', subjects: [] })
    } else if (isOpen && !teacher) {
      // Reset form when adding new teacher
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
  }, [isOpen, teacher])

  // Fetch classes and subjects from API when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchClasses()
      fetchSubjects()
    }
  }, [isOpen])

  // Normalize assignments when editing - map names to IDs after classes and subjects are loaded
  useEffect(() => {
    if (isOpen && teacher && classes.length > 0 && subjects.length > 0) {
      const rawAssignments = teacher.assignments || teacher.classes || []
      if (rawAssignments.length === 0) return

      const normalizedAssignments = rawAssignments.map(assignment => {
        // Find class by ID or name
        let classId = assignment.class
        if (typeof assignment.class === 'string' || typeof assignment.class === 'number') {
          // Check if it's already an ID
          const foundClass = classes.find(c => c.id === assignment.class || c.id?.toString() === assignment.class?.toString())
          if (foundClass) {
            classId = foundClass.id
          } else {
            // Try to find by name
            const foundByName = classes.find(c => c.name === assignment.class || c.name?.toString() === assignment.class?.toString())
            if (foundByName) {
              classId = foundByName.id
            }
          }
        } else if (assignment.class && typeof assignment.class === 'object') {
          classId = assignment.class.id || assignment.class.class_id || assignment.class
        }

        // Normalize subjects - handle both IDs and names
        const normalizedSubjects = []
        if (Array.isArray(assignment.subjects)) {
          assignment.subjects.forEach(subj => {
            if (typeof subj === 'string' || typeof subj === 'number') {
              // Check if it's already an ID
              const foundSubject = subjects.find(s => s.id === subj || s.id?.toString() === subj?.toString())
              if (foundSubject) {
                normalizedSubjects.push(foundSubject.id)
              } else {
                // Try to find by name
                const foundByName = subjects.find(s => s.name === subj || s.name?.toString() === subj?.toString())
                if (foundByName) {
                  normalizedSubjects.push(foundByName.id)
                } else {
                  // Keep original if not found
                  normalizedSubjects.push(subj)
                }
              }
            } else if (subj && typeof subj === 'object') {
              const subjectId = subj.id || subj.subject_id || subj
              const foundSubject = subjects.find(s => s.id === subjectId || s.id?.toString() === subjectId?.toString())
              if (foundSubject) {
                normalizedSubjects.push(foundSubject.id)
              } else {
                normalizedSubjects.push(subjectId)
              }
            } else {
              normalizedSubjects.push(subj)
            }
          })
        }

        return {
          class: classId,
          subjects: normalizedSubjects
        }
      }).filter(assignment => assignment.class && assignment.subjects.length > 0)

      // Only update if assignments were normalized
      if (normalizedAssignments.length > 0) {
        setFormData(prev => ({
          ...prev,
          assignments: normalizedAssignments
        }))

        // Auto-select the first assignment's class and subjects in the "Add New Assignment" section
        const firstAssignment = normalizedAssignments[0]
        if (firstAssignment && firstAssignment.class && firstAssignment.subjects.length > 0) {
          setNewAssignment({
            class: firstAssignment.class,
            subjects: [...firstAssignment.subjects]
          })
        }
      }
    }
  }, [isOpen, teacher, classes, subjects])

  const fetchClasses = async () => {
    setLoadingClasses(true)
    try {
      const response = await classesService.getClasses()
      // Extract data array from response
      const classesData = response.data || response || []
      // Store full class objects with IDs
      const classesWithIds = classesData.map(cls => ({
        id: cls.id,
        name: cls.name || cls
      }))
      setClasses(classesWithIds)
    } catch (error) {
      console.error('Failed to fetch classes:', error)
      // Fallback to empty array on error
      setClasses([])
    } finally {
      setLoadingClasses(false)
    }
  }

  const fetchSubjects = async () => {
    setLoadingSubjects(true)
    try {
      const response = await subjectsService.getSubjects()
      // Extract data array from response
      const subjectsData = response.data || response || []
      // Store full subject objects with IDs
      const subjectsWithIds = subjectsData.map(subject => ({
        id: subject.id,
        name: subject.name || subject
      }))
      setSubjects(subjectsWithIds)
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
      // Fallback to empty array on error
      setSubjects([])
    } finally {
      setLoadingSubjects(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Only validate password if it's provided (required for new teachers, optional for edits)
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
    const saveHandler = onSubmit || onSave
    
    // If editing and no password provided, don't include password in the data
    const submitData = { ...formData }
    if (teacher && !formData.password) {
      delete submitData.password
      delete submitData.confirmPassword
    }
    
    saveHandler(submitData)
    onClose()
  }

  const handleAssignmentSubjectChange = (subject) => {
    setNewAssignment(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

  const addAssignment = () => {
    if (newAssignment.class && newAssignment.subjects.length > 0) {
      setFormData(prev => ({
        ...prev,
        assignments: [...prev.assignments, { ...newAssignment }]
      }))
      setNewAssignment({ class: '', subjects: [] })
    }
  }

  const removeAssignment = (index) => {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-transparent ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/5 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter last name"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="teacher@school.edu"
                    required
                  />
                </div>
                
                {!teacher && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, password: e.target.value }))
                          setPasswordError('')
                        }}
                        className={`w-full px-3 py-2 border ${passwordError ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
                          setPasswordError('')
                        }}
                        className={`w-full px-3 py-2 border ${passwordError ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Confirm password"
                        required
                      />
                      {passwordError && (
                        <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Class & Subject Assignments */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Class & Subject Assignments</h4>
              
              {/* Existing Assignments */}
              {formData.assignments.map((assignment, index) => {
                const className = classes.find(c => c.id === assignment.class)?.name || assignment.class
                const subjectNames = assignment.subjects.map(subjId => {
                  const subject = subjects.find(s => s.id === subjId)
                  return subject?.name || subjId
                })
                return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                  <div>
                      <span className="font-medium text-gray-900">Class: {className}</span>
                      <span className="text-gray-600 ml-2">Subjects: {subjectNames.join(', ')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAssignment(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                )
              })}
              
              {/* Add New Assignment */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                    <select
                      value={newAssignment.class}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, class: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loadingClasses}
                    >
                      <option value="">{loadingClasses ? 'Loading classes...' : 'Select Class'}</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject(s)</label>
                    <div className="border border-gray-300 rounded-lg p-2 max-h-32 overflow-y-auto">
                      {loadingSubjects ? (
                        <div className="text-center text-sm text-gray-500 py-4">Loading subjects...</div>
                      ) : subjects.length === 0 ? (
                        <div className="text-center text-sm text-gray-500 py-4">No subjects available</div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1">
                          {subjects.map(subject => (
                            <label key={subject.id} className="flex items-center space-x-2 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                checked={newAssignment.subjects.includes(subject.id)}
                                onChange={() => handleAssignmentSubjectChange(subject.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{subject.name}</span>
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
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class & Subject
                </button>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Additional Details</h4>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isClassTeacher"
                    checked={formData.isClassTeacher}
                    onChange={(e) => setFormData(prev => ({ ...prev, isClassTeacher: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isClassTeacher" className="ml-2 text-sm font-medium text-gray-700">
                    Is Class Teacher?
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="GYB-12345"
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddTeacherModal
