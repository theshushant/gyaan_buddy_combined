import { useState } from 'react'
import { X, Calendar } from 'lucide-react'

const AddStudentModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rollNumber: '',
    dateOfBirth: '',
    gender: '',
    class: '',
    parentName: '',
    parentContact: '',
    subjects: []
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography']
  const classes = ['Class 9 - Section A', 'Class 9 - Section B', 'Class 10 - Section A', 'Class 10 - Section B', 'Class 11 - Section A', 'Class 11 - Section B', 'Class 12 - Section A', 'Class 12 - Section B']

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
        
      case 'class':
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
        
      case 'subjects':
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
      onSave(formData)
      onClose()
    }
  }

  const handleSubjectChange = (subject) => {
    const newSubjects = formData.subjects.includes(subject)
      ? formData.subjects.filter(s => s !== subject)
      : [...formData.subjects, subject]
    
    setFormData(prev => ({ ...prev, subjects: newSubjects }))
    
    // Trigger validation for subjects
    setTouched(prev => ({ ...prev, subjects: true }))
    const error = validateField('subjects', newSubjects)
    if (error) {
      setErrors(prev => ({ ...prev, subjects: error }))
    } else {
      setErrors(prev => ({ ...prev, subjects: '' }))
    }
  }

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Add New Student to Class</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <p className="text-sm text-gray-600 mb-6">Fill in the details below to add a new student.</p>
            
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
                    touched.subjects && errors.subjects ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <div className="space-y-2">
                      {subjects.map(subject => (
                        <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.subjects.includes(subject)}
                            onChange={() => handleSubjectChange(subject)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{subject}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Hold Ctrl/Cmd to select multiple subjects.</p>
                  </div>
                  {touched.subjects && errors.subjects && (
                    <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>
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
                    value={formData.class}
                    onChange={(e) => handleFieldChange('class', e.target.value)}
                    onBlur={() => handleFieldBlur('class')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 ${
                      touched.class && errors.class ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  {touched.class && errors.class && (
                    <p className="mt-1 text-sm text-red-600">{errors.class}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
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
                Add Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddStudentModal