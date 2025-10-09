import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AIGeneratedQuestions = () => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const questions = [
    {
      id: 1,
      text: "Kya Bharat ki rajdhani Delhi hai?",
      englishText: "(Is the capital of India Delhi?)",
      type: "Single Choice",
      difficulty: "Easy"
    },
    {
      id: 2,
      text: "Prakash sanshleshan ki prakriya samjhaayein.",
      englishText: "(Explain the process of photosynthesis.)",
      type: "Short Answer",
      difficulty: "Medium"
    },
    {
      id: 3,
      text: "Inmein se kaunsi abhajya sankhyayein hain? (Sabhi lagu vikalp chunein)",
      englishText: "(Which of the following are prime numbers? Select all that apply)",
      type: "Multiple Choice",
      difficulty: "Medium"
    },
    {
      id: 4,
      text: "Jalvayu parivartan ke karan aur prabhavon ka varnan karein.",
      englishText: "(Describe the causes and effects of climate change.)",
      type: "Short Answer",
      difficulty: "Hard"
    },
    {
      id: 5,
      text: "Mughal samrajya ke pahle samrat kaun the?",
      englishText: "(Who was the first emperor of the Mughal Empire?)",
      type: "Single Choice",
      difficulty: "Easy"
    }
  ];

  const toggleQuestion = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
    setSelectAll(!selectAll);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 animate-slide-down">
          <div>
            <nav className="text-sm text-gray-500 mb-2">
              Modules & Assignments &gt; AI Generated Questions
            </nav>
            <h1 className="text-3xl font-bold text-gray-800">AI Generated Questions</h1>
            <p className="text-gray-600 mt-2">Review, edit, and select questions to add to your question bank.</p>
          </div>
          <Link to="/tests" className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 transform transition-all duration-200 hover:scale-105 hover:-translate-x-1">
            <span className="transform transition-transform duration-200 hover:-translate-x-1">←</span>
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
                <span className="font-medium text-gray-700">Select All</span>
              </label>
              <span className="text-gray-600">{questions.length} questions generated</span>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="divide-y divide-gray-200">
          {questions.map((question) => (
            <div key={question.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => toggleQuestion(question.id)}
                    className="mt-1 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium mb-1">
                      {question.text}
                    </p>
                    <p className="text-gray-500 text-sm mb-3">
                      {question.englishText}
                    </p>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {question.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Generate More</span>
        </button>
        
        <button 
          className="px-6 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          disabled={selectedQuestions.length === 0}
        >
          Add Selected to Bank ({selectedQuestions.length})
        </button>
        
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add All to Bank
        </button>
      </div>
    </div>
  );
};

export default AIGeneratedQuestions;
