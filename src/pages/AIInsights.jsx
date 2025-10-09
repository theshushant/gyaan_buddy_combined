import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, TrendingUp, Lightbulb, BookOpen, Calculator, Globe, Zap, Target } from 'lucide-react'

const AIInsights = () => {
  const navigate = useNavigate()

  const weakTopics = [
    {
      topic: 'Algebraic Equations',
      studentsStruggling: ['Rohan', 'Priya', 'Arjun'],
      strugglingPercentage: 60,
      color: 'bg-orange-500'
    },
    {
      topic: 'Trigonometry Basics',
      studentsStruggling: ['Pooja', 'Vikram', 'Anjali'],
      strugglingPercentage: 55,
      color: 'bg-orange-500'
    },
    {
      topic: 'Calculus Fundamentals',
      studentsStruggling: ['Siddharth', 'Neha', 'Karthik'],
      strugglingPercentage: 50,
      color: 'bg-yellow-500'
    },
    {
      topic: 'Geometry Theorems',
      studentsStruggling: ['Divya', 'Rajesh', 'Meera'],
      strugglingPercentage: 45,
      color: 'bg-yellow-500'
    },
    {
      topic: 'Statistics and Probability',
      studentsStruggling: ['Gaurav', 'Shreya', 'Vivek'],
      strugglingPercentage: 40,
      color: 'bg-green-500'
    }
  ]

  const remedialActivities = [
    {
      title: 'Algebraic Equations Practice',
      icon: Calculator,
      description: 'Focuses on solving linear and quadratic equations with real-world applications.',
      color: 'bg-blue-500',
      link: 'View Activity →'
    },
    {
      title: 'Trigonometry Basics Review',
      icon: Globe,
      description: 'Covers sine, cosine, and tangent functions with interactive practice problems.',
      color: 'bg-green-500',
      link: 'View Activity →'
    },
    {
      title: 'Calculus Fundamentals Guide',
      icon: TrendingUp,
      description: 'Introduces limits, derivatives, and integrals with clear examples and visualizations.',
      color: 'bg-purple-500',
      link: 'View Activity →'
    },
    {
      title: 'Geometry Theorems Exploration',
      icon: Target,
      description: 'Explores key theorems and their proofs with interactive exercises.',
      color: 'bg-yellow-500',
      link: 'View Activity →'
    },
    {
      title: 'Statistics & Probability Exercises',
      icon: BookOpen,
      description: 'Includes data analysis and probability calculations with engaging simulations.',
      color: 'bg-red-500',
      link: 'View Activity →'
    }
  ]

  const heatmapData = [
    { name: 'Rohan Sharma', algebra: 1, trigonometry: 2, calculus: 3, geometry: 4, statistics: 5 },
    { name: 'Priya Singh', algebra: 1, trigonometry: 1, calculus: 3, geometry: 2, statistics: 4 },
    { name: 'Arjun Kumar', algebra: 1, trigonometry: 2, calculus: 1, geometry: 2, statistics: 5 },
    { name: 'Anjali Gupta', algebra: 4, trigonometry: 1, calculus: 2, geometry: 1, statistics: 4 },
    { name: 'Vikram Mehra', algebra: 3, trigonometry: 1, calculus: 1, geometry: 1, statistics: 3 },
    { name: 'Neha Reddy', algebra: 5, trigonometry: 4, calculus: 1, geometry: 4, statistics: 3 }
  ]

  const getMasteryColor = (level) => {
    const colors = {
      1: 'bg-red-600', // Low mastery
      2: 'bg-orange-500',
      3: 'bg-yellow-500',
      4: 'bg-green-400',
      5: 'bg-green-600' // High mastery
    }
    return colors[level] || 'bg-gray-300'
  }

  const getMasteryText = (level) => {
    const texts = {
      1: 'Low Mastery',
      2: 'Below Average',
      3: 'Average',
      4: 'Good',
      5: 'High Mastery'
    }
    return texts[level] || 'Unknown'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center text-gray-600 hover:text-gray-800 hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Insights Report</h1>
            <p className="text-gray-600 mt-2">Analyze student performance and identify areas for improvement.</p>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Common Weak Topics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 ease-in-out">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Common Weak Topics</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students Struggling</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Struggling Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weakTopics.map((topic, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-gray-50 hover:scale-105 transition-all duration-200 ease-in-out"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{topic.topic}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{topic.studentsStruggling.join(', ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ease-out ${topic.color}`}
                            style={{ width: `${topic.strugglingPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{topic.strugglingPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI-Generated Remedial Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">AI-Generated Remedial Activities</h2>
          <p className="text-gray-600 mt-2">Based on the identified weak topics, our AI suggests the following activities to help students improve:</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remedialActivities.map((activity, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className={`h-12 w-12 ${activity.color} rounded-lg flex items-center justify-center`}>
                    <activity.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      {activity.link}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Mastery Heatmap */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Topic Mastery Heatmap</h2>
          <p className="text-gray-600 mt-2">Visualize student mastery across topics. Darker shades indicate lower proficiency.</p>
        </div>
        <div className="p-6">
          {/* Color Legend */}
          <div className="flex items-center justify-center mb-6 space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-sm text-gray-600">Low Mastery</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-600">Below Average</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">Average</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm text-gray-600">Good</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm text-gray-600">High Mastery</span>
            </div>
          </div>

          {/* Heatmap Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Algebra</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trigonometry</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Calculus</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Geometry</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statistics</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {heatmapData.map((student, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`w-8 h-8 ${getMasteryColor(student.algebra)} rounded mx-auto`}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`w-8 h-8 ${getMasteryColor(student.trigonometry)} rounded mx-auto`}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`w-8 h-8 ${getMasteryColor(student.calculus)} rounded mx-auto`}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`w-8 h-8 ${getMasteryColor(student.geometry)} rounded mx-auto`}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`w-8 h-8 ${getMasteryColor(student.statistics)} rounded mx-auto`}></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Weak Topics</h3>
                <p className="text-gray-600 mb-4">Identify topics where students are struggling the most.</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Remedial Suggestions</h3>
                <p className="text-gray-600 mb-4">Get suggestions for remedial actions to improve student performance.</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Suggestions →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIInsights
