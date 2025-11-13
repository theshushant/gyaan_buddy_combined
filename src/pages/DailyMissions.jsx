import React, { useState, useEffect, useCallback } from 'react';
import classesService from '../services/classesService';
import subjectsService from '../services/subjectsService';
import testsService from '../services/testsService';

const DailyMissions = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [allMissions, setAllMissions] = useState([]); // Store all missions for the month (for calendar indicators)

  // Generate calendar days for current month
  const getCalendarDays = useCallback(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, hasActivity: false });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Check if there are missions for this day
      const hasActivity = allMissions.some(mission => {
        if (mission.mission_date) {
          const missionDate = new Date(mission.mission_date);
          return missionDate.getDate() === day && 
                 missionDate.getMonth() === currentMonth && 
                 missionDate.getFullYear() === currentYear;
        }
        return false;
      });
      
      days.push({ 
        day, 
        hasActivity,
        isSelected: day === selectedDate
      });
    }
    
    return days;
  }, [currentMonth, currentYear, allMissions, selectedDate]);

  const calendarDays = getCalendarDays();

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const response = await classesService.getClasses();
      const classesData = response.data || response || [];
      const classesList = classesData.map(cls => ({
        id: cls.id || cls.uuid,
        name: cls.name || `${cls.grade || ''} ${cls.section || ''}`.trim() || cls
      })).filter(cls => cls.id && cls.name);
      setClasses(classesList);
      
      // Auto-select first class if available
      if (classesList.length > 0 && !selectedClass) {
        setSelectedClass(classesList[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, [selectedClass]);

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      const response = await subjectsService.getSubjects();
      const subjectsData = response.data || response || [];
      const subjectsList = subjectsData.map(subject => ({
        id: subject.id || subject.uuid,
        name: subject.name || subject
      })).filter(subject => subject.id && subject.name);
      setSubjects(subjectsList);
      
      // Auto-select first subject if available
      if (subjectsList.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectsList[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  }, [selectedSubject]);

  // Fetch missions based on selected filters
  const fetchMissions = useCallback(async () => {
    if (!selectedClass || !selectedSubject) {
      setMissions([]);
      setAllMissions([]);
      return;
    }

    setLoadingMissions(true);
    try {
      // Fetch all missions for the selected class and subject
      const response = await testsService.getMissions({
        class: selectedClass,
        subject: selectedSubject
      });
      
      const missionsData = response.data || response || [];
      
      // Filter missions for the current month
      const monthMissions = missionsData.filter(mission => {
        if (mission.mission_date) {
          const missionDate = new Date(mission.mission_date);
          return missionDate.getMonth() === currentMonth && 
                 missionDate.getFullYear() === currentYear;
        }
        return false;
      });
      
      // Store all missions for calendar indicators
      setAllMissions(monthMissions);
      
      // Build date for selected day
      const selectedDateObj = new Date(currentYear, currentMonth, selectedDate);
      const dateString = selectedDateObj.toISOString().split('T')[0];
      
      // Filter missions for the selected date
      const filteredMissions = monthMissions.filter(mission => {
        if (mission.mission_date) {
          const missionDate = new Date(mission.mission_date).toISOString().split('T')[0];
          return missionDate === dateString;
        }
        return false;
      });
      
      // Transform missions to include completion rate and status
      const transformedMissions = filteredMissions.map(mission => {
        // Calculate completion rate (mock for now, can be enhanced with real progress data)
        const completionRate = Math.floor(Math.random() * 100);
        let status, statusColor;
        if (completionRate >= 70) {
          status = 'High';
          statusColor = 'green';
        } else if (completionRate >= 40) {
          status = 'Medium';
          statusColor = 'yellow';
        } else {
          status = 'Low';
          statusColor = 'red';
        }
        
        return {
          id: mission.id || mission.uuid,
          name: mission.title,
          description: mission.description,
          completionRate,
          status,
          statusColor,
          mission_date: mission.mission_date,
          duration: mission.duration,
          base_exp: mission.base_exp,
          exp_multiplier: mission.exp_multiplier
        };
      });
      
      setMissions(transformedMissions);
    } catch (error) {
      console.error('Failed to fetch missions:', error);
      setMissions([]);
      setAllMissions([]);
    } finally {
      setLoadingMissions(false);
    }
  }, [selectedClass, selectedSubject, selectedDate, currentMonth, currentYear]);

  // Fetch classes and subjects on mount
  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [fetchClasses, fetchSubjects]);

  // Fetch missions when filters change
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchMissions();
    }
  }, [selectedClass, selectedSubject, selectedDate, currentMonth, currentYear, fetchMissions]);

  // Handle month navigation
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

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
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={loadingClasses}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">{loadingClasses ? 'Loading classes...' : 'Select Class'}</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="animate-slide-right" style={{animationDelay: '0.3s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={loadingSubjects}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">{loadingSubjects ? 'Loading subjects...' : 'Select Subject'}</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={handlePreviousMonth}
            className="text-gray-400 hover:text-gray-600 transform transition-all duration-200 hover:scale-125 hover:-translate-x-1"
          >
            ◀
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button 
            onClick={handleNextMonth}
            className="text-gray-400 hover:text-gray-600 transform transition-all duration-200 hover:scale-125 hover:translate-x-1"
          >
            ▶
          </button>
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
              day === null ? (
                <div key={`empty-${index}`} className="p-2"></div>
              ) : (
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
              )
            ))}
          </div>
        </div>

        {/* Missions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.7s'}}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 animate-slide-right">
            Missions for {monthNames[currentMonth]} {selectedDate}, {currentYear}
          </h3>

          {loadingMissions ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading missions...</div>
            </div>
          ) : !selectedClass || !selectedSubject ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Please select a class and subject to view missions.</div>
            </div>
          ) : missions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No missions found for the selected date.</div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyMissions;
