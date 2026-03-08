import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import subjectsService from '../services/subjectsService'
import CreateSubjectModal from '../components/CreateSubjectModal'

const Subjects = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await subjectsService.getSubjects()
      const data = response.data || response || []
      setSubjects(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSubjects() }, [fetchSubjects])

  const handleDelete = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return
    setDeletingId(subjectId)
    try {
      await subjectsService.deleteSubject(subjectId)
      setSubjects(prev => prev.filter(s => s.id !== subjectId))
    } catch (err) {
      alert(err.message || 'Failed to delete subject')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredSubjects = subjects.filter(sub => {
    const name = sub.name || ''
    const code = sub.code || ''
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
        <button
          onClick={() => { setEditingSubject(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-primary-600 transition-colors"
          style={{ backgroundColor: '#00167a' }}
        >
          <Plus className="h-5 w-5" />
          Add Subject
        </button>
      </div>

      <div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search subjects..."
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchSubjects}
            className="mt-2 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#00167a' }}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SUBJECT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CODE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DESCRIPTION</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {subject.logo ? (
                            <img src={subject.logo} alt={subject.name} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                              {(subject.name || '?')[0].toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {subject.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{subject.description || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subject.is_active !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {subject.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => { setEditingSubject(subject); setShowModal(true) }}
                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
                            disabled={deletingId === subject.id}
                            className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {search ? 'No subjects match your search' : 'No subjects found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreateSubjectModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingSubject(null) }}
        onSuccess={fetchSubjects}
        subject={editingSubject}
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
      />
    </div>
  )
}

export default Subjects
