import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GenerateWithAI = () => {
  const [questionCount, setQuestionCount] = useState(10);
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    easy: 40,
    medium: 40,
    hard: 20
  });
  const [selectedPreset, setSelectedPreset] = useState('');

  const presets = [
    { id: 'balanced', label: 'Balanced', easy: 40, medium: 40, hard: 20 },
    { id: 'challenging', label: 'Challenging', easy: 20, medium: 30, hard: 50 },
    { id: 'beginner', label: 'Beginner Friendly', easy: 60, medium: 30, hard: 10 }
  ];

  const applyPreset = (preset) => {
    setDifficultyDistribution({
      easy: preset.easy,
      medium: preset.medium,
      hard: preset.hard
    });
    setSelectedPreset(preset.id);
  };

  const updateDistribution = (type, value) => {
    const newDistribution = { ...difficultyDistribution, [type]: value };
    const total = newDistribution.easy + newDistribution.medium + newDistribution.hard;
    
    if (total <= 100) {
      setDifficultyDistribution(newDistribution);
      setSelectedPreset('');
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center animate-slide-down">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Generate with AI</h1>
        </div>
        <Link to="/tests" className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 transform transition-all duration-200 hover:scale-105 hover:-translate-x-1">
          <span className="transform transition-transform duration-200 hover:-translate-x-1">←</span>
          <span>Back to View Questions</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.1s'}}>
          {/* Question Count */}
          <div className="mb-8 animate-slide-right" style={{animationDelay: '0.2s'}}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How many questions to generate?</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transform transition-all duration-200 hover:scale-110 hover:shadow-md"
              >
                -
              </button>
              <input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                className="w-20 text-center border border-gray-300 rounded px-3 py-2 transform transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500"
                min="1"
                max="50"
              />
              <button
                onClick={() => setQuestionCount(Math.min(50, questionCount + 1))}
                className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transform transition-all duration-200 hover:scale-110 hover:shadow-md"
              >
                +
              </button>
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="mb-8 animate-slide-right" style={{animationDelay: '0.3s'}}>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Probability Distribution for Easy, Medium, Hard</h2>
            <p className="text-gray-600 mb-6">Define the ratio of difficulty for the generated questions. The total must be 100%.</p>
            
            <div className="space-y-4">
              {/* Easy */}
              <div className="flex items-center space-x-4 animate-slide-up" style={{animationDelay: '0.4s'}}>
                <div className="w-20 text-sm font-medium text-gray-700">Easy:</div>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={difficultyDistribution.easy}
                    onChange={(e) => updateDistribution('easy', parseInt(e.target.value))}
                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider-green transform transition-all duration-200 hover:scale-105"
                  />
                </div>
                <div className="w-16 text-sm font-medium text-gray-700 text-right animate-count-up">
                  {difficultyDistribution.easy}%
                </div>
              </div>

              {/* Medium */}
              <div className="flex items-center space-x-4 animate-slide-up" style={{animationDelay: '0.5s'}}>
                <div className="w-20 text-sm font-medium text-gray-700">Medium:</div>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={difficultyDistribution.medium}
                    onChange={(e) => updateDistribution('medium', parseInt(e.target.value))}
                    className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer slider-yellow transform transition-all duration-200 hover:scale-105"
                  />
                </div>
                <div className="w-16 text-sm font-medium text-gray-700 text-right animate-count-up">
                  {difficultyDistribution.medium}%
                </div>
              </div>

              {/* Hard */}
              <div className="flex items-center space-x-4 animate-slide-up" style={{animationDelay: '0.6s'}}>
                <div className="w-20 text-sm font-medium text-gray-700">Hard:</div>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={difficultyDistribution.hard}
                    onChange={(e) => updateDistribution('hard', parseInt(e.target.value))}
                    className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider-red transform transition-all duration-200 hover:scale-105"
                  />
                </div>
                <div className="w-16 text-sm font-medium text-gray-700 text-right animate-count-up">
                  {difficultyDistribution.hard}%
                </div>
              </div>
            </div>

            {/* Total Check */}
            <div className="mt-4 text-sm text-gray-600 animate-slide-right" style={{animationDelay: '0.7s'}}>
              Total: <span className="animate-count-up">{difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard}</span>%
              {difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard !== 100 && (
                <span className="text-red-600 ml-2 animate-shake">(Must equal 100%)</span>
              )}
            </div>
          </div>

          {/* Presets */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Presets</h2>
            <div className="flex space-x-4">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedPreset === preset.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <Link
              to="/tests/ai-generated"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>✨</span>
              <span>Generate Questions</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateWithAI;
