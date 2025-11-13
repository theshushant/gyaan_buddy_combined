import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchStudents,
  fetchStudentStats,
  setFilters,
  clearError
} from '../features/students/studentsSlice';
import { fetchClasses } from '../features/classes/classesSlice';

const MyStudents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    students,
    studentStats,
    summary,
    loading,
    error
  } = useSelector(state => state.students);

  const { classes } = useSelector(state => state.classes);

  // Fetch students, stats, and classes on component mount
  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    const hasError = error.students !== null || error.stats !== null
    if (hasError) {
      return // Don't retry if there's already an error
    }

    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchStudents({})),
          dispatch(fetchStudentStats()),
          dispatch(fetchClasses({}))
        ]);
      } catch (err) {
        console.error('Error fetching students data:', err);
      }
    };

    fetchData();
  }, [dispatch, error.students, error.stats]);

  // Update filters and refetch when search or class filter changes
  useEffect(() => {
    // Check if there's already an error - don't retry automatically
    const hasError = error.students !== null
    if (hasError) {
      return // Don't retry if there's already an error
    }

    const filters = {};
    if (searchTerm) {
      filters.search = searchTerm;
    }
    if (selectedClass && selectedClass !== 'All Classes') {
      filters.class = selectedClass;
    }
    
    dispatch(setFilters(filters));
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      dispatch(fetchStudents(filters));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [dispatch, searchTerm, selectedClass, error.students]);

  // Transform API student data to match UI expectations
  const transformStudent = (student) => {
    const firstName = student.first_name || student.firstName || '';
    const lastName = student.last_name || student.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || student.name || 'Unknown';
    const email = student.email || '';
    const classData = student.class || student.class_name || student.class_id || 'N/A';
    
    return {
      id: student.id,
      name: fullName,
      firstName,
      lastName,
      class: classData,
      email,
      phone: student.phone_number || student.phone || '',
      lastActive: student.last_active || student.lastActive || 'N/A',
      totalXP: student.total_xp || student.totalXP || student.xp || 0,
      averageScore: student.average_score || student.averageScore || 0,
      completedModules: student.completed_modules || student.completedModules || 0,
      pendingAssignments: student.pending_assignments || student.pendingAssignments || 0
    };
  };

  // Filter students based on search and class
  const filteredStudents = (students || []).map(transformStudent).filter(student => {
    const matchesSearch = !searchTerm || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = selectedClass === 'All Classes' || 
      (student.class && student.class.toString().includes(selectedClass));
    return matchesSearch && matchesClass;
  });

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">My Students</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{animationDelay: '0.1s'}}>Manage and track your students' progress and performance.</p>
      </div>

      {/* Error Display */}
      {error.students && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error.students}</p>
          <button
            onClick={() => dispatch(clearError('students'))}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 animate-slide-right" style={{animationDelay: '0.2s'}}>
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading.students}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <div className="animate-slide-right" style={{animationDelay: '0.3s'}}>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={loading.students}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option>All Classes</option>
            {Array.isArray(classes) && classes.map((classItem) => {
              const className = classItem.name || classItem.class_name || `${classItem.grade || ''}${classItem.section || ''}` || `Class ${classItem.id}`;
              const classValue = classItem.name || classItem.class_name || classItem.id?.toString() || '';
              return (
                <option key={classItem.id || classItem.name} value={classValue}>
                  {className}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2 animate-count-up">
              {loading.students ? '...' : (studentStats?.total_students || studentStats?.totalStudents || filteredStudents.length || 0)}
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.5s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2 animate-count-up">
              {loading.students ? '...' : (studentStats?.active_today || studentStats?.activeToday || filteredStudents.filter(s => s.lastActive && (s.lastActive.includes('hour') || s.lastActive.includes('minute'))).length || 0)}
            </div>
            <div className="text-sm text-gray-600">Active Today</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2 animate-count-up">
              {loading.students ? '...' : (studentStats?.pending_assignments || studentStats?.pendingAssignments || filteredStudents.reduce((sum, s) => sum + (s.pendingAssignments || 0), 0) || 0)}
            </div>
            <div className="text-sm text-gray-600">Pending Assignments</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.7s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2 animate-count-up">
              {loading.students ? '...' : (
                filteredStudents.length > 0 
                  ? Math.round(filteredStudents.reduce((sum, s) => sum + (s.averageScore || 0), 0) / filteredStudents.length)
                  : (studentStats?.average_score || studentStats?.averageScore || 0)
              )}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {loading.students ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform hover:shadow-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.8s'}}>
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
              <tr 
                key={student.id}
                className="transform hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 animate-slide-up"
                style={{animationDelay: `${0.9 + index * 0.05}s`}}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center transform transition-all duration-200 hover:scale-110">
                        <span className="text-sm font-medium text-blue-600">
                          {(student.firstName?.charAt(0) || student.name?.charAt(0) || '').toUpperCase()}
                          {(student.lastName?.charAt(0) || student.name?.split(' ')[1]?.charAt(0) || '').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email || 'No email'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.class}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.lastActive}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="animate-count-up">{student.totalXP}</span> XP
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full transform transition-all duration-200 hover:scale-110 ${
                    student.averageScore >= 80 ? 'bg-green-100 text-green-800' :
                    student.averageScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.averageScore}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>{student.completedModules} modules</span>
                    {student.pendingAssignments > 0 && (
                      <span className="text-red-600">({student.pendingAssignments} pending)</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate(`/students/${student.id}`)}
                      className="text-blue-600 hover:text-blue-900 transform transition-all duration-200 hover:scale-105"
                    >
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-900 transform transition-all duration-200 hover:scale-105">Message</button>
                  </div>
                </td>
              </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStudents;
