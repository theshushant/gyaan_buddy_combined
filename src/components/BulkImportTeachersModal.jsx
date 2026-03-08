import { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import teachersService from '../services/teachersService'

const TEMPLATE_COLUMNS = ['first_name', 'last_name', 'school', 'class_name', 'subject', 'employee_id']

const BulkImportTeachersModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [step, setStep] = useState('upload') // 'upload' | 'preview' | 'result'
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const reset = () => {
    setFile(null)
    setStep('upload')
    setPreview(null)
    setResult(null)
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    const ext = selected.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls'].includes(ext)) {
      setError('Please upload an Excel file (.xlsx or .xls)')
      return
    }
    setError(null)
    setFile(selected)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      const ext = dropped.name.split('.').pop().toLowerCase()
      if (!['xlsx', 'xls'].includes(ext)) {
        setError('Please upload an Excel file (.xlsx or .xls)')
        return
      }
      setError(null)
      setFile(dropped)
    }
  }

  const handlePreview = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const response = await teachersService.bulkImportTeachers(file, true)
      const data = response.data || response
      setPreview(data)
      setStep('preview')
    } catch (err) {
      const msg = err?.responseData?.errors
        ? JSON.stringify(err.responseData.errors)
        : err?.responseData?.message || err?.message || 'Failed to preview file'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const response = await teachersService.bulkImportTeachers(file, false)
      const data = response.data || response
      setResult(data)
      setStep('result')
      if (onSuccess) onSuccess()
    } catch (err) {
      const errData = err?.responseData
      if (errData?.errors) {
        setError(null)
        setResult({ importErrors: errData.errors, message: errData.message })
        setStep('result')
      } else {
        setError(errData?.message || err?.message || 'Import failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const header = TEMPLATE_COLUMNS.join(',')
    const sample = 'John,Doe,Springfield School,10-A,Mathematics,EMP001'
    const csv = `${header}\n${sample}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'teachers_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Import Teachers</h3>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Step: Upload */}
            {step === 'upload' && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">Excel format required</p>
                  <p>Your file must include these columns: <span className="font-mono">{TEMPLATE_COLUMNS.join(', ')}</span></p>
                  <p className="mt-1">Each row represents one teacher–class–subject assignment.</p>
                </div>

                <button
                  onClick={downloadTemplate}
                  className="text-sm text-indigo-600 hover:text-indigo-800 underline font-medium"
                >
                  Download sample template (CSV)
                </button>

                {/* Drop zone */}
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  {file ? (
                    <p className="text-sm font-medium text-indigo-700">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700">Drag & drop your Excel file here</p>
                      <p className="text-xs text-gray-500 mt-1">or click to browse — .xlsx / .xls</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={handleClose} className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={handlePreview}
                    disabled={!file || loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ backgroundColor: '#00167a' }}
                  >
                    {loading ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Checking...</>
                    ) : (
                      <><Eye className="h-4 w-4" /> Preview</>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Step: Preview */}
            {step === 'preview' && preview && (
              <>
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span><strong>{preview.valid_rows}</strong> valid rows found out of <strong>{preview.total_rows}</strong> total rows.</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-72 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">#</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">First Name</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Last Name</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">School</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Class</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Emp ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(preview.preview || []).map((row) => (
                        <tr key={row.row} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-400">{row.row}</td>
                          <td className="px-3 py-2 text-gray-800">{row.first_name}</td>
                          <td className="px-3 py-2 text-gray-800">{row.last_name}</td>
                          <td className="px-3 py-2 text-gray-800">{row.school_name}</td>
                          <td className="px-3 py-2 text-gray-800">{row.class_name}</td>
                          <td className="px-3 py-2 text-gray-800">{row.subject_name}</td>
                          <td className="px-3 py-2 text-gray-500">{row.employee_id || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setStep('upload')} className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={loading || preview.valid_rows === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ backgroundColor: '#00167a' }}
                  >
                    {loading ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Importing...</>
                    ) : (
                      <>Import {preview.valid_rows} Teachers</>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Step: Result */}
            {step === 'result' && result && (
              <>
                {result.importErrors ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{result.message || 'Import failed with errors.'}</span>
                    </div>
                    <div className="rounded-lg border border-red-200 overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-red-700">Row</th>
                            <th className="px-3 py-2 text-left font-medium text-red-700">Errors</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-100">
                          {result.importErrors.map((e, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-gray-600">{e.row}</td>
                              <td className="px-3 py-2 text-red-700">{Array.isArray(e.errors) ? e.errors.join(', ') : e.errors}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Import Successful</h4>
                    <p className="text-sm text-gray-600">{result.message || 'Teachers imported successfully.'}</p>
                    {result.created !== undefined && (
                      <p className="text-sm text-gray-500 mt-1">{result.created} teacher(s) created.</p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  {result.importErrors && (
                    <button onClick={() => setStep('upload')} className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#00167a' }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkImportTeachersModal
