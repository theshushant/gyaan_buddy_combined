import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Filter, Plus, Eye, Trash2, AlertTriangle, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import studentsService from '../services/studentsService'
import AddStudentModal from '../components/AddStudentModal'
import SuccessModal from '../components/SuccessModal'
import Modal from '../components/Modal'
import {
  fetchStudents,
  fetchStudentStats,
  fetchStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  setFilters,
  clearError
} from '../features/students/studentsSlice'
import { fetchClasses } from '../features/classes/classesSlice'
import { fetchSubjects } from '../features/subjects/subjectsSlice'

const Students = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const {
    students,
    studentStats,
    summary,
    loading,
    error,
    filters
  } = useSelector(state => state.students)

  const { classes } = useSelector(state => state.classes)
  const { subjects } = useSelector(state => state.subjects)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState({})
  const [editingStudent, setEditingStudent] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [bulkImporting, setBulkImporting] = useState(false)
  const [showBulkResultModal, setShowBulkResultModal] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)
  const bulkFileRef = useRef(null)

  // On mount: load supporting data and students for whatever class is already selected
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchStudentStats()),
          dispatch(fetchClasses({})),
          dispatch(fetchSubjects({}))
        ])
      } catch (err) {
        console.error('Error fetching students data:', err)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  // Pre-select the first class (first visit) OR re-fetch students when returning to page
  useEffect(() => {
    if (classes.length === 0) return

    if (!filters.class) {
      // First visit: auto-select first class and fetch its students
      const firstId = (classes[0].id ?? classes[0].uuid ?? '').toString()
      if (firstId) {
        dispatch(setFilters({ class: firstId }))
        dispatch(fetchStudents({ class: firstId }))
      }
    } else {
      // Returning to page with a previously selected class: re-fetch students
      dispatch(fetchStudents({ class: filters.class, subject: filters.subject }))
    }
  // Run when classes finish loading (length goes from 0 → N); not on every filter change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes.length, dispatch])

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }))
  }

  const handleClassFilter = (value) => {
    dispatch(setFilters({ class: value }))
    dispatch(fetchStudents({ class: value, subject: filters.subject }))
  }

  const handleSubjectFilter = (value) => {
    dispatch(setFilters({ subject: value }))
    dispatch(fetchStudents({ class: filters.class, subject: value }))
  }

  const handleAddStudent = async (studentData) => {
    try {
      await dispatch(createStudent(studentData)).unwrap()
      setShowAddModal(false)
      await Promise.all([
        dispatch(fetchStudents({ class: filters.class, subject: filters.subject })),
        dispatch(fetchStudentStats())
      ])
      setSuccessData({
        title: 'Student Added Successfully',
        message: `${studentData.firstName} ${studentData.lastName} has been added to the system.`
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error adding student:', error)
    }
  }

  const handleUpdateStudent = async (studentData) => {
    try {
      await dispatch(updateStudent({ studentId: editingStudent.id, studentData })).unwrap()
      setEditingStudent(null)
      setShowAddModal(false)
      await Promise.all([
        dispatch(fetchStudents({ class: filters.class, subject: filters.subject })),
        dispatch(fetchStudentStats())
      ])
      setSuccessData({
        title: 'Student Updated Successfully',
        message: `${studentData.first_name} ${studentData.last_name} has been updated.`
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error updating student:', error)
    }
  }

  const handleDeleteClick = (student) => {
    setStudentToDelete(student)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return

    try {
      await dispatch(deleteStudent(studentToDelete.id)).unwrap()
      await Promise.all([
        dispatch(fetchStudents({ class: filters.class, subject: filters.subject })),
        dispatch(fetchStudentStats())
      ])
      setSuccessData({
        title: 'Student Deleted Successfully',
        message: `${studentToDelete.first_name || ''} ${studentToDelete.last_name || ''} has been removed from the system.`
      })
      setShowDeleteModal(false)
      setStudentToDelete(null)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setStudentToDelete(null)
  }

  const handleViewStudent = (studentId) => {
    navigate(`/students/${studentId}`)
  }

  const handleEditStudent = async (student) => {
    try {
      const fullStudent = await dispatch(fetchStudentById(student.id)).unwrap()
      setEditingStudent(fullStudent)
      setShowAddModal(true)
    } catch (error) {
      console.error('Error fetching student details:', error)
      setEditingStudent(student)
      setShowAddModal(true)
    }
  }

  const handleBulkImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset so the same file can be re-selected if needed
    e.target.value = ''
    setBulkImporting(true)
    try {
      const response = await studentsService.bulkImportStudents(file)
      const data = response?.data ?? response
      setBulkResult(data)
      setShowBulkResultModal(true)
      // Refresh list with current filters after import
      dispatch(fetchStudents({ class: filters.class, subject: filters.subject }))
      dispatch(fetchStudentStats())
    } catch (err) {
      setBulkResult({ error: err.message })
      setShowBulkResultModal(true)
    } finally {
      setBulkImporting(false)
    }
  }

  const clearFilters = () => {
    const firstClassId = classes.length > 0 ? (classes[0].id ?? classes[0].uuid ?? '').toString() : ''
    dispatch(setFilters({ search: '', class: firstClassId, subject: '' }))
    dispatch(fetchStudents({ class: firstClassId }))
  }

  // Class and subject filtering is done server-side; only apply local search for instant feedback
  const filteredStudents = (students || []).filter(student => {
    if (!filters.search) return true
    const firstName = (student.first_name || student.firstName || '').toLowerCase()
    const lastName = (student.last_name || student.lastName || '').toLowerCase()
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName.includes(filters.search.toLowerCase())
  })

  const summaryCards = [
    { label: 'Total Students', value: (studentStats?.totalStudents ?? studentStats?.total_students ?? 0).toString() },
    { label: 'Average Score', value: `${studentStats?.averageScore ?? studentStats?.average_score ?? 0}%` },
    { label: 'Top Performer', value: summary?.topPerformer || 'N/A' }
  ]

  const isLoading = loading.students || loading.stats
  const hasError = error.students || error.stats

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold">Error Loading Students</h2>
        <p className="text-red-600 mt-2">{hasError}</p>
        <button
          onClick={() => dispatch(clearError())}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Clear Error
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-900">Student Overview</h1>
        <p className="text-gray-600 mt-2">Filter and view student performance data.</p>
      </div>

      <div className="flex-shrink-0 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a student by name..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={filters.class}
              onChange={(e) => handleClassFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Class</option>
              {Array.isArray(classes) && classes.map((classItem) => {
                const className = classItem.name || classItem.class_name || `${classItem.id}`
                const classValue = classItem.id?.toString() || classItem.name || classItem.class_name || ''
                return (
                  <option key={classItem.id || classItem.name} value={classValue}>
                    {className}
                  </option>
                )
              })}
            </select>
            
            <select
              value={filters.subject}
              onChange={(e) => handleSubjectFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Subject</option>
              {Array.isArray(subjects) && subjects.map((subject) => {
                const subjectName = subject.name || subject.subject_name || `${subject.id}`
                const subjectValue = subject.id?.toString() || subject.name || subject.subject_name || ''
                return (
                  <option key={subject.id || subject.name} value={subjectValue}>
                    {subjectName}
                  </option>
                )
              })}
            </select>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col flex-1 min-h-0 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Students</h2>
          <div className="flex items-center gap-3">
            {/* Hidden file input for bulk import */}
            <input
              ref={bulkFileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleBulkImport}
            />
            <button
              onClick={() => bulkFileRef.current?.click()}
              disabled={bulkImporting}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#1fb7eb' }}
            >
              {bulkImporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {bulkImporting ? 'Importing…' : 'Bulk Add'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#00167a' }}
            >
              <Plus className="h-4 w-4" />
              Add Student
            </button>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total EXP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-500">
                          {(student.first_name?.charAt(0) || '').toUpperCase()}{(student.last_name?.charAt(0) || '').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {[student.first_name, student.last_name].filter(Boolean).join(' ') || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.class_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.averageScore || 0}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.total_exp || student.total_XP || student.xp || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewStudent(student.id)}
                        className="text-primary-500 hover:text-primary-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setEditingStudent(null)
          }}
          onSave={editingStudent ? handleUpdateStudent : handleAddStudent}
          loading={loading.create || loading.update}
          error={error.create || error.update}
          student={editingStudent}
          title={editingStudent ? 'Edit Student' : 'Add New Student'}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title={successData.title}
          message={successData.message}
        />
      )}

      {showDeleteModal && studentToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          title="Delete Student"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Are you sure you want to delete this student?
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  This action will permanently delete <span className="font-semibold text-gray-900">
                    {studentToDelete.first_name || ''} {studentToDelete.last_name || ''}
                  </span> from the system.
                </p>
                <p className="text-sm text-red-600 font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleDeleteCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading.delete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading.delete ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Student</span>
                  </>
                )}
              </button>
            </div>

            {error.delete && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error.delete}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Bulk Import Result Modal */}
      {showBulkResultModal && bulkResult && (
        <Modal
          isOpen={showBulkResultModal}
          onClose={() => setShowBulkResultModal(false)}
          title="Bulk Import Result"
          size="md"
        >
          <div className="space-y-4">
            {bulkResult.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">Import failed</p>
                <p className="text-sm text-red-600 mt-1">{bulkResult.error}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Created', value: bulkResult.created ?? 0, color: 'green' },
                    { label: 'Updated', value: bulkResult.updated ?? 0, color: 'blue' },
                    { label: 'Skipped', value: bulkResult.skipped ?? 0, color: 'yellow' },
                    { label: 'Errors', value: bulkResult.errors ?? 0, color: 'red' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`p-3 bg-${color}-50 border border-${color}-200 rounded-lg text-center`}>
                      <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
                      <div className={`text-sm text-${color}-600`}>{label}</div>
                    </div>
                  ))}
                </div>

                {Array.isArray(bulkResult.sheets) && bulkResult.sheets.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Per sheet</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {bulkResult.sheets.map((s, i) => (
                        <div key={i} className="flex justify-between text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded">
                          <span className="font-medium">{s.sheet}</span>
                          <span>{s.created} created · {s.updated} updated · {s.skipped} skipped · {s.errors} errors{s.note ? ` · ${s.note}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(bulkResult.rowErrors) && bulkResult.rowErrors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-2">Row errors</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {bulkResult.rowErrors.map((e, i) => (
                        <div key={i} className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded">
                          [{e.sheet}] {e.student}: {e.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-end pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowBulkResultModal(false)}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#00167a' }}
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Students