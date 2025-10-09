import { useState } from 'react'
import { Search, Filter, Plus, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AddStudentModal from '../components/AddStudentModal'
import SuccessModal from '../components/SuccessModal'

const Students = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState({})

  const students = [
    { id: '1', name: 'Arjun Verma', class: '10A', grade: '10', score: 85 },
    { id: '2', name: 'Priya Sharma', class: '9B', grade: '9', score: 92 },
    { id: '3', name: 'Rohan Kapoor', class: '10A', grade: '10', score: 76 },
    { id: '4', name: 'Anika Patel', class: '9C', grade: '9', score: 88 },
    { id: '5', name: 'Vikram Singh', class: '10B', grade: '10', score: 65 }
  ]

  const summaryCards = [
    { label: 'Total Students', value: '120' },
    { label: 'Average Score', value: '78%' },
    { label: 'Top Performer', value: 'Priya Sharma' }
  ]

  const handleAddStudent = (studentData) => {
    // Here you would typically save to your backend/state management
    console.log('Adding student:', studentData)
    
    // Show success modal
    setSuccessData({
      title: 'Student Added Successfully',
      message: `${studentData.firstName} ${studentData.lastName} has been added to ${studentData.class}.`,
      actions: [
        {
          label: 'Add Another Student',
          icon: Plus,
          primary: true,
          onClick: () => {
            setShowSuccessModal(false)
            setShowAddModal(true)
          }
        },
        {
          label: 'Go to Class Roster',
          icon: Eye,
          primary: false,
          onClick: () => {
            setShowSuccessModal(false)
            // Navigate to class roster
          }
        },
        {
          label: 'View Student Profile',
          onClick: () => {
            setShowSuccessModal(false)
            // Navigate to student profile
          }
        }
      ]
    })
    setShowSuccessModal(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Overview</h1>
        <p className="text-gray-600 mt-2">Filter and view student performance data.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a student by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Class</option>
              <option value="9A">Class 9A</option>
              <option value="9B">Class 9B</option>
              <option value="10A">Class 10A</option>
              <option value="10B">Class 10B</option>
            </select>
            
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Grade</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Subject</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="history">History</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Apply Filters
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2 animate-pulse">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Students</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-50 hover:scale-105 transition-all duration-200 ease-in-out"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.class}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.grade}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${student.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{student.score}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => navigate(`/students/${student.id}`)}
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
        
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">Showing 1 to 5 of 42 results</p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddStudent}
      />
      
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        {...successData}
      />
    </div>
  )
}

export default Students
