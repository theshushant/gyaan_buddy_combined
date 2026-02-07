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
        setLoading(false);
        return;
      }
      
      const response = await testsService.getTestStudentsPerformance(testId);
      if (!response || typeof response !== 'object') {
        setError('Failed to fetch performance data: Invalid response format');
        return;
      }

      // Normalize: API can return { success, message, data } or the payload at top level
      const data = response.data !== undefined ? response.data : response;
      if (!data || typeof data !== 'object') {
        setError('Failed to fetch performance data: Invalid response format');
        return;
      }

      // Accept both 'students' and 'Students' (backend may serialize differently)
      const studentsList = Array.isArray(data.students) ? data.students : (Array.isArray(data.Students) ? data.Students : []);
      const questionsList = Array.isArray(data.questions) ? data.questions : (Array.isArray(data.Questions) ? data.Questions : []);

      if (process.env.NODE_ENV === 'development') {
        console.log('StudentTestPerformance: API data', { test_name: data.test_name, studentsCount: studentsList.length, questionsCount: questionsList.length, dataKeys: Object.keys(data) });
      }

      setMissionData({
        mission_title: data.test_name ?? data.mission_title ?? 'Test',
        class_name: data.class_name ?? '',
        subject_name: data.subject_name ?? '',
        total_questions: data.total_questions ?? 0,
        average_percentage: data.average_percentage ?? 0,
      });
      setStudents(studentsList);
      setQuestions(questionsList);
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

  if (missionData && students.length === 0 && questions.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <Link to="/tests" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-6 transition-colors">
          <span>←</span>
          <span>Back to Tests</span>
        </Link>
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 text-2xl">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No students yet</h3>
          <p className="text-gray-600">This test class has no enrolled students or no attempt data yet.</p>
        </div>
      </div>
    );
  }

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

        {/* Table 1: Question-wise — Serial no, Question title, Sub-topic, % correct */}
        {questions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10 transition-shadow hover:shadow-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Question-wise analysis</h2>
              <p className="text-sm text-gray-500 mt-0.5">Per-question correct rate by sub-topic.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial no</th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question title</th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-topic</th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% correct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {questions.map((q, index) => {
                    const pct = q.correct_percentage ?? 0;
                    const pctColor = pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600';
                    return (
                      <tr key={q.question_id || index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-500 tabular-nums">{q.order ?? index + 1}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-800 max-w-md">{q.question_title || q.module_chapter_name || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{q.sub_topic ?? q.module_chapter_name ?? '—'}</td>
                        <td className={`px-5 py-3.5 text-sm font-semibold tabular-nums ${pctColor}`}>
                          {q.correct_percentage != null ? `${q.correct_percentage}%` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Table 2: Students — Serial no, Student name, % correct, View result (dropdown) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Student results</h2>
            <p className="text-sm text-gray-500 mt-0.5">Per-student score and attempt summary. Click View result for details.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial no</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% correct</th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student, index) => {
                  const isExpanded = expandedStudentId === student.user_id;
                  const attempted = student.questions_attempted ?? (student.correct_answer_count ?? 0) + (student.wrong_answer_count ?? 0);
                  const correct = student.correct_answer_count ?? 0;
                  const wrong = student.wrong_answer_count ?? 0;
                  return (
                    <React.Fragment key={student.user_id}>
                      <tr className={`hover:bg-gray-50/50 transition-colors ${isExpanded ? 'bg-gray-50/80' : ''}`}>
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-500 tabular-nums">{index + 1}</td>
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{student.user_name}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-sm font-semibold tabular-nums ${getPercentageColor(student.percentage)}`}>
                            {student.percentage != null ? `${student.percentage}%` : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => toggleStudentExpand(student.user_id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors"
                          >
                            View result
                            <svg
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="px-5 py-0 bg-gray-50/50">
                            <div className="py-4 px-5 border-t border-gray-100 animate-fade-in">
                              <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Questions attempted:</span>
                                  <span className="font-semibold text-gray-800">{attempted}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Correct:</span>
                                  <span className="font-semibold text-green-600">{correct}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Wrong:</span>
                                  <span className="font-semibold text-red-600">{wrong}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTestPerformance;
