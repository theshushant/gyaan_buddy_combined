import React, { useState, useEffect, useCallback } from 'react';
import leaderboardService from '../services/leaderboardService';
import classesService from '../services/classesService';
import subjectsService from '../services/subjectsService';

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
    subject_active_students: null,
  });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({
    class_id: '',
    subject_id: '',
    grade: '',
    min_xp: '',
    max_xp: '',
    min_score: '',
    max_score: '',
  });
  const [scope, setScope] = useState('class'); // 'class' or 'grade'

  // Fetch classes and subjects
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

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await subjectsService.getSubjects();
      const subjectsData = response.data || response || [];
      const subjectsList = subjectsData.map(subject => ({
        id: subject.id || subject.uuid,
        name: subject.name || subject
      })).filter(subject => subject.id && subject.name);
      setSubjects(subjectsList);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setSubjects([]);
    }
  }, []);

  // Fetch leaderboard data (only fetch once, no filters applied)
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data without filters, only sort by current tab
      const leaderboardFilters = {
        sort_by: activeTab === 'xp' ? 'xp' : 'score',
      };

      const response = await leaderboardService.getLeaderboard(leaderboardFilters);
      const data = response.data || response;
      
      // Handle response structure
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

      // Map students data (without rank yet, will be added after filtering)
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
        subject_active_students: stats.subject_active_students,
      });
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setAllStudentsData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]); // Only refetch when tab changes (sort order changes)

  // Apply filters to fetched data
  const applyFilters = useCallback(() => {
    let filtered = [...allStudentsData];

    // Filter by class_id
    if (filters.class_id) {
      filtered = filtered.filter(student => student.class_id === filters.class_id);
    }

    // Filter by subject_id
    if (filters.subject_id) {
      filtered = filtered.filter(student => {
        if (!student.subjects || !Array.isArray(student.subjects)) return false;
        return student.subjects.some(subject => 
          (subject.id || subject.uuid) === filters.subject_id
        );
      });
    }

    // Filter by grade (extract grade from class name)
    if (filters.grade) {
      filtered = filtered.filter(student => {
        const studentGrade = student.grade || (student.class ? student.class.match(/\d+/)?.[0] : null);
        return studentGrade && studentGrade.includes(filters.grade);
      });
    }

    // Filter by XP range
    if (filters.min_xp) {
      const minXp = parseInt(filters.min_xp);
      if (!isNaN(minXp)) {
        filtered = filtered.filter(student => student.xp >= minXp);
      }
    }
    if (filters.max_xp) {
      const maxXp = parseInt(filters.max_xp);
      if (!isNaN(maxXp)) {
        filtered = filtered.filter(student => student.xp <= maxXp);
      }
    }

    // Filter by score range
    if (filters.min_score) {
      const minScore = parseInt(filters.min_score);
      if (!isNaN(minScore)) {
        filtered = filtered.filter(student => student.averageScore >= minScore);
      }
    }
    if (filters.max_score) {
      const maxScore = parseInt(filters.max_score);
      if (!isNaN(maxScore)) {
        filtered = filtered.filter(student => student.averageScore <= maxScore);
      }
    }

    // Sort by active tab
    if (activeTab === 'xp') {
      filtered.sort((a, b) => b.xp - a.xp);
    } else {
      filtered.sort((a, b) => b.averageScore - a.averageScore);
    }

    // Add rank and trophy
    const studentsWithRank = filtered.map((student, index) => ({
      ...student,
      rank: index + 1,
      trophy: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
    }));

    setStudents(studentsWithRank);
  }, [allStudentsData, filters, activeTab]);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, [fetchClasses, fetchSubjects]);

  // Fetch data when tab changes (sort order changes)
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Apply filters whenever filters or allStudentsData changes
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Leaderboards</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-slide-right" style={{animationDelay: '0.1s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select 
            value={filters.subject_id}
            onChange={(e) => handleFilterChange('subject_id', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="animate-slide-right" style={{animationDelay: '0.2s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
          <select 
            value={filters.class_id}
            onChange={(e) => handleFilterChange('class_id', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="animate-slide-right" style={{animationDelay: '0.3s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
          <input
            type="text"
            value={filters.grade}
            onChange={(e) => handleFilterChange('grade', e.target.value)}
            placeholder="e.g., 9, 10"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
          />
        </div>

        <div className="animate-slide-right" style={{animationDelay: '0.4s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setScope('class')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transform transition-all duration-200 hover:scale-105 ${
                scope === 'class' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-500'
              }`}
            >
              Class
            </button>
            <button 
              onClick={() => setScope('grade')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transform transition-all duration-200 hover:scale-105 ${
                scope === 'grade' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-500'
              }`}
            >
              Grade
            </button>
          </div>
        </div>
      </div>

      {/* XP and Score Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="animate-slide-right" style={{animationDelay: '0.5s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min XP</label>
          <input
            type="number"
            value={filters.min_xp}
            onChange={(e) => handleFilterChange('min_xp', e.target.value)}
            placeholder="Minimum XP"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="animate-slide-right" style={{animationDelay: '0.6s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max XP</label>
          <input
            type="number"
            value={filters.max_xp}
            onChange={(e) => handleFilterChange('max_xp', e.target.value)}
            placeholder="Maximum XP"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="animate-slide-right" style={{animationDelay: '0.7s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Score</label>
          <input
            type="number"
            value={filters.min_score}
            onChange={(e) => handleFilterChange('min_score', e.target.value)}
            placeholder="Minimum Score"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="animate-slide-right" style={{animationDelay: '0.8s'}}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Score</label>
          <input
            type="number"
            value={filters.max_score}
            onChange={(e) => handleFilterChange('max_score', e.target.value)}
            placeholder="Maximum Score"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('xp')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'xp'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              By XP
            </button>
            <button
              onClick={() => handleTabChange('score')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'score'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              By Score
            </button>
          </nav>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform hover:shadow-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.4s'}}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

      {/* Additional Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2 animate-count-up">
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
                : statistics.subject_active_students !== null 
                  ? statistics.subject_active_students 
                  : statistics.active_students}
            </div>
            <div className="text-sm text-gray-600">
              {filters.class_id ? 'Active Students (Class)' : 
               filters.subject_id ? 'Active Students (Subject)' : 
               'Active Students'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
