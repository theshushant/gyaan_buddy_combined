import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

const CreateChapterModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  loading = false, 
  error = null, 
  chapterData = null, 
  selectedModule = null 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    is_enabled: true,
    is_important: false
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Prefill form when chapterData is provided (edit mode)
  useEffect(() => {
    if (isOpen) {
      if (chapterData) {
        setFormData({
          title: chapterData.title || '',
          description: chapterData.description || '',
          order: chapterData.order || 1,
          is_enabled: chapterData.is_enabled !== undefined ? chapterData.is_enabled : true,
          is_important: chapterData.is_important !== undefined ? chapterData.is_important : false
        })
        setErrors({})
        setTouched({})
      } else {
        setFormData({
          title: '',
          description: '',
          order: 1,
          is_enabled: true,
          is_important: false
        })
        setErrors({})
        setTouched({})
      }
    }
  }, [chapterData, isOpen])

  const handleClose = useCallback(() => {
    if (loading) return
    
    // Reset form on close
    setFormData({
      title: '',
      description: '',
      order: 1,
      is_enabled: true,
      is_important: false
    })
    setErrors({})
    setTouched({})
    onClose()
  }, [loading, onClose])

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, loading, handleClose])

  const isEditMode = !!chapterData

  // Validation function
  const validateField = (name, value) => {
    let error = ''
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          error = 'Chapter title is required'
        } else if (value.trim().length < 2) {
          error = 'Chapter title must be at least 2 characters'
        } else if (value.trim().length > 200) {
          error = 'Chapter title must be 200 characters or less'
        }
        break
      case 'order':
        if (value < 1) {
          error = 'Order must be at least 1'
        }
        break
      case 'description':
        if (value && value.length > 500) {
          error = 'Description must be 500 characters or less'
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
      if (field !== 'is_enabled' && field !== 'is_important') {
        const error = validateField(field, formData[field])
        if (error) {
          newErrors[field] = error
        }
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

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-transparent ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/5 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Edit Chapter' : 'Create New Chapter'}
              </h3>
              {selectedModule && (
                <p className="text-sm text-gray-500 mt-1">
                  Module: {selectedModule.title || selectedModule.name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Chapter Information */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Chapter Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    onBlur={() => handleFieldBlur('title')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      touched.title && errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Introduction to Algebra, Basic Concepts"
                    disabled={loading}
                  />
                  {touched.title && errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    onBlur={() => handleFieldBlur('description')}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      touched.description && errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Brief description of the chapter..."
                    disabled={loading}
                  />
                  {touched.description && errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 1)}
                    onBlur={() => handleFieldBlur('order')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      touched.order && errors.order ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1"
                    disabled={loading}
                  />
                  {touched.order && errors.order && (
                    <p className="mt-1 text-sm text-red-600">{errors.order}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Order determines the sequence of chapters within the module
                  </p>
                </div>
              </div>
            </div>

            {/* Chapter Settings */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Chapter Settings</h4>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_enabled"
                    checked={formData.is_enabled}
                    onChange={(e) => handleFieldChange('is_enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="is_enabled" className="ml-2 text-sm font-medium text-gray-700">
                    Enabled
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_important"
                    checked={formData.is_important}
                    onChange={(e) => handleFieldChange('is_important', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="is_important" className="ml-2 text-sm font-medium text-gray-700">
                    Important
                  </label>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading 
                  ? (isEditMode ? 'Updating...' : 'Creating...') 
                  : (isEditMode ? 'Update Chapter' : 'Create Chapter')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateChapterModal
