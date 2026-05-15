import { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import studentsService from '../services/studentsService'

const ACTION_STYLES = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  skip:   'bg-yellow-100 text-yellow-700',
}

const BulkImportStudentsModal = ({ isOpen, onClose, onSuccess }) => {
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
    if (!dropped) return
    const ext = dropped.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls'].includes(ext)) {
      setError('Please upload an Excel file (.xlsx or .xls)')
      return
    }
    setError(null)
    setFile(dropped)
  }

  const handlePreview = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const response = await studentsService.bulkImportStudents(file, true)
      const data = response?.data ?? response
      setPreview(data)
      setStep('preview')
    } catch (err) {
      const msg = err?.responseData?.message || err?.message || 'Failed to preview file'
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
      const response = await studentsService.bulkImportStudents(file, false)
      const data = response?.data ?? response
      setResult(data)
      setStep('result')
      if (onSuccess) onSuccess()
    } catch (err) {
      const errData = err?.responseData
      setResult({ error: errData?.message || err?.message || 'Import failed' })
      setStep('result')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const totalWouldAct = preview ? (preview.would_create ?? 0) + (preview.would_update ?? 0) : 0

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-cyan-50 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Import Students</h3>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Step: Upload */}
            {step === 'upload' && (
              <>
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">⚠️</span>
                  <div>
                    <span className="font-semibold">For best experience, upload one class at a time with up to 60 entries per sheet.</span>
                    {' '}Larger files are processed in the background — this may take a few seconds after import starts.
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">Excel format — one sheet per class</p>
                  <p>Expected columns: <span className="font-mono">Reg No, Student Name, Class Name, D.O.B, Father's Name, Mother Name, Father Mobile, Mother Mobile</span></p>
                  <p className="mt-1">Clicking <strong>Preview</strong> runs a dry-run — no data will be saved until you confirm.</p>
                </div>

                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50 transition-colors"
                >
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  {file ? (
                    <p className="text-sm font-medium text-cyan-700">{file.name}</p>
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
                {/* Summary pills */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Will Create', value: preview.would_create ?? 0, color: 'green' },
                    { label: 'Will Update', value: preview.would_update ?? 0, color: 'blue' },
                    { label: 'Will Skip',   value: preview.would_skip   ?? 0, color: 'yellow' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`p-3 bg-${color}-50 border border-${color}-200 rounded-lg text-center`}>
                      <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
                      <div className={`text-xs text-${color}-600 mt-0.5`}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Per-sheet breakdown */}
                {Array.isArray(preview.sheets) && preview.sheets.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Per sheet</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {preview.sheets.map((s, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded">
                          <span className="font-medium">{s.sheet}</span>
                          <span>{s.created} create · {s.updated} update · {s.skipped} skip{s.note ? ` · ${s.note}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Row preview table */}
                {Array.isArray(preview.preview) && preview.preview.length > 0 && (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Student</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Class</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Reg No</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {preview.preview.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-800">{row.student_name}</td>
                            <td className="px-3 py-2 text-gray-600">{row.class_name}</td>
                            <td className="px-3 py-2 text-gray-500">{row.reg_no || '—'}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${ACTION_STYLES[row.action] ?? ''}`}>
                                {row.action}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

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
                    disabled={loading || totalWouldAct === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ backgroundColor: '#00167a' }}
                  >
                    {loading ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Importing...</>
                    ) : (
                      <>Import {totalWouldAct} Students</>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Step: Result */}
            {step === 'result' && result && (
              <>
                {result.error ? (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{result.error}</span>
                  </div>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Import Complete</h4>
                      <p className="text-sm text-gray-500">{result.message}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Created', value: result.created ?? 0, color: 'green' },
                        { label: 'Updated', value: result.updated ?? 0, color: 'blue' },
                        { label: 'Skipped', value: result.skipped ?? 0, color: 'yellow' },
                        { label: 'Errors',  value: result.errors  ?? 0, color: 'red' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className={`p-3 bg-${color}-50 border border-${color}-200 rounded-lg text-center`}>
                          <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
                          <div className={`text-xs text-${color}-600 mt-0.5`}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {Array.isArray(result.sheets) && result.sheets.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Per sheet</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {result.sheets.map((s, i) => (
                            <div key={i} className="flex justify-between text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded">
                              <span className="font-medium">{s.sheet}</span>
                              <span>{s.created} created · {s.updated} updated · {s.skipped} skipped · {s.errors} errors{s.note ? ` · ${s.note}` : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(result.rowErrors) && result.rowErrors.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-700 mb-1">Row errors</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {result.rowErrors.map((e, i) => (
                            <div key={i} className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded">
                              [{e.sheet}] {e.student}: {e.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  {result.error && (
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

export default BulkImportStudentsModal
