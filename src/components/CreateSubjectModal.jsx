import { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import subjectsService from '../services/subjectsService'
import classesService from '../services/classesService'

const CreateSubjectModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  subject = null, 
  title = 'Create Subject' 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true,
    classes: []
  })
  
  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [validationErrors, setValidationErrors] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchClasses()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && subject) {
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
        is_active: subject.is_active !== undefined ? subject.is_active : true,
        classes: subject.classes || []
      })
      
      if (subject.logo) {
        const logoUrl = typeof subject.logo === 'string' 
          ? (subject.logo.startsWith('http') ? subject.logo : `${import.meta.env.VITE_API_BASE_URL || ''}${subject.logo}`)
          : null
        if (logoUrl) {
          setLogoPreview(logoUrl)
        }
      }
    } else if (isOpen && !subject) {
      setFormData({
        name: '',
        code: '',
        description: '',
        is_active: true,
        classes: []
      })
      setLogoFile(null)
      setLogoPreview(null)
    }
    setErrors({})
    setValidationErrors(null)
  }, [isOpen, subject])

  const fetchClasses = async () => {
    setLoadingClasses(true)
    try {
      const response = await classesService.getClasses()
      const classesData = response.data || response || []
      setClasses(Array.isArray(classesData) ? classesData : [])
    } catch (error) {
      console.error('Failed to fetch classes:', error)
      setClasses([])
    } finally {
      setLoadingClasses(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please select an image file' }))
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

  const handleClassToggle = (classId) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(classId)
        ? prev.classes.filter(id => id !== classId)
        : [...prev.classes, classId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required'
    } else if (formData.code.length > 10) {
      newErrors.code = 'Code must be 10 characters or less'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const submitData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        is_active: formData.is_active,
        classes: formData.classes
      }

      let response
      if (subject) {
        response = await subjectsService.updateSubject(subject.id, submitData, logoFile)
      } else {
        response = await subjectsService.createSubject(submitData, logoFile)
      }
      
      const item = response.data || response
      const itemId = item?.id
      
      setFormData({
        name: '',
        code: '',
        description: '',
        is_active: true,
        classes: []
      })
      setLogoFile(null)
      setLogoPreview(null)
      setErrors({})
      setValidationErrors(null)
      
      if (onSuccess) {
        onSuccess(itemId || item)
      }
      
      onClose()
    } catch (err) {
      console.error(`Failed to ${subject ? 'update' : 'create'} subject:`, err)
      
      if (err.responseData && typeof err.responseData === 'object') {
        if (err.responseData.errors) {
          setValidationErrors(err.responseData.errors)
          const fieldErrors = {}
          Object.keys(err.responseData.errors).forEach(key => {
            if (Array.isArray(err.responseData.errors[key]) && err.responseData.errors[key].length > 0) {
              fieldErrors[key] = err.responseData.errors[key][0]
            }
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: err.responseData.message || err.message || `Failed to ${subject ? 'update' : 'create'} subject. Please try again.` })
        }
      } else {
        setErrors({ general: err.message || `Failed to ${subject ? 'update' : 'create'} subject. Please try again.` })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      is_active: true,
      classes: []
    })
    setLogoFile(null)
    setLogoPreview(null)
    setErrors({})
    setValidationErrors(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/5 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}
            
            {validationErrors && validationErrors.non_field_errors && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {Array.isArray(validationErrors.non_field_errors) 
                  ? validationErrors.non_field_errors.join(', ')
                  : validationErrors.non_field_errors}
              </div>
            )}

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    placeholder="e.g., Mathematics"
                    required
                    disabled={loading}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                  {validationErrors?.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {Array.isArray(validationErrors.name) 
                        ? validationErrors.name.join(', ')
                        : validationErrors.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.code ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase`}
                    placeholder="e.g., MATH"
                    required
                    disabled={loading}
                    maxLength={10}
                  />
                  <p className="mt-1 text-xs text-gray-500">Max 10 characters, will be converted to uppercase</p>
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                  )}
                  {validationErrors?.code && (
                    <p className="mt-1 text-sm text-red-600">
                      {Array.isArray(validationErrors.code) 
                        ? validationErrors.code.join(', ')
                        : validationErrors.code}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  placeholder="Enter subject description (optional)"
                  disabled={loading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Logo</h4>
              <div className="space-y-4">
                {logoPreview && (
                  <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                      <Upload className="h-5 w-5 mr-2 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {logoFile ? logoFile.name : 'Choose File'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                    {logoFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null)
                          setLogoPreview(null)
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {errors.logo && (
                    <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
                  )}
                  {validationErrors?.logo && (
                    <p className="mt-1 text-sm text-red-600">
                      {Array.isArray(validationErrors.logo) 
                        ? validationErrors.logo.join(', ')
                        : validationErrors.logo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Assign to Classes (Optional)</h4>
              {loadingClasses ? (
                <div className="text-center text-sm text-gray-500 py-4">Loading classes...</div>
              ) : classes.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-4">No classes available</div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {classes.map(cls => (
                      <label key={cls.id} className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={formData.classes.includes(cls.id)}
                          onChange={() => handleClassToggle(cls.id)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                          disabled={loading}
                        />
                        <span className="text-gray-700">{cls.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Status</h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#00167a' }}
                disabled={loading}
              >
                {loading ? (subject ? 'Updating...' : 'Creating...') : (subject ? 'Update Subject' : 'Create Subject')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateSubjectModal

