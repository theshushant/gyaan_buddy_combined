import React, { useState } from 'react';

const DailyMissions = () => {
  const [selectedDate, setSelectedDate] = useState(5);

  const missions = [
    {
      name: "Beejganit ka Parichay",
      completionRate: 85,
      status: "High",
      statusColor: "green"
    },
    {
      name: "Prakash ka Paravartan",
      completionRate: 55,
      status: "Medium",
      statusColor: "yellow"
    },
    {
      name: "Shakespeare ka Natak",
      completionRate: 25,
      status: "Low",
      statusColor: "red"
    }
  ];

  const calendarDays = [
    { day: 1, hasActivity: true },
    { day: 2, hasActivity: true },
    { day: 3, hasActivity: true },
    { day: 4, hasActivity: false },
    { day: 5, hasActivity: false, isSelected: true },
    { day: 6, hasActivity: false },
    { day: 7, hasActivity: false },
    { day: 8, hasActivity: false },
    { day: 9, hasActivity: false },
    { day: 10, hasActivity: false },
    { day: 11, hasActivity: true },
    { day: 12, hasActivity: true },
    { day: 13, hasActivity: false },
    { day: 14, hasActivity: false },
    { day: 15, hasActivity: false },
    { day: 16, hasActivity: false },
    { day: 17, hasActivity: false },
    { day: 18, hasActivity: false },
    { day: 19, hasActivity: false },
    { day: 20, hasActivity: false },
    { day: 21, hasActivity: false },
    { day: 22, hasActivity: false },
    { day: 23, hasActivity: false },
    { day: 24, hasActivity: false },
    { day: 25, hasActivity: false },
    { day: 26, hasActivity: false },
    { day: 27, hasActivity: false },
    { day: 28, hasActivity: false },
    { day: 29, hasActivity: false },
    { day: 30, hasActivity: false },
    { day: 31, hasActivity: false }
  ];

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Daily Missions</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{animationDelay: '0.1s'}}>Select a class and subject to view mission completion rates.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <div className="animate-slide-right" style={{animationDelay: '0.2s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105">
            <option>Kaksha 8</option>
            <option>Kaksha 9</option>
            <option>Kaksha 10</option>
          </select>
        </div>
        
        <div className="animate-slide-right" style={{animationDelay: '0.3s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105">
            <option>Ganit</option>
            <option>Vigyan</option>
            <option>Hindi</option>
            <option>English</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
        <div className="flex justify-between items-center mb-4">
          <button className="text-gray-400 hover:text-gray-600 transform transition-all duration-200 hover:scale-125 hover:-translate-x-1">◀</button>
          <h3 className="text-lg font-semibold text-gray-800">August 2024</h3>
          <button className="text-gray-400 hover:text-gray-600 transform transition-all duration-200 hover:scale-125 hover:translate-x-1">▶</button>
        </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2 animate-slide-down" style={{animationDelay: `${0.5 + index * 0.05}s`}}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ day, hasActivity, isSelected }, index) => (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`relative p-2 text-sm rounded-lg transition-all duration-300 transform hover:scale-110 animate-slide-up ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                }`}
                style={{animationDelay: `${0.6 + index * 0.01}s`}}
              >
                {day}
                {hasActivity && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full animate-pulse-custom"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Missions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.7s'}}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 animate-slide-right">
            Missions for August {selectedDate}, 2024
          </h3>

          <div className="space-y-4">
            {missions.map((mission, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg p-4 transform hover:scale-105 transition-all duration-300 hover:shadow-md hover:bg-blue-50 animate-slide-up"
                style={{animationDelay: `${0.8 + index * 0.1}s`}}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">{mission.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full transform transition-all duration-200 hover:scale-110 ${
                    mission.statusColor === 'green' ? 'bg-green-100 text-green-800' :
                    mission.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {mission.status}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Completion Rate</span>
                    <span className="animate-count-up">{mission.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ease-out animate-slide-right ${
                        mission.statusColor === 'green' ? 'bg-green-500' :
                        mission.statusColor === 'yellow' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${mission.completionRate}%` }}
                    ></div>
                  </div>
                </div>

                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transform transition-all duration-200 hover:scale-105 hover:translate-x-1">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyMissions;
