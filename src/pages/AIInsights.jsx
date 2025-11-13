import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, TrendingUp, Lightbulb, BookOpen, Calculator, Globe, Zap, Target } from 'lucide-react'
import {
  fetchAIInsights,
  fetchAIHeatmap,
  fetchRemedialActivities,
  clearError
} from '../features/ai/aiSlice'

const AIInsights = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const {
    insights,
    heatmap,
    remedialActivities,
    loading,
    error
  } = useSelector(state => state.ai)

  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    const hasError = Object.values(error).some(err => err !== null)
    if (hasError) {
      return // Don't retry if there's already an error
    }

    // Fetch AI insights data when component mounts
    const fetchAIInsightsData = async () => {
      try {
        await Promise.all([
          dispatch(fetchAIInsights()),
          dispatch(fetchAIHeatmap()),
          dispatch(fetchRemedialActivities())
        ])
      } catch (err) {
        console.error('Error fetching AI insights data:', err)
      }
    }

    fetchAIInsightsData()
  }, [dispatch, error])

  const isLoading = Object.values(loading).some(load => load === true)
  const hasError = Object.values(error).some(err => err !== null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (hasError) {
    const handleRetry = async () => {
      // Clear error first
      dispatch(clearError())
      // Then retry fetching data
      try {
        await Promise.all([
          dispatch(fetchAIInsights()),
          dispatch(fetchAIHeatmap()),
          dispatch(fetchRemedialActivities())
        ])
      } catch (err) {
        console.error('Error retrying AI insights data:', err)
      }
    }

    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-red-800 dark:text-red-400 font-semibold">Error Loading AI Insights</h2>
        <p className="text-red-600 dark:text-red-400 mt-2">
          {Object.values(error).find(err => err !== null) || 'An unexpected error occurred'}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => dispatch(clearError())}
            className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            Clear Error
          </button>
        </div>
      </div>
    )
  }

  // Use data from Redux state or fallback to default data
  const weakTopics = insights?.weakTopics || [
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

  const remedialActivitiesData = remedialActivities || [
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
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Insights Report</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Analyze student performance and identify areas for improvement.</p>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 hover:scale-105 transition-all duration-200">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Common Weak Topics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 ease-in-out">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Common Weak Topics</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Students Struggling</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Struggling Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {weakTopics.map((topic, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-105 transition-all duration-200 ease-in-out"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{topic.topic}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">{topic.studentsStruggling.join(', ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ease-out ${topic.color}`}
                            style={{ width: `${topic.strugglingPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{topic.strugglingPercentage}%</span>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI-Generated Remedial Activities</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Based on the identified weak topics, our AI suggests the following activities to help students improve:</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remedialActivitiesData.map((activity, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className={`h-12 w-12 ${activity.color} rounded-lg flex items-center justify-center`}>
                    <activity.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{activity.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{activity.description}</p>
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Topic Mastery Heatmap</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Visualize student mastery across topics. Darker shades indicate lower proficiency.</p>
        </div>
        <div className="p-6">
          {/* Color Legend */}
          <div className="flex items-center justify-center mb-6 space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Low Mastery</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Below Average</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Average</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Good</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">High Mastery</span>
            </div>
          </div>

          {/* Heatmap Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Algebra</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trigonometry</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Calculus</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Geometry</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statistics</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {heatmapData.map((student, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Recommendations</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Weak Topics</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Identify topics where students are struggling the most.</p>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Remedial Suggestions</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Get suggestions for remedial actions to improve student performance.</p>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
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
