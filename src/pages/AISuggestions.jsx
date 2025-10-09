import React, { useState } from 'react';

const AISuggestions = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const suggestions = [
    {
      id: 1,
      category: 'content',
      title: 'Create Interactive Quiz for Algebra Basics',
      description: 'Based on student performance data, create an interactive quiz focusing on quadratic equations and factoring techniques.',
      priority: 'high',
      impact: 'High engagement expected',
      timeEstimate: '30 minutes',
      studentsAffected: 25
    },
    {
      id: 2,
      category: 'assessment',
      title: 'Adaptive Test for Weak Areas',
      description: 'Generate personalized assessments targeting individual student weaknesses in trigonometry and geometry.',
      priority: 'medium',
      impact: 'Improved learning outcomes',
      timeEstimate: '45 minutes',
      studentsAffected: 15
    },
    {
      id: 3,
      category: 'engagement',
      title: 'Gamified Learning Module',
      description: 'Transform the current physics module into a game-based learning experience with points, badges, and leaderboards.',
      priority: 'high',
      impact: 'Increased student motivation',
      timeEstimate: '2 hours',
      studentsAffected: 40
    },
    {
      id: 4,
      category: 'content',
      title: 'Multimedia Resources for Chemistry',
      description: 'Add video explanations and 3D models to help students visualize molecular structures and chemical reactions.',
      priority: 'medium',
      impact: 'Better concept understanding',
      timeEstimate: '1 hour',
      studentsAffected: 30
    },
    {
      id: 5,
      category: 'assessment',
      title: 'Peer Review Assignment',
      description: 'Implement peer review system for essay assignments to improve writing skills and critical thinking.',
      priority: 'low',
      impact: 'Enhanced collaboration',
      timeEstimate: '20 minutes',
      studentsAffected: 20
    },
    {
      id: 6,
      category: 'engagement',
      title: 'Virtual Lab Simulation',
      description: 'Create virtual laboratory experiments for biology students to practice dissection and observation skills.',
      priority: 'high',
      impact: 'Practical skill development',
      timeEstimate: '3 hours',
      studentsAffected: 35
    }
  ];

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (selectedCategory === 'all') return true;
    return suggestion.category === selectedCategory;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'content': return '📚';
      case 'assessment': return '📝';
      case 'engagement': return '🎮';
      default: return '💡';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">AI Suggestions</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{animationDelay: '0.1s'}}>Personalized recommendations to enhance your teaching and student learning experience.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2 animate-count-up">{suggestions.length}</div>
            <div className="text-sm text-gray-600">Total Suggestions</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2 animate-count-up">
              {suggestions.filter(s => s.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2 animate-count-up">
              {suggestions.reduce((sum, s) => sum + s.studentsAffected, 0)}
            </div>
            <div className="text-sm text-gray-600">Students Affected</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.5s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2 animate-count-up">
              {Math.round(suggestions.reduce((sum, s) => {
                const time = parseInt(s.timeEstimate);
                return sum + time;
              }, 0) / suggestions.length)}m
            </div>
            <div className="text-sm text-gray-600">Avg. Time</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setSelectedCategory('content')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === 'content' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setSelectedCategory('assessment')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === 'assessment' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Assessment
          </button>
          <button
            onClick={() => setSelectedCategory('engagement')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === 'engagement' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Engagement
          </button>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSuggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-slide-up"
            style={{animationDelay: `${0.6 + index * 0.1}s`}}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center transform transition-transform duration-200 hover:scale-110">
                  <span className="text-lg">{getCategoryIcon(suggestion.category)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{suggestion.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border transform transition-all duration-200 hover:scale-105 ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority} priority
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{suggestion.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Impact:</span>
                <span className="font-medium text-gray-800">{suggestion.impact}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time Estimate:</span>
                <span className="font-medium text-gray-800">{suggestion.timeEstimate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Students Affected:</span>
                <span className="font-medium text-gray-800">{suggestion.studentsAffected}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                Implement
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
                Learn More
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSuggestions.length === 0 && (
        <div className="text-center py-12 animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="text-gray-500 text-lg">No suggestions found for this category.</div>
        </div>
      )}

      {/* AI Insights */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '1.2s'}}>
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center transform transition-transform duration-200 hover:rotate-12">
            <span className="text-white text-lg">✨</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Insights</h3>
            <p className="text-gray-600 mb-3">
              Based on your teaching patterns and student performance data, we recommend focusing on interactive content creation and personalized assessments. Your students show high engagement with gamified elements and perform better with visual learning materials.
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium transform transition-all duration-200 hover:scale-105 hover:translate-x-1">
              View Detailed Analysis →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;
