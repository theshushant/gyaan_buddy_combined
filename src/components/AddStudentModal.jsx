import { useState, useEffect, useCallback } from 'react'
import { X, Calendar } from 'lucide-react'
import classesService from '../services/classesService'
import subjectsService from '../services/subjectsService'

const AddStudentModal = ({ isOpen, onClose, onSave, loading = false, error = null, student = null, title = 'Add New Student' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rollNumber: '',
    dateOfBirth: '',
    gender: '',
    classId: '', // Store class ID instead of name
    parentName: '',
    parentContact: '',
    subjectIds: [] // Store subject IDs instead of names
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [classes, setClasses] = useState([]) // Array of class objects with id and name
  const [subjects, setSubjects] = useState([]) // Array of subject objects with id and name
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true)
    try {
      const response = await classesService.getClasses()
      // Extract data array from response
      const classesData = response.data || response || []
      // Store full class objects (with id and name)
      const classesList = classesData.map(cls => ({
        id: cls.id || cls.uuid,
        name: cls.name || cls
      })).filter(cls => cls.id && cls.name) // Filter out invalid entries
      setClasses(classesList)
    } catch (error) {
      console.error('Failed to fetch classes:', error)
      // Fallback to empty array on error
      setClasses([])
    } finally {
      setLoadingClasses(false)
    }
  }, [])

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true)
    try {
      const response = await subjectsService.getSubjects()
      // Extract data array from response
      const subjectsData = response.data || response || []
      // Store full subject objects (with id and name)
      const subjectsList = subjectsData.map(subject => ({
        id: subject.id || subject.uuid,
        name: subject.name || subject
      })).filter(subject => subject.id && subject.name) // Filter out invalid entries
      setSubjects(subjectsList)
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
      // Fallback to empty array on error
      setSubjects([])
    } finally {
      setLoadingSubjects(false)
    }
  }, [])

  // Fetch classes and subjects from API when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchClasses()
      fetchSubjects()
    }
  }, [isOpen, fetchClasses, fetchSubjects])

  // Pre-fill form when editing a student
  useEffect(() => {
    if (isOpen && student) {
      // Format date of birth (handle both YYYY-MM-DD and danger date formats)
      let dateOfBirth = ''
      if (student.date_of_birth || student.dateOfBirth) {
        const dob = student.date_of_birth || student.dateOfBirth
        // If it's already in YYYY-MM-DD format, use it directly
        if (dob.includes('T')) {
          dateOfBirth = dob.split('T')[0]
        } else if (dob.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateOfBirth = dob
        } else {
          // Try to parse and format
          try {
            const date = new Date(dob)
            dateOfBirth = date.toISOString().split('T')[0]
          } catch (e) {
            dateOfBirth = ''
          }
        }
      }

      // Get class ID - handle both nested class object and direct class_id
      let classId = ''
      if (student.class_id || student.classId) {
        classId = student.class_id || student.classId
      } else if (student.class_instance) {
        // Handle class_instance UUID from backend
        classId = student.class_instance
      } else if (student.class && typeof student.class === 'object' && student.class.id) {
        classId = student.class.id
      } else if (student.profile?.class_instance?.id) {
        // Handle nested profile structure from backend
        classId = student.profile.class_instance.id
      } else if (student.class && typeof student.class === 'string') {
        // If class is a string, we'll try to find it in the classes list
        const foundClass = classes.find(c => c.name === student.class)
        if (foundClass) {
          classId = foundClass.id
        }
      }

      // Get subject IDs - handle both array of objects and array of IDs
      let subjectIds = []
      if (student.subject_ids || student.subjectIds) {
        const subjectIdsArray = student.subject_ids || student.subjectIds
        subjectIds = subjectIdsArray.map(subj => {
          if (typeof subj === 'object' && (subj.id || subj.uuid)) {
            return subj.id || subj.uuid
          }
          return subj
        })
      } else if (student.subjects && Array.isArray(student.subjects)) {
        subjectIds = student.subjects.map(subj => {
          if (typeof subj === 'object' && (subj.id || subj.uuid)) {
            return subj.id || subj.uuid
          }
          // If subject is just a string (name), we need to find it in the subjects list
          if (typeof subj === 'string') {
            const foundSubject = subjects.find(s => s.name === subj || s.id === subj)
            return foundSubject ? foundSubject.id : null
          }
          return subj
        }).filter(id => id !== null) // Remove null values
      }

      // Get parent contact - prioritize email, then phone_number
      let parentContact = ''
      if (student.email) {
        parentContact = student.email
      } else if (student.phone_number || student.phoneNumber) {
        parentContact = student.phone_number || student.phoneNumber
      } else if (student.parent_contact || student.parentContact) {
        parentContact = student.parent_contact || student.parentContact
      }

      setFormData({
        firstName: student.first_name || student.firstName || '',
        lastName: student.last_name || student.lastName || '',
        rollNumber: student.roll_number?.toString() || student.rollNumber?.toString() || '',
        dateOfBirth: dateOfBirth,
        gender: student.gender || '',
        classId: classId.toString() || '',
        parentName: student.parent_name || student.parentName || '',
        parentContact: parentContact,
        subjectIds: subjectIds
      })
    } else if (isOpen && !student) {
      // Reset form when opening for add mode
      setFormData({
        firstName: '',
        lastName: '',
        rollNumber: '',
        dateOfBirth: '',
        gender: '',
        classId: '',
        parentName: '',
        parentContact: '',
        subjectIds: []
      })
      setErrors({})
      setTouched({})
    }
  }, [isOpen, student, classes])

  // Validation functions
  const validateField = (name, value) => {
    let error = ''
    
    switch (name) {
      case 'firstName':
      case 'lastName':
      case 'parentName':
        if (!value.trim()) {
          error = `${name === 'parentName' ? 'Parent/Guardian name' : name.charAt(0).toUpperCase() + name.slice(1)} is required`
        } else if (value.trim().length < 2) {
          error = `${name === 'parentName' ? 'Parent/Guardian name' : name.charAt(0).toUpperCase() + name.slice(1)} must be at least 2 characters`
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          error = `${name === 'parentName' ? 'Parent/Guardian name' : name.charAt(0).toUpperCase() + name.slice(1)} can only contain letters and spaces`
        }
        break
        
      case 'rollNumber':
        if (!value.trim()) {
          error = 'Roll number is required'
        } else if (!/^\d+$/.test(value.trim())) {
          error = 'Roll number must contain only numbers'
        } else if (value.trim().length < 3) {
          error = 'Roll number must be at least 3 digits'
        }
        break
        
      case 'dateOfBirth':
        if (!value) {
          error = 'Date of birth is required'
        } else {
          const birthDate = new Date(value)
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          if (age < 5 || age > 25) {
            error = 'Student age must be between 5 and 25 years'
          }
        }
        break
        
      case 'gender':
        if (!value) {
          error = 'Gender is required'
        }
        break
        
      case 'classId':
        if (!value) {
          error = 'Class is required'
        }
        break
        
      case 'parentContact':
        if (!value.trim()) {
          error = 'Parent/Guardian contact is required'
        } else if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(value.trim()) && !/^[\+]?[1-9][\d]{0,15}$/.test(value.trim())) {
          error = 'Please enter a valid email address or phone number'
        }
        break
        
      case 'subjectIds':
        if (!value || value.length === 0) {
          error = 'At least one subject must be selected'
        }
        break
        
      default:
        break
    }
    
    return error
  }

  const validateForm = () => {
    const newErrors = {}
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Mark all fields as touched
    const allTouched = {}
    Object.keys(formData).forEach(field => {
      allTouched[field] = true
    })
    setTouched(allTouched)
    
    if (validateForm()) {
      // Prepare data with all required fields properly mapped
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        rollNumber: formData.rollNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        classId: formData.classId,
        class_id: formData.classId,
        parentName: formData.parentName,
        parentContact: formData.parentContact,
        subjectIds: formData.subjectIds,
        subject_ids: formData.subjectIds
      }
      onSave(submitData)
      // Don't close modal here - let parent handle it after successful API call
    }
  }

  const handleClose = () => {
    // Reset form on close (only if not editing to avoid clearing data prematurely)
    if (!student) {
      setFormData({
        firstName: '',
        lastName: '',
        rollNumber: '',
        dateOfBirth: '',
        gender: '',
        classId: '',
        parentName: '',
        parentContact: '',
        subjectIds: []
      })
      setErrors({})
      setTouched({})
    }
    onClose()
  }

  const handleSubjectChange = (subjectId) => {
    const newSubjectIds = formData.subjectIds.includes(subjectId)
      ? formData.subjectIds.filter(id => id !== subjectId)
      : [...formData.subjectIds, subjectId]
    
    setFormData(prev => ({ ...prev, subjectIds: newSubjectIds }))
    
    // Trigger validation for subjects
    setTouched(prev => ({ ...prev, subjectIds: true }))
    const error = validateField('subjectIds', newSubjectIds)
    if (error) {
      setErrors(prev => ({ ...prev, subjectIds: error }))
    } else {
      setErrors(prev => ({ ...prev, subjectIds: '' }))
    }
  }

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-transparent ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/5 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <p className="text-sm text-gray-600 mb-6">
              {student ? 'Update the student details below.' : 'Fill in the details below to add a new student.'}
            </p>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    onBlur={() => handleFieldBlur('firstName')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 ${
                      touched.firstName && errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                  <input
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => handleFieldChange('rollNumber', e.target.value)}
                    onBlur={() => handleFieldBlur('rollNumber')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 ${
                      touched.rollNumber && errors.rollNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter roll number"
                  />
                  {touched.rollNumber && errors.rollNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.rollNumber}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                    onBlur={() => handleFieldBlur('gender')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 ${
                      touched.gender && errors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {touched.gender && errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => handleFieldChange('parentName', e.target.value)}
                    onBlur={() => handleFieldBlur('parentName')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 ${
                      touched.parentName && errors.parentName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter parent/guardian name"
                  />
                  {touched.parentName && errors.parentName && (
                    <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Contact (Email/Phone)</label>
                  <input
                    type="text"
                    value={formData.parentContact}
                    onChange={(e) => handleFieldChange('parentContact', e.target.value)}
                    onBlur={() => handleFieldBlur('parentContact')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 ${
                      touched.parentContact && errors.parentContact ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email or phone number"
                  />
                  {touched.parentContact && errors.parentContact && (
                    <p className="mt-1 text-sm text-red-600">{errors.parentContact}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                  <div className={`border rounded-lg p-3 bg-gray-50 min-h-[120px] ${
                    touched.subjectIds && errors.subjectIds ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    {loadingSubjects ? (
                      <div className="text-center text-sm text-gray-500 py-4">Loading subjects...</div>
                    ) : subjects.length === 0 ? (
                      <div className="text-center text-sm text-gray-500 py-4">No subjects available</div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {subjects.map(subject => (
                            <label key={subject.id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.subjectIds.includes(subject.id)}
                                onChange={() => handleSubjectChange(subject.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{subject.name}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Hold Ctrl/Cmd to select multiple subjects.</p>
                      </>
                    )}
                  </div>
                  {touched.subjectIds && errors.subjectIds && (
                    <p className="mt-1 text-sm text-red-600">{errors.subjectIds}</p>
                  )}
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    onBlur={() => handleFieldBlur('lastName')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 ${
                      touched.lastName && errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                      onBlur={() => handleFieldBlur('dateOfBirth')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 ${
                        touched.dateOfBirth && errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {touched.dateOfBirth && errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => handleFieldChange('classId', e.target.value)}
                    onBlur={() => handleFieldBlur('classId')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 ${
                      touched.classId && errors.classId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loadingClasses}
                  >
                    <option value="">{loadingClasses ? 'Loading classes...' : 'Select Class'}</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  {touched.classId && errors.classId && (
                    <p className="mt-1 text-sm text-red-600">{errors.classId}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (student ? 'Updating...' : 'Adding...') : (student ? 'Update Student' : 'Add Student')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddStudentModal