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

  const [newAssignment, setNewAssignment] = useState({
    class: '',
    subjects: []
  })

  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showCreateClassSubjectModal, setShowCreateClassSubjectModal] = useState(false)
  const [createClassSubjectType, setCreateClassSubjectType] = useState('class')

  // Pre-fill form when editing a teacher
  useEffect(() => {
    if (isOpen && teacher) {
      console.log('AddTeacherModal: Teacher data received:', {
        teacher,
        hasAssignments: !!teacher.assignments,
        assignments: teacher.assignments,
        hasTeacherAssignments: !!teacher.teacher_assignments,
        teacher_assignments: teacher.teacher_assignments,
        hasClasses: !!teacher.classes,
        classes: teacher.classes
      })
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
      console.log('AddTeacherModal: Initial formData.assignments set to:', teacher.assignments || teacher.classes || [])
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
      // First, try to get assignments from teacher_assignments (backend format)
      let rawAssignments = teacher.assignments || teacher.classes || []
      
      // If no assignments but we have teacher_assignments, convert them
      if (rawAssignments.length === 0 && teacher.teacher_assignments && teacher.teacher_assignments.length > 0) {
        const classSubjectMap = {}
        teacher.teacher_assignments.forEach(ta => {
          const classId = ta.class?.id || ta.class_id || ta.class
          const subjectId = ta.subject?.id || ta.subject_id || ta.subject
          
          if (classId && subjectId) {
            const key = classId
            if (!classSubjectMap[key]) {
              classSubjectMap[key] = {
                class: classId,
                subjects: []
              }
            }
            if (!classSubjectMap[key].subjects.includes(subjectId)) {
              classSubjectMap[key].subjects.push(subjectId)
            }
          }
        })
        rawAssignments = Object.values(classSubjectMap)
      }
      
      // If still no assignments but we have class_id and subject_ids, create an assignment
      if (rawAssignments.length === 0 && teacher.class_id && teacher.subject_ids && teacher.subject_ids.length > 0) {
        rawAssignments = [{
          class: teacher.class_id,
          subjects: teacher.subject_ids
        }]
      }
      
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
      console.log('AddTeacherModal: Normalized assignments:', normalizedAssignments)
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

  const handleCreateClassSubjectSuccess = (type, createdId) => {
    // Refresh the appropriate list after creation
    if (type === 'class') {
      fetchClasses().then(() => {
        // Auto-select the newly created class
        if (createdId) {
          setNewAssignment(prev => ({ ...prev, class: createdId }))
        }
      })
    } else {
      fetchSubjects().then(() => {
        // Auto-select the newly created subject
        if (createdId) {
          setNewAssignment(prev => ({
            ...prev,
            subjects: prev.subjects.includes(createdId)
              ? prev.subjects
              : [...prev.subjects, createdId]
          }))
        }
      })
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
    
    // If editing and no password provided, don't include password in the data
    const submitData = { ...formData }
    if (teacher && !formData.password) {
      delete submitData.password
      delete submitData.confirmPassword
    }
    
    // Ensure assignments are always included in the payload
    // Use formData.assignments if they exist, otherwise try to preserve from original teacher data
    console.log('AddTeacherModal: formData.assignments before processing:', formData.assignments)
    console.log('AddTeacherModal: newAssignment before processing:', newAssignment)
    console.log('AddTeacherModal: submitData.assignments before processing:', submitData.assignments)
    
    // If newAssignment has values but wasn't added to formData.assignments, include it
    let assignmentsToProcess = [...(submitData.assignments || [])]
    if (newAssignment.class && newAssignment.subjects && newAssignment.subjects.length > 0) {
      console.log('AddTeacherModal: newAssignment has values, adding to assignments:', newAssignment)
      assignmentsToProcess.push({ ...newAssignment })
    }
    
    if (assignmentsToProcess.length > 0) {
      // Merge assignments with the same class to combine all subjects
      const classSubjectMap = {}
      assignmentsToProcess.forEach(assignment => {
        const classId = assignment.class?.toString() || assignment.class
        if (classId) {
          if (!classSubjectMap[classId]) {
            classSubjectMap[classId] = {
              class: assignment.class,
              subjects: []
            }
          }
          // Merge subjects, ensuring uniqueness
          const subjects = Array.isArray(assignment.subjects) ? assignment.subjects : []
          subjects.forEach(subjId => {
            const subjIdStr = subjId?.toString() || subjId
            if (subjIdStr && !classSubjectMap[classId].subjects.some(s => (s?.toString() || s) === subjIdStr)) {
              classSubjectMap[classId].subjects.push(subjId)
            }
          })
        }
      })
      
      // Convert map back to array and ensure they're properly formatted
      submitData.assignments = Object.values(classSubjectMap).map((assignment, idx) => {
        console.log(`AddTeacherModal: Processing assignment ${idx}:`, {
          original: assignment,
          class: assignment.class,
          classType: typeof assignment.class,
          subjects: assignment.subjects,
          subjectsType: Array.isArray(assignment.subjects) ? typeof assignment.subjects[0] : 'not array'
        })
        return {
          class: assignment.class,
          subjects: Array.isArray(assignment.subjects) ? assignment.subjects : []
        }
      })
      console.log('AddTeacherModal: Processed and merged assignments:', submitData.assignments)
    } else if (teacher) {
      // If assignments are empty but we're editing, try to preserve from original teacher data
      if (teacher.assignments && teacher.assignments.length > 0) {
        submitData.assignments = teacher.assignments
      } else if (teacher.teacher_assignments && teacher.teacher_assignments.length > 0) {
        // Convert teacher_assignments format to assignments format
        const classSubjectMap = {}
        teacher.teacher_assignments.forEach(ta => {
          const classId = ta.class?.id || ta.class_id || ta.class
          const subjectId = ta.subject?.id || ta.subject_id || ta.subject
          
          if (classId && subjectId) {
            const key = classId
            if (!classSubjectMap[key]) {
              classSubjectMap[key] = {
                class: classId,
                subjects: []
              }
            }
            if (!classSubjectMap[key].subjects.includes(subjectId)) {
              classSubjectMap[key].subjects.push(subjectId)
            }
          }
        })
        submitData.assignments = Object.values(classSubjectMap)
      } else {
        // If no existing assignments, use newAssignment if it has values
        if (newAssignment.class && newAssignment.subjects && newAssignment.subjects.length > 0) {
          submitData.assignments = [{ ...newAssignment }]
        } else {
          submitData.assignments = []
        }
      }
    } else {
      // For new teachers, use newAssignment if it has values
      if (newAssignment.class && newAssignment.subjects && newAssignment.subjects.length > 0) {
        submitData.assignments = [{ ...newAssignment }]
      } else {
        submitData.assignments = submitData.assignments || []
      }
    }
    
    console.log('AddTeacherModal: Submitting data with assignments:', submitData.assignments)
    console.log('AddTeacherModal: Full submitData before saveHandler:', {
      ...submitData,
      assignments: submitData.assignments,
      isClassTeacher: submitData.isClassTeacher,
      firstName: submitData.firstName,
      lastName: submitData.lastName,
      email: submitData.email
    })
    
    const saveHandler = onSubmit || onSave
    saveHandler(submitData)
    onClose()
  }

  const handleAssignmentSubjectChange = (subject) => {
    setNewAssignment(prev => {
      const isSelected = prev.subjects.includes(subject)
      const updatedSubjects = isSelected
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
      console.log('AddTeacherModal: Subject changed:', {
        subjectId: subject,
        subjectIdType: typeof subject,
        isSelected,
        updatedSubjects,
        subjectName: subjects.find(s => s.id === subject)?.name
      })
      return {
        ...prev,
        subjects: updatedSubjects
      }
    })
  }

  const addAssignment = () => {
    if (newAssignment.class && newAssignment.subjects.length > 0) {
      console.log('AddTeacherModal: Adding assignment:', {
        class: newAssignment.class,
        classType: typeof newAssignment.class,
        subjects: newAssignment.subjects,
        subjectsType: typeof newAssignment.subjects[0]
      })
      setFormData(prev => {
        // Check if an assignment for this class already exists
        const existingIndex = prev.assignments.findIndex(
          a => a.class === newAssignment.class || a.class?.toString() === newAssignment.class?.toString()
        )
        
        let updatedAssignments
        if (existingIndex >= 0) {
          // Merge subjects with existing assignment
          const existingAssignment = prev.assignments[existingIndex]
          const mergedSubjects = [...new Set([
            ...(Array.isArray(existingAssignment.subjects) ? existingAssignment.subjects : []),
            ...newAssignment.subjects
          ])]
          console.log('AddTeacherModal: Merging subjects for existing class assignment:', {
            existingSubjects: existingAssignment.subjects,
            newSubjects: newAssignment.subjects,
            mergedSubjects
          })
          updatedAssignments = [...prev.assignments]
          updatedAssignments[existingIndex] = {
            ...existingAssignment,
            subjects: mergedSubjects
          }
        } else {
          // Add as new assignment
          updatedAssignments = [...prev.assignments, { ...newAssignment }]
        }
        console.log('AddTeacherModal: Updated formData.assignments:', updatedAssignments)
        return {
          ...prev,
          assignments: updatedAssignments
        }
      })
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
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Class</label>
                      <button
                        type="button"
                        onClick={() => {
                          setCreateClassSubjectType('class')
                          setShowCreateClassSubjectModal(true)
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Create Class
                      </button>
                    </div>
                    <select
                      value={newAssignment.class}
                      onChange={(e) => {
                        const selectedClassId = e.target.value
                        console.log('AddTeacherModal: Class selected:', {
                          classId: selectedClassId,
                          classIdType: typeof selectedClassId,
                          selectedClass: classes.find(c => c.id === selectedClassId || c.id?.toString() === selectedClassId)
                        })
                        setNewAssignment(prev => ({ ...prev, class: selectedClassId }))
                      }}
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
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Subject(s)</label>
                      <button
                        type="button"
                        onClick={() => {
                          setCreateClassSubjectType('subject')
                          setShowCreateClassSubjectModal(true)
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Create Subject
                      </button>
                    </div>
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

      {/* Create Class/Subject Modal */}
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
