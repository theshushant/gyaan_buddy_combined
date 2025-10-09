import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ModuleDetail = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 3;

  const nextSlide = () => {
    setCurrentSlide(prev => prev < totalSlides ? prev + 1 : 1);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => prev > 1 ? prev - 1 : totalSlides);
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center animate-slide-down">
        <div className="flex items-center space-x-4">
          <Link to="/modules" className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 transform transition-all duration-200 hover:scale-105 hover:-translate-x-1">
            <span className="transform transition-transform duration-200 hover:-translate-x-1">←</span>
            <span>Back to Modules</span>
          </Link>
        </div>
        <div className="flex space-x-4">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-md">
            <span className="transform transition-transform duration-200 hover:rotate-12">✏️</span>
            <span>Edit Slides</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg">
            <span className="transform transition-transform duration-200 hover:rotate-12">👁️</span>
            <span>View Questions</span>
          </button>
        </div>
      </div>

      {/* Module Title */}
      <div className="mb-8 animate-slide-right" style={{animationDelay: '0.1s'}}>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Module 2.1: Suchak (Indicators)</h1>
        <p className="text-lg text-gray-600">Vigyan (Science) - Adhyay 2: Aml, Ksharak evam Lavan</p>
      </div>

      {/* Mobile Phone Mockup */}
      <div className="flex justify-center mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
        <div className="relative w-80 h-96 bg-gray-800 rounded-3xl p-4 shadow-2xl transform hover:scale-105 transition-all duration-500 hover:shadow-3xl">
          <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
            {/* Phone Content */}
            <div className="p-6 h-full flex flex-col">
              <h2 className="text-xl font-bold text-blue-600 mb-4 animate-slide-down">
                What are Indicators? (Suchak kya hain?)
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-6 animate-slide-right">
                An indicator is a substance that changes color when it is added to an acidic or a basic solution. 
                Litmus, turmeric, and China rose are some common natural indicators. Priya uses turmeric paste 
                on a paper strip to test a solution. What will she observe?
              </p>
              
              {/* Slide Navigation */}
              <div className="mt-auto flex justify-center items-center space-x-4">
                <button 
                  onClick={prevSlide} 
                  className="text-gray-400 hover:text-gray-600 transform transition-all duration-200 hover:scale-125 hover:-translate-x-1"
                >
                  ←
                </button>
                <div className="flex space-x-2">
                  {[1, 2, 3].map((slide) => (
                    <div
                      key={slide}
                      className={`w-2 h-2 rounded-full transition-all duration-300 transform hover:scale-125 ${
                        slide === currentSlide ? 'bg-blue-600 animate-pulse-custom' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button 
                  onClick={nextSlide} 
                  className="text-gray-400 hover:text-gray-600 transform transition-all duration-200 hover:scale-125 hover:translate-x-1"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* External Navigation */}
      <div className="flex justify-center items-center space-x-4 animate-slide-up" style={{animationDelay: '0.3s'}}>
        <button 
          onClick={prevSlide} 
          className="text-gray-400 hover:text-gray-600 text-2xl transform transition-all duration-200 hover:scale-125 hover:-translate-x-2"
        >
          ←
        </button>
        <div className="flex space-x-2">
          {[1, 2, 3].map((slide) => (
            <div
              key={slide}
              className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
                slide === currentSlide ? 'bg-blue-600 animate-pulse-custom' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <button 
          onClick={nextSlide} 
          className="text-gray-400 hover:text-gray-600 text-2xl transform transition-all duration-200 hover:scale-125 hover:translate-x-2"
        >
          →
        </button>
      </div>

      {/* Additional Module Information */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Learning Objectives</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="transform transition-all duration-200 hover:translate-x-2">• Understand what indicators are</li>
            <li className="transform transition-all duration-200 hover:translate-x-2">• Identify common natural indicators</li>
            <li className="transform transition-all duration-200 hover:translate-x-2">• Explain how indicators work</li>
            <li className="transform transition-all duration-200 hover:translate-x-2">• Apply knowledge to practical examples</li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.5s'}}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Concepts</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="transform transition-all duration-200 hover:translate-x-2">• Acid-base indicators</li>
            <li className="transform transition-all duration-200 hover:translate-x-2">• Natural vs synthetic indicators</li>
            <li className="transform transition-all duration-200 hover:translate-x-2">• Color change mechanism</li>
            <li className="transform transition-all duration-200 hover:translate-x-2">• Practical applications</li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Assessment</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Questions:</span>
              <span className="font-medium animate-count-up">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difficulty:</span>
              <span className="font-medium">Medium</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">15 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
