import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchStudents,
  fetchStudentStats,
  setFilters,
  clearError
} from '../features/students/studentsSlice';
import { fetchClasses } from '../features/classes/classesSlice';
import { fetchSubjects } from '../features/subjects/subjectsSlice';

const MyStudents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const initialLoadRef = useRef(false);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    students,
    studentStats,
    summary,
    loading,
    error
  } = useSelector(state => state.students);

  const { classes } = useSelector(state => state.classes);
  const { subjects } = useSelector(state => state.subjects);

  useEffect(() => {
    if (initialLoadRef.current) {
      return;
    }

    initialLoadRef.current = true;

    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchStudents({ limit: 1000 })),
          dispatch(fetchStudentStats()),
          dispatch(fetchClasses({})),
          dispatch(fetchSubjects({}))
        ]);
      } catch (err) {
        console.error('Error fetching students data:', err);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    dispatch(setFilters({
      search: searchTerm.trim(),
      class: selectedClass !== 'All Classes' ? selectedClass : '',
      subject: selectedSubject !== 'All Subjects' ? selectedSubject : '',
    }));
  }, [dispatch, searchTerm, selectedClass, selectedSubject]);

  const transformStudent = (student) => {
    const firstName = student.first_name || student.firstName || '';
    const lastName = student.last_name || student.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || student.name || 'Unknown';
    const email = student.email || '';
    const classData = student.class || student.class_name || student.class_id || 'N/A';
    const classId = String(
      student.class_id ||
      student.class?.id ||
      student.class_instance?.id ||
      student.class_instance ||
      ''
    );
    const classLabel = (
      student.class_name ||
      student.class?.name ||
      student.class?.class_name ||
      student.class_instance?.name ||
      student.class_instance_name ||
      (typeof classData === 'string' || typeof classData === 'number' ? String(classData) : 'N/A')
    );

    const rawSubjects = Array.isArray(student.subjects)
      ? student.subjects
      : Array.isArray(student.subject_list)
        ? student.subject_list
        : (student.subject ? [student.subject] : []);
    const subjectNames = rawSubjects
      .map((subject) => {
        if (typeof subject === 'string') return subject;
        return subject?.name || subject?.subject_name || '';
      })
      .filter(Boolean);
    const subjectIds = rawSubjects
      .map((subject) => {
        if (typeof subject === 'string') return '';
        return String(subject?.id || subject?.subject_id || '');
      })
      .filter(Boolean);

    return {
      id: student.id,
      name: fullName,
      firstName,
      lastName,
      class: classLabel,
      classId,
      email,
      phone: student.phone_number || student.phone || '',
      lastActive: student.last_active || student.lastActive || 'N/A',
      totalXP: student.total_exp || student.xp || 0,
      averageScore: student.average_score || student.averageScore || 0,
      completedModules: student.completed_modules || student.completedModules || 0,
      pendingAssignments: student.pending_assignments || student.pendingAssignments || 0,
      progressModule: student.progress_module_count || student.progressModule || 0,
      subjectNames,
      subjectIds,
    };
  };

  const hasActiveFilters = searchTerm || selectedClass !== 'All Classes' || selectedSubject !== 'All Subjects';

  const selectedSubjectName = Array.isArray(subjects)
    ? (subjects.find((subject) => String(subject.id) === String(selectedSubject))?.name
      || subjects.find((subject) => String(subject.id) === String(selectedSubject))?.subject_name
      || '')
    : '';
  const selectedClassName = Array.isArray(classes)
    ? (classes.find((classItem) => String(classItem.id || classItem.uuid || '') === String(selectedClass))?.name
      || classes.find((classItem) => String(classItem.id || classItem.uuid || '') === String(selectedClass))?.class_name
      || '')
    : '';
  const normalizedSelectedSubjectName = selectedSubjectName.trim().toLowerCase();

  const filteredStudents = (students || []).map(transformStudent).sort((a, b) =>
    a.firstName.localeCompare(b.firstName)
  ).filter(student => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const nameParts = [student.firstName, student.lastName, student.name]
      .filter(Boolean)
      .flatMap((value) => value.toLowerCase().split(/\s+/).filter(Boolean));
    const matchesSearch = !normalizedSearch ||
      nameParts.some((value) => value.startsWith(normalizedSearch)) ||
      (student.email && student.email.toLowerCase().startsWith(normalizedSearch));
    const matchesClass = selectedClass === 'All Classes' || 
      student.classId === String(selectedClass) ||
      (selectedClassName && String(student.class || '') === String(selectedClassName)) ||
      String(student.class || '') === String(selectedClass);
    const matchesSubject = selectedSubject === 'All Subjects' ||
      student.subjectIds.includes(String(selectedSubject)) ||
      student.subjectNames.some((subjectName) => subjectName.toLowerCase() === normalizedSelectedSubjectName);
    return matchesSearch && matchesClass && matchesSubject;
  });

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">My Students</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{animationDelay: '0.1s'}}>Manage and track your students' progress and performance.</p>
      </div>

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

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 animate-slide-right" style={{animationDelay: '0.2s'}}>
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transform transition-all duration-200 hover:scale-105"
          />
        </div>
        
        <div className="animate-slide-right" style={{animationDelay: '0.3s'}}>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={loading.students}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option>All Classes</option>
            {Array.isArray(classes) && classes.map((classItem) => {
              const className = classItem.name || classItem.class_name || `${classItem.grade || ''}${classItem.section || ''}`.trim() || `Class ${classItem.id}`;
              const classValue = String(classItem.id || classItem.uuid || className);
              return (
                <option key={classItem.id || classItem.name} value={classValue}>
                  {className}
                </option>
              );
            })}
          </select>
        </div>

        <div className="animate-slide-right" style={{animationDelay: '0.35s'}}>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={loading.students}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option>All Subjects</option>
            {Array.isArray(subjects) && subjects.map((subject) => {
              const subjectName = subject.name || subject.subject_name || `Subject ${subject.id}`;
              const subjectValue = subject.id?.toString() || subject.name || '';
              return (
                <option key={subject.id || subject.name} value={subjectValue}>
                  {subjectName}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-500 mb-2 animate-count-up">
              {loading.stats ? '...' : (hasActiveFilters ? filteredStudents.length : (studentStats?.totalStudents || studentStats?.total_students || filteredStudents.length || 0))}
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.5s', display: 'none'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2 animate-count-up">
              {loading.stats ? '...' : (studentStats?.activeStudents || studentStats?.active_students || studentStats?.active_today || studentStats?.activeToday || 0)}
            </div>
            <div className="text-sm text-gray-600">Active Students</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2 animate-count-up">
              {loading.stats ? '...' : (hasActiveFilters ? filteredStudents.reduce((sum, s) => sum + (s.pendingAssignments || 0), 0) : (studentStats?.pendingAssignment || studentStats?.pending_assignments || studentStats?.pendingAssignments || filteredStudents.reduce((sum, s) => sum + (s.pendingAssignments || 0), 0) || 0))}
            </div>
            <div className="text-sm text-gray-600">Pending Assignments</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.7s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2 animate-count-up">
              {loading.stats ? '...' : (
                hasActiveFilters
                  ? (filteredStudents.length > 0
                      ? Math.round(filteredStudents.reduce((sum, s) => sum + (s.averageScore || 0), 0) / filteredStudents.length)
                      : 0)
                  : (studentStats?.averageScore !== undefined
                      ? Math.round(studentStats.averageScore)
                      : (studentStats?.average_score !== undefined
                          ? Math.round(studentStats.average_score)
                          : (filteredStudents.length > 0
                              ? Math.round(filteredStudents.reduce((sum, s) => sum + (s.averageScore || 0), 0) / filteredStudents.length)
                              : 0)))
              )}
            </div>
            <div className="text-sm text-gray-600">Average XP</div>
          </div>
        </div>
      </div>

      {loading.students ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
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
                  XP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{display: 'none'}}>
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
                      <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center transform transition-all duration-200 hover:scale-110">
                        <span className="text-sm font-medium text-primary-500">
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
                  <span className="animate-count-up">{student.totalXP}</span> XP
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{display: 'none'}}>
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
                    <span>{student.progressModule} chapters</span>
                    {student.pendingAssignments > 0 && (
                      <span className="text-red-600">({student.pendingAssignments} pending)</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="text-primary-500 hover:text-primary-700 transform transition-all duration-200 hover:scale-105"
                  >
                    View
                  </button>
                </td>
              </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
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
