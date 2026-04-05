import React, { useState, useEffect, useCallback } from 'react';
import leaderboardService from '../services/leaderboardService';
import classesService from '../services/classesService';

const Leaderboards = () => {
  const [activeTab, setActiveTab] = useState('xp');
  const [loading, setLoading] = useState(false);
  const [allStudentsData, setAllStudentsData] = useState([]); // Store all fetched data
  const [students, setStudents] = useState([]); // Filtered and sorted data
  const [statistics, setStatistics] = useState({
    highest_xp: 0,
    best_average_score: 0,
    active_students: 0,
    class_active_students: null,
  });
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    class_id: '',
  });

  const fetchClasses = useCallback(async () => {
    try {
      const response = await classesService.getClasses();
      const classesData = response.data || response || [];
      const classesList = classesData.map(cls => ({
        id: cls.id || cls.uuid,
        name: cls.name || `${cls.grade || ''} ${cls.section || ''}`.trim() || cls
      })).filter(cls => cls.id && cls.name);
      setClasses(classesList);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setClasses([]);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const leaderboardFilters = {
        sort_by: activeTab === 'xp' ? 'xp' : 'score',
      };

      const response = await leaderboardService.getLeaderboard(leaderboardFilters);
      const data = response.data || response;
      
      let studentsData = [];
      let stats = {};
      
      if (data.results) {
        studentsData = data.results;
        stats = data.statistics || {};
      } else if (Array.isArray(data)) {
        studentsData = data;
      } else if (data.data && Array.isArray(data.data)) {
        studentsData = data.data;
        stats = data.statistics || {};
      }

      const mappedStudents = studentsData.map((student) => ({
        id: student.id || student.uuid,
        name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.username,
        class: student.class_name || 'N/A',
        class_id: student.class_id,
        xp: student.total_exp || 0,
        averageScore: student.average_score ? Math.round(student.average_score) : 0,
        grade: student.class_name ? student.class_name.match(/\d+/)?.[0] : null, // Extract grade from class name
        subjects: student.subjects || [], // Store subjects array for filtering
      }));

      setAllStudentsData(mappedStudents);
      setStatistics({
        highest_xp: stats.highest_xp || 0,
        best_average_score: stats.best_average_score || 0,
        active_students: stats.active_students || 0,
        class_active_students: stats.class_active_students,
      });
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setAllStudentsData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]); // Only refetch when tab changes (sort order changes)

  const applyFilters = useCallback(() => {
    let filtered = [...allStudentsData];

    if (filters.class_id) {
      filtered = filtered.filter(student => student.class_id === filters.class_id);
    }

    if (activeTab === 'xp') {
      filtered.sort((a, b) => b.xp - a.xp);
    } else {
      filtered.sort((a, b) => b.averageScore - a.averageScore);
    }

    const studentsWithRank = filtered.map((student, index) => ({
      ...student,
      rank: index + 1,
      trophy: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
    }));

    setStudents(studentsWithRank);
  }, [allStudentsData, filters, activeTab]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (allStudentsData.length > 0) {
      applyFilters();
    }
  }, [applyFilters, allStudentsData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Leaderboards</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-slide-right" style={{animationDelay: '0.1s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
          <select
            value={filters.class_id}
            onChange={(e) => handleFilterChange('class_id', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('xp')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'xp'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              By XP
            </button>
            <button
              onClick={() => handleTabChange('score')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'score'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              By Score
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform hover:shadow-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.4s'}}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-gray-600">Loading leaderboard...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No students found matching the filters.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current XP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr 
                  key={student.id || student.rank} 
                  className={`transform hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 animate-slide-up ${
                    student.rank <= 3 ? 'bg-yellow-50' : ''
                  }`}
                  style={{animationDelay: `${0.5 + index * 0.05}s`}}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span className="animate-count-up">{student.rank}</span>
                      {student.trophy && <span className="text-lg transform transition-transform duration-200 hover:scale-125 hover:rotate-12">{student.trophy}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="animate-count-up">{student.xp}</span> XP
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="animate-count-up">{student.averageScore}</span>%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500 mb-2 animate-count-up">
              {statistics.highest_xp.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Highest XP</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.7s'}}>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2 animate-count-up">
              {statistics.best_average_score ? `${Math.round(statistics.best_average_score)}%` : '0%'}
            </div>
            <div className="text-sm text-gray-600">Best Average Score</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.8s'}}>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2 animate-count-up">
              {statistics.class_active_students !== null
                ? statistics.class_active_students
                : statistics.active_students}
            </div>
            <div className="text-sm text-gray-600">
              {filters.class_id ? 'Active Students (Class)' : 'Active Students'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
