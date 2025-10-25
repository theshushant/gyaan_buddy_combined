import { useState, useEffect } from 'react'
import { Search, Plus, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AddTeacherModal from '../components/AddTeacherModal'
import SuccessModal from '../components/SuccessModal'
import teachersService from '../services/teachersService'

const Teachers = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState({})
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true)
        const filters = {
          search: searchTerm,
          subject: selectedSubject,
          grade: selectedGrade
        }
        
        const teachersData = await teachersService.getTeachers(filters)
        setTeachers(teachersData.teachers || [])
      } catch (err) {
        setError(err.message)
        console.error('Error fetching teachers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [searchTerm, selectedSubject, selectedGrade])

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleAddTeacher = async (teacherData) => {
    try {
      const newTeacher = await teachersService.createTeacher(teacherData)
      console.log('Teacher added:', newTeacher)
      
      // Refresh the teachers list
      const updatedTeachers = await teachersService.getTeachers()
      setTeachers(updatedTeachers.teachers || [])
      
      // Show success modal
      setSuccessData({
        title: 'Teacher Added Successfully!',
        message: `${teacherData.firstName} ${teacherData.lastName} has been added to the system and is ready to be assigned to classes.`,
        actions: [
          {
            label: 'Add Another Teacher',
            icon: Plus,
            primary: true,
            onClick: () => {
              setShowSuccessModal(false)
              setShowAddModal(true)
            }
          },
          {
            label: 'Go to Teacher Management',
            icon: Eye,
            primary: false,
            onClick: () => {
              setShowSuccessModal(false)
              // Navigate to teacher management
            }
          },
          {
            label: 'View Teacher Profile',
            onClick: () => {
              setShowSuccessModal(false)
              // Navigate to teacher profile
            }
          }
        ]
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error adding teacher:', error)
      // Handle error - could show error modal
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold">Error Loading Teachers</h2>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
        <p className="text-gray-600 mt-2">Oversee teacher activity and class performance.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 ease-in-out">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers by name, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
            >
              <option value="">All Subjects</option>
              <option value="mathematics">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="history">History</option>
              <option value="geography">Geography</option>
            </select>
            
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
            >
              <option value="">All Grades</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 ease-in-out">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Teachers</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Teacher
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboard Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Mastery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-50 hover:scale-105 transition-all duration-200 ease-in-out"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{teacher.firstName} {teacher.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.classes.join(', ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(teacher.dashboardUsage)}`}
                          style={{ width: `${teacher.dashboardUsage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{teacher.dashboardUsage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${teacher.overallMastery}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{teacher.overallMastery}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => navigate(`/teachers/${teacher.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:scale-110 transform transition-all duration-200"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modals */}
      <AddTeacherModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddTeacher}
      />
      
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        {...successData}
      />
    </div>
  )
}

export default Teachers
