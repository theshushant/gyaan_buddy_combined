import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const CreateClassModal = ({ isOpen, onClose, onSave, loading = false, error = null, classData = null }) => {
  const [formData, setFormData] = useState({
    name: ''
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Prefill form when classData is provided (edit mode)
  useEffect(() => {
    if (classData && isOpen) {
      setFormData({
        name: classData.name || ''
      })
      // Reset errors and touched states when modal opens with data
      setErrors({})
      setTouched({})
    } else if (!classData && isOpen) {
      // Reset form when opening in create mode
      setFormData({ name: '' })
      setErrors({})
      setTouched({})
    }
  }, [classData, isOpen])

  const isEditMode = !!classData

  // Validation function
  const validateField = (name, value) => {
    let error = ''
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Class name is required'
        } else if (value.trim().length < 2) {
          error = 'Class name must be at least 2 characters'
        } else if (value.trim().length > 100) {
          error = 'Class name must be 100 characters or less'
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
    }
  }

  const handleClose = () => {
    // Reset form on close
    setFormData({ name: '' })
    setErrors({})
    setTouched({})
    onClose()
  }

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-transparent ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/5 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Class' : 'Create New Class'}</h3>
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
              {isEditMode ? 'Update the class name below.' : 'Enter the class name to create a new class.'}
            </p>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 ${
                  touched.name && errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Class 9A, Class 10B"
                disabled={loading}
              />
              {touched.name && errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
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
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Class' : 'Create Class')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateClassModal

