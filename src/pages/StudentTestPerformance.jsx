import React from 'react';
import { Link } from 'react-router-dom';

const StudentTestPerformance = () => {
  const questions = [
    {
      id: 1,
      question: "Simplify 2x + 5 = 15",
      status: "Correct",
      studentAnswer: "x = 5",
      correctAnswer: "x = 5",
      isCorrect: true
    },
    {
      id: 2,
      question: "Solve for y: 3y - 4 = 11",
      status: "Incorrect",
      studentAnswer: "y = 3",
      correctAnswer: "y = 5",
      isCorrect: false
    },
    {
      id: 3,
      question: "Expand (x+2)(x-3)",
      status: "Correct",
      studentAnswer: "x² - x - 6",
      correctAnswer: "x² - x - 6",
      isCorrect: true
    },
    {
      id: 4,
      question: "Factorize x² - 9",
      status: "Incorrect",
      studentAnswer: "(x-9)(x+1)",
      correctAnswer: "(x-3)(x+3)",
      isCorrect: false
    },
    {
      id: 5,
      question: "What is the slope of y = 2x + 1?",
      status: "Correct",
      studentAnswer: "2",
      correctAnswer: "2",
      isCorrect: true
    }
  ];

  const getStatusColor = (status) => {
    return status === 'Correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center animate-slide-down">
        <div>
          <Link to="/tests" className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 mb-4 transform transition-all duration-200 hover:scale-105 hover:-translate-x-1">
            <span className="transform transition-transform duration-200 hover:-translate-x-1">←</span>
            <span>Back to Test Results</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Student Test Performance</h1>
          <p className="text-gray-600 mt-2">Detailed analysis of Priya Sharma's performance on the 'Chapter 5: Algebra Basics' test.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg">
          <svg className="w-5 h-5 transform transition-transform duration-200 hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Full Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Test Overview</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Student Name:</span>
                    <p className="text-gray-800">Priya Sharma</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Test Title:</span>
                    <p className="text-gray-800">Chapter 5: Algebra Basics</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Overall Score:</span>
                    <p className="text-gray-800">70 / 100</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Percentage:</span>
                    <p className="text-2xl font-bold text-blue-600">70%</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Time Taken:</span>
                    <p className="text-gray-800">32 minutes</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Passed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Question-by-Question Analysis</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">More</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Answer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((q) => (
                    <tr key={q.id}>
                      <td className="px-4 py-4 text-sm text-gray-800">{q.question}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(q.status)}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className={`px-4 py-4 text-sm ${q.isCorrect ? 'text-gray-800' : 'text-red-600'}`}>
                        {q.studentAnswer}
                      </td>
                      <td className={`px-4 py-4 text-sm ${q.isCorrect ? 'text-gray-800' : 'text-green-600'}`}>
                        {q.correctAnswer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-1">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-blue-600 text-xl">✨</span>
              <h3 className="text-lg font-semibold text-gray-800">AI Insights</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                <p className="text-sm text-gray-600">
                  Priya shows a good grasp of basic linear equations and expanding expressions.
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Area for Improvement</h4>
                <p className="text-sm text-red-700">
                  She struggled with questions involving factorization and solving equations where the variable is on both sides. 
                  This suggests a potential gap in understanding the difference of squares and multi-step equation solving.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Recommendation</h4>
                <p className="text-sm text-green-700">
                  Assign practice modules on 'Advanced Factoring Techniques' and 'Solving Complex Linear Equations' 
                  to reinforce these concepts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTestPerformance;
