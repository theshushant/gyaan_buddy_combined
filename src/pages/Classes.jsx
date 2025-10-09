import { useState } from 'react'
import { Plus, Eye, Users, BookOpen, TrendingUp, Calendar, Clock, Search, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Classes = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const classes = [
    {
      id: '1',
      name: 'Class 9A',
      teacher: 'Ms. Priya Sharma',
      students: 35,
      grade: '9',
      subjects: ['Mathematics', 'Science', 'English'],
      averageScore: 82,
      attendance: 94,
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Class 10B',
      teacher: 'Mr. Rajesh Verma',
      students: 40,
      grade: '10',
      subjects: ['Mathematics', 'Science', 'English', 'History'],
      averageScore: 78,
      attendance: 91,
      lastActivity: '1 hour ago'
    },
    {
      id: '3',
      name: 'Class 11A',
      teacher: 'Ms. Anjali Kapoor',
      students: 32,
      grade: '11',
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
      averageScore: 85,
      attendance: 96,
      lastActivity: '30 minutes ago'
    },
    {
      id: '4',
      name: 'Class 12th Commerce',
      teacher: 'Mr. Vikram Singh',
      students: 28,
      grade: '12',
      subjects: ['Accountancy', 'Business Studies', 'Economics', 'English'],
      averageScore: 88,
      attendance: 93,
      lastActivity: '45 minutes ago'
    },
    {
      id: '5',
      name: 'Class 9B',
      teacher: 'Ms. Deepika Patel',
      students: 38,
      grade: '9',
      subjects: ['Mathematics', 'Science', 'English', 'Social Studies'],
      averageScore: 79,
      attendance: 89,
      lastActivity: '3 hours ago'
    },
    {
      id: '6',
      name: 'Class 10A',
      teacher: 'Mr. Amit Kumar',
      students: 42,
      grade: '10',
      subjects: ['Mathematics', 'Science', 'English', 'History', 'Geography'],
      averageScore: 81,
      attendance: 92,
      lastActivity: '1 hour ago'
    }
  ]

  const summaryCards = [
    { label: 'Total Classes', value: '6', icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Total Students', value: '215', icon: Users, color: 'bg-green-500' },
    { label: 'Average Score', value: '82%', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Active Classes', value: '6', icon: Clock, color: 'bg-orange-500' }
  ]

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = selectedGrade === 'all' || cls.grade === selectedGrade
    return matchesSearch && matchesGrade
  })

  const handleViewDetails = (classId) => {
    // Navigate to class details page (to be implemented)
    console.log('View details for class:', classId)
  }

  const handleAddClass = () => {
    setShowAddModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-600 mt-2">Manage classes, view performance, and track student progress.</p>
        </div>
        <button 
          onClick={handleAddClass}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Class
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center">
              <div className={`h-12 w-12 ${card.color} rounded-lg flex items-center justify-center mr-4 hover:scale-110 transition-transform duration-200`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 animate-pulse">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes or teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Grades</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClasses.map((classItem, index) => (
          <div 
            key={classItem.id} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-6">
              {/* Class Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                  <p className="text-sm text-gray-600">Grade {classItem.grade}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-xl font-bold text-gray-900">{classItem.averageScore}%</p>
                </div>
              </div>

              {/* Class Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{classItem.students} students</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>{classItem.teacher}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{classItem.attendance}% attendance</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Last activity: {classItem.lastActivity}</span>
                </div>
              </div>

              {/* Subjects */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Subjects:</p>
                <div className="flex flex-wrap gap-1">
                  {classItem.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(classItem.id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or add a new class.</p>
          <button
            onClick={handleAddClass}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Class
          </button>
        </div>
      )}

      {/* Add Class Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Class</h3>
            <p className="text-gray-600 mb-4">Add new class form will be implemented here.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Class
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Classes