import { useState, useEffect, useCallback } from 'react'
import { X, Upload } from 'lucide-react'

const CreateTopicModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdateLearnMode = null,
  loading = false,
  learnModeLoading = false,
  error = null,
  chapterData = null,
  selectedModule = null
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    due_date: '',
    max_questions: 10,
    theory: '',
    is_enabled: true,
    is_important: false
  })

  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoRemoved, setLogoRemoved] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (chapterData) {
        setFormData({
          title: chapterData.title || '',
          description: chapterData.description || '',
          order: chapterData.order || 1,
          due_date: chapterData.due_date || '',
          max_questions: chapterData.max_questions ?? 10,
          theory: chapterData.theory || '',
          is_enabled: chapterData.is_enabled !== undefined ? chapterData.is_enabled : true,
          is_important: chapterData.is_important !== undefined ? chapterData.is_important : false
        })
        
        if (chapterData.logo) {
          let logoUrl = chapterData.logo
          if (logoUrl && typeof logoUrl === 'string') {
            if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
            } else if (logoUrl.startsWith('/')) {
              const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000'
              const cleanBaseUrl = baseUrl.replace('/api', '')
              logoUrl = `${cleanBaseUrl}${logoUrl}`
            }
            setLogoPreview(logoUrl)
          } else {
            setLogoPreview(null)
          }
        } else {
          setLogoPreview(null)
        }
        setLogoFile(null)
        setLogoRemoved(false)
        setErrors({})
        setTouched({})
      } else {
        setFormData({
          title: '',
          description: '',
          order: 1,
          due_date: '',
          max_questions: 10,
          theory: '',
          is_enabled: true,
          is_important: false
        })
        setLogoFile(null)
        setLogoPreview(null)
        setLogoRemoved(false)
        setErrors({})
        setTouched({})
      }
    }
  }, [chapterData, isOpen])

  const handleClose = useCallback(() => {
    if (loading) return
    
    setFormData({
      title: '',
      description: '',
      order: 1,
      due_date: '',
      max_questions: 10,
      theory: '',
      is_enabled: true,
      is_important: false
    })
    setLogoFile(null)
    setLogoPreview(null)
    setErrors({})
    setTouched({})
    onClose()
  }, [loading, onClose])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, loading, handleClose])

  const isEditMode = !!chapterData

  const validateField = (name, value) => {
    let error = ''
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          error = 'Topic title is required'
        } else if (value.trim().length < 2) {
          error = 'Topic title must be at least 2 characters'
        } else if (value.trim().length > 200) {
          error = 'Topic title must be 200 characters or less'
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

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please select a valid image file' }))
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'Image size must be less than 5MB' }))
        return
      }
      
      setLogoFile(file)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.logo
        return newErrors
      })
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setLogoRemoved(true)
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.logo
      return newErrors
    })
    const fileInput = document.getElementById('topic-logo-upload')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const allTouched = {}
    Object.keys(formData).forEach(field => {
      allTouched[field] = true
    })
    setTouched(allTouched)
    
    if (validateForm()) {
      const dataToSave = { ...formData }
      if (logoFile) {
        dataToSave.logo = logoFile
      } else if (logoRemoved) {
        dataToSave.logo = null
      }
      onSave(dataToSave)
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
                {isEditMode ? 'Edit Topic' : 'Create New Topic'}
              </h3>
              {selectedModule && (
                <p className="text-sm text-gray-500 mt-1">
                  Chapter: {selectedModule.title || selectedModule.name}
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
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Topic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    onBlur={() => handleFieldBlur('title')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      touched.description && errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Brief description of the topic..."
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      touched.order && errors.order ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1"
                    disabled={loading}
                  />
                  {touched.order && errors.order && (
                    <p className="mt-1 text-sm text-red-600">{errors.order}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Order determines the sequence of topics within the chapter
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleFieldChange('due_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Setting a due date marks this topic as active for students
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.max_questions}
                    onChange={(e) => handleFieldChange('max_questions', parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum number of questions shown to students per attempt
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theory Content (Optional)
                  </label>
                  <textarea
                    value={formData.theory}
                    onChange={(e) => handleFieldChange('theory', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter theory or reading material for this topic..."
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Topic Logo</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    id="topic-logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <label
                    htmlFor="topic-logo-upload"
                    className={`flex items-center px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      errors.logo
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 hover:border-primary-500 hover:bg-primary-500/10'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className={`h-5 w-5 mr-2 ${errors.logo ? 'text-red-400' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${errors.logo ? 'text-red-600' : 'text-gray-700'}`}>
                      {logoFile ? logoFile.name : 'Choose image file'}
                    </span>
                  </label>
                </div>

                {logoPreview && (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {errors.logo && (
                  <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
                )}
                <p className="text-xs text-gray-500">
                  Upload an image for the topic logo (optional). Max size: 5MB
                </p>
              </div>
            </div>

            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading || learnModeLoading}
              >
                Cancel
              </button>
              {isEditMode && onUpdateLearnMode && (
                <button
                  type="button"
                  onClick={() => onUpdateLearnMode(chapterData)}
                  className="px-4 py-2 border rounded-lg transition-colors"
                  style={{ borderColor: '#00167a', color: '#00167a' }}
                  disabled={loading || learnModeLoading}
                >
                  {learnModeLoading ? 'Updating Learn Mode...' : 'Update Learn Mode'}
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#00167a' }}
                disabled={loading || learnModeLoading}
              >
                {loading
                  ? (isEditMode ? 'Updating...' : 'Creating...')
                  : (isEditMode ? 'Update Topic' : 'Create Topic')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTopicModal
