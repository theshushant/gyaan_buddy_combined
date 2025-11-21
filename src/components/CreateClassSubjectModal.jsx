import { useState, useEffect } from 'react'
import { X, Upload } from 'lucide-react'
import classesService from '../services/classesService'
import subjectsService from '../services/subjectsService'

const CreateClassSubjectModal = ({ isOpen, onClose, onSuccess, initialType = 'class' }) => {
  const [type, setType] = useState(initialType) // 'class' or 'subject'
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [classes, setClasses] = useState([])
  const [selectedClasses, setSelectedClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Fetch classes when modal opens and type is subject
  useEffect(() => {
    if (isOpen && type === 'subject') {
      fetchClasses()
    }
  }, [isOpen, type])

  // Update type when initialType changes (when modal is opened with different type)
  useEffect(() => {
    if (isOpen) {
      setType(initialType)
      resetForm()
    }
  }, [isOpen, initialType])

  const resetForm = () => {
    setName('')
    setCode('')
    setDescription('')
    setIsActive(true)
    setSelectedClasses([])
    setLogoFile(null)
    setLogoPreview(null)
    setErrors({})
  }

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

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please select an image file' }))
        return
      }
      
      // Validate file size (max 5MB)
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
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClassToggle = (classId) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    const newErrors = {}
    if (!name.trim()) {
      newErrors.name = `${type === 'class' ? 'Class' : 'Subject'} name is required`
    }
    
    if (type === 'subject') {
      if (!code.trim()) {
        newErrors.code = 'Subject code is required'
      } else if (code.length > 10) {
        newErrors.code = 'Code must be 10 characters or less'
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      let response
      if (type === 'class') {
        response = await classesService.createClass({ name: name.trim() })
      } else {
        const subjectData = {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim(),
          is_active: isActive,
          classes: selectedClasses
        }
        response = await subjectsService.createSubject(subjectData, logoFile)
      }
      
      // Extract the created item's ID from response
      const createdItem = response.data || response
      const createdId = createdItem?.id
      
      // Reset form
      resetForm()
      
      // Notify parent component with the created item info
      if (onSuccess) {
        onSuccess(type, createdId)
      }
      
      onClose()
    } catch (err) {
      console.error(`Failed to create ${type}:`, err)
      
      // Handle validation errors from backend
      if (err.responseData && typeof err.responseData === 'object') {
        if (err.responseData.errors) {
          const fieldErrors = {}
          Object.keys(err.responseData.errors).forEach(key => {
            if (Array.isArray(err.responseData.errors[key]) && err.responseData.errors[key].length > 0) {
              fieldErrors[key] = err.responseData.errors[key][0]
            }
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: err.responseData.message || err.message || `Failed to create ${type}. Please try again.` })
        }
      } else {
        setErrors({ general: err.message || `Failed to create ${type}. Please try again.` })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    setType('class')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/5 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
        
        <div className={`relative bg-white rounded-lg shadow-xl w-full ${type === 'subject' ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create {type === 'class' ? 'Class' : 'Subject'}</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Messages */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Toggle for Class/Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setType('class')
                    resetForm()
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    type === 'class'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  Class
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('subject')
                    resetForm()
                    fetchClasses()
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    type === 'subject'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  Subject
                </button>
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {type === 'class' ? 'Class' : 'Subject'} Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.name
                    return newErrors
                  })
                }}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder={`Enter ${type === 'class' ? 'class' : 'subject'} name`}
                required
                disabled={loading}
                maxLength={100}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Subject-specific fields */}
            {type === 'subject' && (
              <>
                {/* Code Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase())
                      setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.code
                        return newErrors
                      })
                    }}
                    className={`w-full px-3 py-2 border ${errors.code ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                    placeholder="e.g., MATH"
                    required
                    disabled={loading}
                    maxLength={10}
                  />
                  <p className="mt-1 text-xs text-gray-500">Max 10 characters, will be converted to uppercase</p>
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                  )}
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.description
                        return newErrors
                      })
                    }}
                    rows={3}
                    className={`w-full px-3 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter subject description (optional)"
                    disabled={loading}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
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
                  </div>
                </div>

                {/* Classes Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Classes (Optional)
                  </label>
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
                              checked={selectedClasses.includes(cls.id)}
                              onChange={() => handleClassToggle(cls.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              disabled={loading}
                            />
                            <span className="text-gray-700">{cls.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creating...' : `Create ${type === 'class' ? 'Class' : 'Subject'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateClassSubjectModal

