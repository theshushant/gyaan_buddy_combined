import { TrendingUp, Users, BookOpen, Award } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = () => {
  // Debug: Log that Dashboard is loading
  console.log('Dashboard component loading...')

  // Chart data for School-Wide Progress Trends
  const progressTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Overall',
        data: [65, 68, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Class 10',
        data: [70, 73, 76, 79, 82, 85, 87, 90, 92, 94, 96, 98],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Class 12',
        data: [60, 63, 67, 70, 73, 76, 78, 81, 84, 87, 89, 92],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Chart data for Subject Performance
  const subjectPerformanceData = {
    labels: ['Mathematics', 'Science', 'English', 'History', 'Geography'],
    datasets: [
      {
        label: 'Average Score',
        data: [85, 78, 92, 88, 75],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Chart data for Class Distribution
  const classDistributionData = {
    labels: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    datasets: [
      {
        data: [120, 150, 140, 130],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
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

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  const metrics = [
    {
      title: 'Overall Student Proficiency',
      value: '78%',
      change: '+5% vs last month',
      changeType: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Average Class Mastery',
      value: '85%',
      change: '+3% vs last month',
      changeType: 'positive',
      icon: BookOpen
    },
    {
      title: 'Teacher Effectiveness',
      value: '92%',
      change: '+2% vs last month',
      changeType: 'positive',
      icon: Award
    }
  ]

  const quickSummary = [
    { label: 'Active Teachers', value: '25' },
    { label: 'Active Students', value: '500' },
    { label: 'Classes in Session', value: '32' }
  ]

  const alerts = [
    {
      type: 'alert',
      message: 'Low score alert in Class 10-B Mathematics.',
      detail: 'Teacher: Mr. Ramesh Kumar',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800'
    },
    {
      type: 'announcement',
      message: 'Upcoming Test: Mathematics for Class 12 on July 25th.',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800'
    },
    {
      type: 'achievement',
      message: 'Class 10-B passed with good results.',
      detail: 'Congratulations to all students and teachers.',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Principal Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2 animate-pulse">{metric.value}</p>
                <p className={`text-sm mt-1 ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors duration-200">
                <metric.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* School-Wide Progress Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">School-Wide Progress Trends</h2>
          <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">More →</a>
        </div>
        
        {/* Chart */}
        <div className="h-64 w-full animate-fade-in">
          <Line data={progressTrendsData} options={chartOptions} />
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end mt-4 space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Overall</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Class 10</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Class 12</span>
          </div>
        </div>
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Subject Performance</h2>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">More →</a>
          </div>
          <div className="h-64 w-full animate-fade-in">
            <Bar data={subjectPerformanceData} options={chartOptions} />
          </div>
        </div>

        {/* Class Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Student Distribution by Class</h2>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">More →</a>
          </div>
          <div className="h-64 w-full animate-fade-in">
            <Pie data={classDistributionData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 ease-in-out">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Summary</h2>
          <div className="space-y-3">
            {quickSummary.map((item, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center hover:bg-gray-50 p-2 rounded transition-colors duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-gray-600">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts & Announcements */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Critical Alerts & Announcements</h2>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">More →</a>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${alert.bgColor} ${alert.borderColor} hover:scale-105 transition-transform duration-200`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className={`text-sm font-medium ${alert.textColor}`}>{alert.message}</p>
                {alert.detail && (
                  <p className={`text-xs mt-1 ${alert.textColor} opacity-80`}>{alert.detail}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
