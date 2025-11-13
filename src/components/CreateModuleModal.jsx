import { useState, useEffect, useCallback } from 'react'
import { X, BookOpen, FileText, Hash, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Upload } from 'lucide-react'
import subjectsService from '../services/subjectsService'
import apiService from '../services/api'

const CreateModuleModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  loading = false, 
  error = null, 
  moduleData = null, 
  selectedSubject = null 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    order: 1,
    is_active: true,
    is_enabled: false
  })

  const [subjects, setSubjects] = useState([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  // Fetch subjects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSubjects()
    }
  }, [isOpen])

  // Prefill form when moduleData is provided (edit mode) or selectedSubject is provided
  useEffect(() => {
    if (isOpen) {
      if (moduleData) {
        setFormData({
          name: moduleData.name || '',
          subject: moduleData.subject || moduleData.subject?.id || '',
          description: moduleData.description || '',
          order: moduleData.order || 1,
          is_active: moduleData.is_active !== undefined ? moduleData.is_active : true,
          is_enabled: moduleData.is_enabled !== undefined ? moduleData.is_enabled : false
        })
        // Set logo preview if logo exists
        if (moduleData.logo) {
          // Convert relative URL to full URL if needed
          let logoUrl = moduleData.logo
          if (logoUrl && typeof logoUrl === 'string') {
            // If it's already a full URL (http:// or https://), use it as is
            if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
              // Already a full URL, use as is
            } else if (logoUrl.startsWith('/')) {
              // If it's a relative URL (starts with /), prepend the API base URL
              // Remove /api from baseURL if present, as media files are served from root
              const baseUrl = apiService.baseURL.replace('/api', '')
              logoUrl = `${baseUrl}${logoUrl}`
            }
          }
          setLogoPreview(logoUrl)
        } else {
          setLogoPreview(null)
        }
        setLogoFile(null)
        setErrors({})
        setTouched({})
      } else if (selectedSubject) {
        setFormData({
          name: '',
          subject: selectedSubject,
          description: '',
          order: 1,
          is_active: true,
          is_enabled: false
        })
        setLogoFile(null)
        setLogoPreview(null)
        setErrors({})
        setTouched({})
      } else {
        setFormData({
          name: '',
          subject: '',
          description: '',
          order: 1,
          is_active: true,
          is_enabled: false
        })
        setLogoFile(null)
        setLogoPreview(null)
        setErrors({})
        setTouched({})
      }
    }
  }, [moduleData, selectedSubject, isOpen])

  const fetchSubjects = async () => {
    setLoadingSubjects(true)
    try {
      const response = await subjectsService.getSubjects()
      const subjectsData = response.data || response
      setSubjects(Array.isArray(subjectsData) ? subjectsData : [])
    } catch (err) {
      console.error('Failed to fetch subjects:', err)
      setSubjects([])
    } finally {
      setLoadingSubjects(false)
    }
  }

  const handleClose = useCallback(() => {
    if (loading) return
    
    // Reset form on close
    setFormData({
      name: '',
      subject: '',
      description: '',
      order: 1,
      is_active: true,
      is_enabled: false
    })
    setLogoFile(null)
    setLogoPreview(null)
    setErrors({})
    setTouched({})
    onClose()
  }, [loading, onClose])

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please select a valid image file' }))
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'Image size must be less than 5MB' }))
        return
      }
      
      setLogoFile(file)
      setErrors(prev => ({ ...prev, logo: '' }))
      
      // Create preview
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
    setErrors(prev => ({ ...prev, logo: '' }))
    // Reset file input
    const fileInput = document.getElementById('logo-upload')
    if (fileInput) {
      fileInput.value = ''
    }
  }

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

  const isEditMode = !!moduleData

  // Validation function
  const validateField = (name, value) => {
    let error = ''
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Module name is required'
        } else if (value.trim().length < 2) {
          error = 'Module name must be at least 2 characters'
        } else if (value.trim().length > 100) {
          error = 'Module name must be 100 characters or less'
        }
        break
      case 'subject':
        if (!value) {
          error = 'Subject is required'
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
      if (field !== 'is_active' && field !== 'is_enabled') {
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
      // Include logo file in form data
      const dataToSave = { ...formData }
      if (logoFile) {
        dataToSave.logo = logoFile
      }
      onSave(dataToSave)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100 overflow-hidden">
          {/* Header with gradient - Fixed */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-8 py-6 flex-shrink-0">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {isEditMode ? 'Edit Module' : 'Create New Module'}
                  </h3>
                  <p className="text-sm text-blue-100 mt-0.5">
                    {isEditMode ? 'Update module details' : 'Fill in the details to create a new module'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                disabled={loading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Form Content - Scrollable */}
          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-gray-50">
            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-3 animate-slide-down">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Module Information Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Module Information</h4>
              </div>
              
              <div className="space-y-6">
                {/* Subject Field */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span>Subject <span className="text-red-500">*</span></span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.subject}
                      onChange={(e) => handleFieldChange('subject', e.target.value)}
                      onBlur={() => handleFieldBlur('subject')}
                      className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none cursor-pointer ${
                        touched.subject && errors.subject 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${loading || loadingSubjects || !!selectedSubject ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={loading || loadingSubjects || !!selectedSubject}
                    >
                      <option value="">
                        {loadingSubjects ? 'Loading subjects...' : 'Select a subject'}
                      </option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <BookOpen className={`h-5 w-5 ${touched.subject && errors.subject ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    {loadingSubjects && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  {touched.subject && errors.subject && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.subject}</span>
                    </p>
                  )}
                </div>

                {/* Module Name Field */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Module Name <span className="text-red-500">*</span></span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      onBlur={() => handleFieldBlur('name')}
                      className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        touched.name && errors.name 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      placeholder="e.g., Algebra Basics, Introduction to Physics"
                      disabled={loading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <FileText className={`h-5 w-5 ${touched.name && errors.name ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    {touched.name && !errors.name && formData.name && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {touched.name && errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Description Field */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Description <span className="text-xs font-normal text-gray-500">(Optional)</span></span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    onBlur={() => handleFieldBlur('description')}
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                      touched.description && errors.description 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    placeholder="Brief description of what this module covers..."
                    disabled={loading}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {touched.description && errors.description && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.description}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 ml-auto">
                      {formData.description.length}/500 characters
                    </p>
                  </div>
                </div>

                {/* Logo/Image Upload Field */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    <span>Logo <span className="text-xs font-normal text-gray-500">(Optional)</span></span>
                  </label>
                  <div className="space-y-3">
                    {/* File Input */}
                    <div className="relative">
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        disabled={loading}
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                          errors.logo
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                        } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <Upload className={`h-5 w-5 ${errors.logo ? 'text-red-400' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${errors.logo ? 'text-red-600' : 'text-gray-700'}`}>
                          {logoFile ? logoFile.name : 'Choose image file'}
                        </span>
                      </label>
                    </div>
                    
                    {/* Preview */}
                    {logoPreview && (
                      <div className="relative inline-block">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          disabled={loading}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {errors.logo && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.logo}</span>
                      </p>
                    )}
                    
                    {/* Help Text */}
                    <p className="text-xs text-gray-500">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </p>
                  </div>
                </div>

                {/* Order Field */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span>Order <span className="text-red-500">*</span></span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 1)}
                      onBlur={() => handleFieldBlur('order')}
                      className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        touched.order && errors.order 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      placeholder="1"
                      disabled={loading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Hash className={`h-5 w-5 ${touched.order && errors.order ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                  </div>
                  {touched.order && errors.order && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.order}</span>
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
                    <span>Order determines the sequence of modules within the subject</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Module Settings Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ToggleRight className="h-5 w-5 text-indigo-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Module Settings</h4>
              </div>
              
              <div className="space-y-5">
                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${formData.is_active ? 'bg-green-100' : 'bg-gray-200'}`}>
                      {formData.is_active ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <label htmlFor="is_active" className="text-sm font-semibold text-gray-900 cursor-pointer">
                        Active
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Module will be visible and accessible
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('is_active', !formData.is_active)}
                    disabled={loading}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      formData.is_active ? 'bg-green-500' : 'bg-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                        formData.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Enabled Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${formData.is_enabled ? 'bg-blue-100' : 'bg-gray-200'}`}>
                      {formData.is_enabled ? (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <label htmlFor="is_enabled" className="text-sm font-semibold text-gray-900 cursor-pointer">
                        Enabled
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Module will be enabled for students
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('is_enabled', !formData.is_enabled)}
                    disabled={loading}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      formData.is_enabled ? 'bg-blue-500' : 'bg-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                        formData.is_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{isEditMode ? 'Update Module' : 'Create Module'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateModuleModal
