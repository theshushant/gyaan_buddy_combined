import { useState } from 'react'
import { Download, Eye, TrendingUp, Lightbulb } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const Reports = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('student-performance')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('30')

  // Chart data for Progress Over Time
  const mathProgressData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Mathematics Score',
        data: [65, 70, 75, 78, 82, 85],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const scienceProgressData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Science Score',
        data: [80, 78, 75, 72, 70, 68],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const studentPerformanceData = {
    labels: ['Arjun Verma', 'Priya Sharma', 'Rohan Kapoor', 'Anika Patel', 'Vikram Singh'],
    datasets: [
      {
        label: 'Mathematics',
        data: [85, 92, 76, 88, 65],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Science',
        data: [78, 89, 82, 91, 70],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'English',
        data: [88, 85, 79, 87, 75],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%'
          }
        }
      },
    },
  }

  // Debug: Log chart data
  console.log('Chart data loaded:', { studentPerformanceData, mathProgressData, scienceProgressData })

  const tabs = [
    { id: 'student-performance', label: 'Student Performance' },
    { id: 'progress-over-time', label: 'Progress Over Time' },
    { id: 'quiz-assignment', label: 'Quiz/Assignment Summaries' },
    { id: 'ai-insights', label: 'AI Insights' }
  ]

  const students = [
    { name: 'Aarav Sharma', class: '10A', score: 85, attendance: 92, assignments: '10/12' },
    { name: 'Diya Patel', class: '10B', score: 92, attendance: 98, assignments: '12/12' },
    { name: 'Rohan Verma', class: '10A', score: 78, attendance: 88, assignments: '9/12' },
    { name: 'Siya Kapoor', class: '10C', score: 88, attendance: 95, assignments: '11/12' },
    { name: 'Arjun Singh', class: '10B', score: 95, attendance: 100, assignments: '12/12' }
  ]

  const classPerformance = [
    { class: 'Class 10A', score: 82 },
    { class: 'Class 10B', score: 94 },
    { class: 'Class 10C', score: 88 }
  ]

  const aiInsights = [
    {
      icon: TrendingUp,
      title: 'Weak Topics',
      description: 'Identify topics where students are struggling the most.',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Lightbulb,
      title: 'Remedial Suggestions',
      description: 'Get suggestions for remedial actions to improve student performance.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
        <p className="text-gray-600 mt-2">Analyze student performance and progress with detailed reports.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ease-in-out hover:scale-105 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Classes</option>
            <option value="9A">Class 9A</option>
            <option value="10A">Class 10A</option>
            <option value="10B">Class 10B</option>
            <option value="10C">Class 10C</option>
          </select>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Subjects</option>
            <option value="math">Mathematics</option>
            <option value="science">Science</option>
            <option value="english">English</option>
            <option value="history">History</option>
          </select>
          
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'student-performance' && (
        <div className="space-y-6">
          {/* Student Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ease-in-out">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Performance Overview</h2>
            <div className="h-64 w-full animate-fade-in">
              <Bar data={studentPerformanceData} options={chartOptions} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Performance Table */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Student Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignments Completed</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.class}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${student.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{student.score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.attendance}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.assignments}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Class Performance */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance</h3>
              <p className="text-sm text-gray-600 mb-4">Average score by class</p>
              <div className="space-y-3">
                {classPerformance.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{item.class}</span>
                      <span className="text-sm font-medium text-gray-900">{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Over Time */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Over Time</h3>
              <p className="text-sm text-gray-600 mb-4">Last 6 Months</p>
              <div className="h-32 w-full">
                <Line data={mathProgressData} options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      max: 100
                    }
                  },
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    }
                  }
                }} />
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Progress Over Time Tab */}
      {activeTab === 'progress-over-time' && (
        <div className="space-y-6">
          {/* Period Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Over Time Report</h3>
            <p className="text-gray-600 mb-6">Track student performance trends over different periods.</p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDateRange === '7' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                Weekly
              </button>
              <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDateRange === '30' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                Monthly
              </button>
              <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDateRange === '90' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                Quarterly
              </button>
              <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDateRange === '365' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                Yearly
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mathematics Performance */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Mathematics Performance</h4>
                  <span className="text-sm text-gray-600">Last 3 Months</span>
                </div>
                <div className="flex items-center mb-4">
                  <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15%
                  </div>
                </div>
                <div className="h-32 w-full">
                  <Line data={mathProgressData} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        display: false
                      }
                    }
                  }} />
                </div>
              </div>

              {/* Science Performance */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Science Performance</h4>
                  <span className="text-sm text-gray-600">Last 3 Months</span>
                </div>
                <div className="flex items-center mb-4">
                  <div className="flex items-center bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                    <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                    -5%
                  </div>
                </div>
                <div className="h-32 w-full">
                  <Line data={scienceProgressData} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        display: false
                      }
                    }
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz/Assignment Summaries Tab */}
      {activeTab === 'quiz-assignment' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quiz & Assignment Reports</h3>
              <p className="text-gray-600 mt-2">An overview of performance across all quizzes and assignments.</p>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz/Assignment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Highest Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lowest Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Ganit Shastra: Beejganit Parichay</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">78%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">95%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">60%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          <span className="text-sm text-gray-900">85%</span>
                          <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2">View Details</a>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Vigyan Ka Safar: Bhautiki Ke Siddhant</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">82%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">98%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">65%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                          </div>
                          <span className="text-sm text-gray-900">92%</span>
                          <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2">View Details</a>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Angrezi Vyakaran: Mool Baatein</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">75%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">90%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">55%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                          </div>
                          <span className="text-sm text-gray-900">80%</span>
                          <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2">View Details</a>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiInsights.map((insight, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start">
                  <div className={`p-3 rounded-lg ${insight.bgColor} mr-4`}>
                    <insight.icon className={`h-6 w-6 ${insight.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-gray-600 mb-4">{insight.description}</p>
                    <button 
                      onClick={() => navigate('/ai-insights')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick Access to Full AI Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Comprehensive AI Analysis</h3>
                <p className="text-blue-700">Get detailed AI insights including weak topics, remedial activities, and mastery heatmaps.</p>
              </div>
              <button 
                onClick={() => navigate('/ai-insights')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Full AI Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
