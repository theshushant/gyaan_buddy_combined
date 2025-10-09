import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ModulesAssignments = () => {
  const [expandedChapters, setExpandedChapters] = useState([1, 2]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const chapters = [
    {
      id: 1,
      title: "Adhyay 1: Rasayanik Abhikriyaen (Chemical Reactions)",
      completionRate: 85,
      isDue: false,
      modules: [
        { id: 1, title: "Module 1.1: Rasayanik Samikaran (Chemical Equations)" },
        { id: 2, title: "Module 1.2: Abhikriyaon ke Prakar (Types of Reactions)" }
      ]
    },
    {
      id: 2,
      title: "Adhyay 2: Aml, Ksharak evam Lavan (Acids, Bases and Salts)",
      completionRate: 62,
      isDue: true,
      modules: [
        { id: 3, title: "Module 2.1: Suchak (Indicators)" },
        { id: 4, title: "Module 2.2: pH Maan (pH Value)" },
        { id: 5, title: "Module 2.3: Dainik Jeevan mein pH ka Mahatva (Importance of pH in Daily Life)" }
      ]
    },
    {
      id: 3,
      title: "Adhyay 3: Dhatu evam Adhatu (Metals and Non-metals)",
      completionRate: 0,
      isDue: false,
      modules: []
    }
  ];

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Modules & Assignments</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <div className="animate-slide-right" style={{animationDelay: '0.1s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105">
            <option>Kaksha 10</option>
            <option>Kaksha 9</option>
            <option>Kaksha 8</option>
          </select>
        </div>
        
        <div className="animate-slide-right" style={{animationDelay: '0.2s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105">
            <option>Vigyan (Science)</option>
            <option>Ganit (Mathematics)</option>
            <option>Hindi</option>
            <option>English</option>
          </select>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        {chapters.map((chapter, index) => (
          <div 
            key={chapter.id} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up"
            style={{animationDelay: `${0.3 + index * 0.1}s`}}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-800">{chapter.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Mark Entire Chapter Due</span>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 transform hover:scale-110 ${
                      chapter.isDue ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
                        chapter.isDue ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-blue-600 font-medium animate-count-up">
                  Completion Rate: {chapter.completionRate}%
                </span>
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="text-gray-400 hover:text-gray-600 transform transition-all duration-200 hover:scale-125 hover:rotate-90"
                >
                  {expandedChapters.includes(chapter.id) ? '◀' : '▶'}
                </button>
              </div>
            </div>

            {expandedChapters.includes(chapter.id) && (
              <div className="space-y-3 animate-slide-down">
                {chapter.modules.map((module, moduleIndex) => (
                  <div 
                    key={module.id} 
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:bg-blue-50 hover:shadow-md animate-slide-up"
                    style={{animationDelay: `${0.4 + index * 0.1 + moduleIndex * 0.05}s`}}
                  >
                    <span className="text-gray-700">{module.title}</span>
                    <Link 
                      to={`/modules/${module.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg"
                    >
                      <span className="transform transition-transform duration-200 hover:rotate-12">👁️</span>
                      <span>View</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModulesAssignments;
