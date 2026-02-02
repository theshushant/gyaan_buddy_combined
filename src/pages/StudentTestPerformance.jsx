import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import testsService from '../services/testsService';

const StudentTestPerformance = () => {
  const { missionId: testId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [missionData, setMissionData] = useState(null);
  const [students, setStudents] = useState([]);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    fetchStudentsPerformance();
  }, [testId]);

  const fetchStudentsPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!testId) {
        setError('No test ID provided');
        return;
      }
      
      const response = await testsService.getTestStudentsPerformance(testId);
      
      if (response.success && response.data) {
        const data = response.data;
        setMissionData({
          mission_title: data.test_name,
          class_name: data.class_name,
          subject_name: data.subject_name,
          total_questions: data.total_questions,
          average_percentage: data.average_percentage,
        });
        setStudents(data.students || []);
      } else if (response.data) {
        const data = response.data;
        setMissionData({
          mission_title: data.test_name,
          class_name: data.class_name,
          subject_name: data.subject_name,
          total_questions: data.total_questions,
          average_percentage: data.average_percentage,
        });
        setStudents(data.students || []);
      } else {
        setError('Failed to fetch performance data: Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching test students performance:', err);
      let errorMessage = 'Failed to fetch performance data';
      if (err.message.includes('Cannot connect to server')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (err.message.includes('404') || err.message.includes('not found')) {
        errorMessage = 'Test not found. Please check if the test exists.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentExpand = (studentId) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  const getStatusColor = (isCorrect) => {
    return isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getPassStatusBadge = (passed) => {
    return passed 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-primary-500';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-gray-600">Loading performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 animate-fade-in">
        <Link to="/tests" className="text-primary-500 hover:text-primary-600 flex items-center space-x-2 mb-4">
          <span>←</span>
          <span>Back to Tests</span>
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <p className="text-red-500 text-sm mb-4">Test ID: {testId || 'Not provided'}</p>
          <button
            onClick={fetchStudentsPerformance}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!missionData && !loading && !error) {
    return null;
  }

  if (missionData && students.length === 0) {
    return (
      <div className="p-6 animate-fade-in">
        <Link to="/tests" className="text-primary-500 hover:text-primary-600 flex items-center space-x-2 mb-4">
          <span>←</span>
          <span>Back to Tests</span>
        </Link>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 text-xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Students in Class</h3>
          <p className="text-yellow-700">This test class has no enrolled students yet.</p>
        </div>
      </div>
    );
  }

  const selectedStudent = students.find(s => s.user_id === expandedStudentId);

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center animate-slide-down">
        <div>
          <Link to="/tests" className="text-primary-500 hover:text-primary-600 flex items-center space-x-2 mb-4 transform transition-all duration-200 hover:scale-105 hover:-translate-x-1">
            <span className="transform transition-transform duration-200 hover:-translate-x-1">←</span>
            <span>Back to Tests</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{missionData?.mission_title || 'Test'} - Results</h1>
          <p className="text-gray-600 mt-2">
            {missionData?.class_name} • {missionData?.subject_name} • {missionData?.total_questions} Questions
          </p>
        </div>
        {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Report</span>
        </button> */}
      </div>

      {/* Class Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{students.length}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{students.filter(s => s.pass).length}</div>
          <div className="text-sm text-green-700">Passed</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{students.filter(s => !s.pass).length}</div>
          <div className="text-sm text-red-700">Failed</div>
        </div>
        <div className="bg-primary-500/10 rounded-lg border border-primary-500/30 p-4 text-center">
          <div className="text-2xl font-bold text-primary-500">
            {((students.filter(s => s.pass).length / students.length) * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-primary-500">Pass Rate</div>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {missionData?.average_percentage != null
              ? `${missionData.average_percentage}%`
              : students.length
                ? `${Math.round(students.reduce((sum, s) => sum + s.percentage, 0) / students.length)}%`
                : '0%'}
          </div>
          <div className="text-sm text-purple-700">Avg. Score</div>
        </div>
      </div>

      {/* Students Table with Expandable Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Test Class Students</h2>
          <p className="text-sm text-gray-500">Average %, correct answers, wrong answers, total questions. Click a row to expand details.</p>
        </div>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Student</div>
          <div className="col-span-1">Roll #</div>
          <div className="col-span-1">Avg %</div>
          <div className="col-span-1">Correct</div>
          <div className="col-span-1">Wrong</div>
          <div className="col-span-1">Total</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1" />
        </div>

        <div className="divide-y divide-gray-200">
          {students.map((student, index) => (
            <div key={student.user_id} className="transition-all duration-300">
              {/* Student Row - Always Visible */}
              <div 
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors items-center ${
                  expandedStudentId === student.user_id ? 'bg-primary-500/10' : ''
                }`}
                onClick={() => toggleStudentExpand(student.user_id)}
              >
                <div className="md:col-span-1 flex items-center space-x-2 md:space-x-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
                    {index + 1}
                  </div>
                  <div className="md:hidden font-medium text-gray-800">Student</div>
                </div>
                <div className="md:col-span-3">
                  <h3 className="font-medium text-gray-800">{student.user_name}</h3>
                  <p className="text-sm text-gray-500 md:hidden">{student.class_name || missionData?.class_name}</p>
                </div>
                <div className="md:col-span-1 text-sm text-gray-600">
                  <span className="md:hidden text-gray-500">Roll #: </span>
                  {student.roll_number ?? '—'}
                </div>
                <div className="md:col-span-1">
                  <span className={`font-bold ${getPercentageColor(student.percentage)}`}>
                    {student.percentage}%
                  </span>
                </div>
                <div className="md:col-span-1 text-sm text-green-700 font-medium">
                  <span className="md:hidden text-gray-500">Correct: </span>
                  {student.correct_answer_count ?? 0}
                </div>
                <div className="md:col-span-1 text-sm text-red-700 font-medium">
                  <span className="md:hidden text-gray-500">Wrong: </span>
                  {student.wrong_answer_count ?? 0}
                </div>
                <div className="md:col-span-1 text-sm text-gray-700">
                  <span className="md:hidden text-gray-500">Total: </span>
                  {student.total_questions ?? missionData?.total_questions ?? 0}
                </div>
                <div className="md:col-span-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPassStatusBadge(student.pass)}`}>
                    {student.pass ? '✓ Passed' : '✗ Failed'}
                  </span>
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      expandedStudentId === student.user_id ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Details - Shows when clicked */}
              {expandedStudentId === student.user_id && (
                <div className="px-6 py-6 bg-gray-50 border-t border-gray-200 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Summary */}
                    <div className="lg:col-span-2">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-lg border border-green-200 p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{student.correct_answer_count}</div>
                          <div className="text-sm text-green-700">Correct</div>
                        </div>
                        <div className="bg-white rounded-lg border border-red-200 p-4 text-center">
                          <div className="text-2xl font-bold text-red-600">{student.wrong_answer_count}</div>
                          <div className="text-sm text-red-700">Incorrect</div>
                        </div>
                        <div className="bg-white rounded-lg border border-primary-500/30 p-4 text-center">
                          <div className="text-2xl font-bold text-primary-500">{student.percentage}%</div>
                          <div className="text-sm text-primary-500">Score</div>
                        </div>
                      </div>

                      {/* Question Analysis Table */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                          <h4 className="font-medium text-gray-800">Question-by-Question Analysis</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student Answer</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Correct Answer</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {student.answers?.map((answer, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                                  <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">{answer.question}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(answer.is_correct)}`}>
                                      {answer.is_correct ? '✓ Correct' : '✗ Wrong'}
                                    </span>
                                  </td>
                                  <td className={`px-4 py-3 text-sm ${answer.is_correct ? 'text-gray-800' : 'text-red-600'}`}>
                                    {answer.answer || 'Not answered'}
                                  </td>
                                  <td className={`px-4 py-3 text-sm ${answer.is_correct ? 'text-gray-800' : 'text-green-600 font-medium'}`}>
                                    {answer.correct_answer}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {(!student.answers || student.answers.length === 0) && (
                          <div className="text-center py-6 text-gray-500">
                            No answer data available.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Insights Sidebar */}
                    <div className="space-y-4">
                      {/* Status Card */}
                      <div className={`rounded-lg border p-4 ${student.pass ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-xl ${student.pass ? 'text-green-600' : 'text-red-600'}`}>
                            {student.pass ? '🎉' : '📚'}
                          </span>
                          <h4 className={`font-semibold ${student.pass ? 'text-green-800' : 'text-red-800'}`}>
                            {student.pass ? 'Test Passed!' : 'Needs Improvement'}
                          </h4>
                        </div>
                        <p className={`text-sm ${student.pass ? 'text-green-700' : 'text-red-700'}`}>
                          {student.pass 
                            ? `Scored ${student.percentage}% (above 40% threshold)`
                            : `Scored ${student.percentage}% (below 40% threshold)`
                          }
                        </p>
                      </div>

                      {/* AI Insights */}
                      <div className="bg-primary-500/10 rounded-lg border border-primary-500/30 p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-primary-500">✨</span>
                          <h4 className="font-semibold text-gray-800">AI Insights</h4>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            {student.user_name} answered {student.correct_answer_count} out of {missionData?.total_questions} questions correctly.
                          </p>
                          
                          {student.wrong_answer_count > 0 && (
                            <div className="bg-white rounded p-3 border border-red-100">
                              <p className="text-xs font-medium text-red-800 mb-1">Areas to Focus:</p>
                              <p className="text-xs text-red-700">
                                {student.wrong_answer_count} question(s) need review. Check the incorrect answers above.
                              </p>
                            </div>
                          )}
                          
                          <div className="bg-white rounded p-3 border border-green-100">
                            <p className="text-xs font-medium text-green-800 mb-1">Recommendation:</p>
                            <p className="text-xs text-green-700">
                              {student.pass 
                                ? 'Continue with advanced modules to strengthen understanding.'
                                : 'Assign additional practice on weak topics.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentTestPerformance;
