import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ViewQuestions = () => {
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const questions = [
    {
      id: 1,
      text: "Who was the first Gupta emperor to adopt the title of 'Maharajadhiraja'?",
      type: "Single choice",
      difficulty: "Easy",
      successRate: 85
    },
    {
      id: 2,
      text: "Which of the following events were significant during the Indian Rebellion of 1857? (Select all that apply)",
      type: "Multiple choice",
      difficulty: "Medium",
      successRate: 62
    },
    {
      id: 3,
      text: "Briefly explain the contribution of Aryabhata to ancient Indian mathematics.",
      type: "Short answer",
      difficulty: "Hard",
      successRate: 45
    },
    {
      id: 4,
      text: "The 'Doctrine of Lapse' was a policy of annexation followed by which Governor-General of India?",
      type: "Single choice",
      difficulty: "Easy",
      successRate: 92
    },
    {
      id: 5,
      text: "Describe the main architectural features of the temples built during the Chola dynasty.",
      type: "Short answer",
      difficulty: "Medium",
      successRate: 78
    }
  ];

  const filteredQuestions = questions.filter(question => {
    const matchesDifficulty = difficultyFilter === 'All' || question.difficulty === difficultyFilter;
    const matchesType = typeFilter === 'All' || question.type === typeFilter;
    return matchesDifficulty && matchesType;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center animate-slide-down">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">View Questions (Module - Visual Probability)</h1>
        </div>
        <Link to="/tests" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg">
          <span className="transform transition-transform duration-200 hover:-translate-x-1">←</span>
          <span>Back</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-8 animate-slide-right" style={{animationDelay: '0.1s'}}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
          <div className="mb-4">
            <p className="text-gray-600 mb-4 animate-count-up">Total Number of Questions Available: 125</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
              >
                <option value="All">All Types</option>
                <option value="Single choice">Single Choice</option>
                <option value="Multiple choice">Multiple Choice</option>
                <option value="Short answer">Short Answer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question, index) => (
          <div 
            key={question.id} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up"
            style={{animationDelay: `${0.2 + index * 0.1}s`}}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-4">
                  <span className="text-lg font-semibold text-gray-600">{question.id}.</span>
                  <div className="flex-1">
                    <p className="text-gray-800 mb-3">{question.text}</p>
                    <div className="flex items-center space-x-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {question.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getSuccessRateColor(question.successRate)}`}>
                          {question.successRate}%
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
          <span>+</span>
          <span>Add a Question</span>
        </button>
        
        <Link 
          to="/tests/generate"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>✨</span>
          <span>Generate with AI</span>
        </Link>
      </div>
    </div>
  );
};

export default ViewQuestions;
