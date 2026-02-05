import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import testsService from '../services/testsService';

const StudentTestPerformance = () => {
  const { missionId: testId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [missionData, setMissionData] = useState(null);
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
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
        setQuestions(data.questions || []);
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
        setQuestions(data.questions || []);
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
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-accent-400/40 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          </div>
          <p className="text-gray-500 font-medium">Loading results...</p>
          <p className="text-sm text-gray-400">Fetching test performance data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <Link to="/tests" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-6 transition-colors">
          <span>←</span>
          <span>Back to Tests</span>
        </Link>
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Couldn't load results</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchStudentsPerformance}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Try again
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
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <Link to="/tests" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-6 transition-colors">
          <span>←</span>
          <span>Back to Tests</span>
        </Link>
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 text-2xl">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No students yet</h3>
          <p className="text-gray-600">This test class has no enrolled students.</p>
        </div>
      </div>
    );
  }

  const selectedStudent = students.find(s => s.user_id === expandedStudentId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/tests"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-6 transition-all duration-200 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Back to Tests</span>
          </Link>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {missionData?.mission_title || 'Test'} — Results
            </h1>
            <p className="mt-2 text-gray-500 flex flex-wrap gap-x-2 gap-y-1">
              <span>{missionData?.class_name}</span>
              <span className="text-gray-300">•</span>
              <span>{missionData?.subject_name}</span>
              <span className="text-gray-300">•</span>
              <span>{missionData?.total_questions} questions</span>
            </p>
          </div>
        </div>

        {/* Question-wise Analysis */}
        {questions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10 transition-shadow hover:shadow-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Question-wise analysis</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Per-question correct rate, module/topic, level, and difficulty.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module / Topic</th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct %</th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct / Attempted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {questions.map((q, index) => {
                    const pct = q.correct_percentage ?? 0;
                    const pctColor = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400';
                    return (
                      <tr key={q.question_id || index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-500 tabular-nums">{q.order ?? index + 1}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-800 max-w-xs">{q.question_title || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{q.module_chapter_name || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{q.level != null ? `Level ${q.level}` : '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 capitalize">{q.difficulty || '—'}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pctColor} transition-all duration-500`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-semibold tabular-nums w-10 ${
                              pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {q.correct_percentage != null ? `${q.correct_percentage}%` : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 tabular-nums">
                          {q.students_attempted != null && q.students_correct != null
                            ? `${q.students_correct} / ${q.students_attempted}`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Students Table with Expandable Details - hidden for now */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ display: 'none' }}>
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
    </div>
  );
};

export default StudentTestPerformance;
