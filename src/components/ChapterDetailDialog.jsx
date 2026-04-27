import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import reportsService from '../services/reportsService';

const PERIOD_MAP = {
  'Last 7 days': 7,
  'Last 30 days': 30,
  'Last 3 months': 90,
  'Last 6 months': 180,
  'This year': 365,
};

const getPercentageColor = (pct) => {
  if (pct >= 80) return 'text-green-600';
  if (pct >= 60) return 'text-primary-500';
  if (pct >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

const ChapterDetailDialog = ({ chapter, classFilter, selectedPeriod, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    if (!chapter?.id) return;
    setLoading(true);
    setError(null);
    setExpandedStudentId(null);
    reportsService.getChapterStudentDetails({
      chapter_id: chapter.id,
      period: PERIOD_MAP[selectedPeriod] ?? 30,
      class: classFilter || '',
    }).then(d => {
      setData(d);
      setLoading(false);
    }).catch(err => {
      setError(err.message || 'Failed to load chapter details');
      setLoading(false);
    });
  }, [chapter?.id, classFilter, selectedPeriod]);

  const students = data?.students ?? [];
  const questions = data?.questions ?? [];
  const attemptedCount = students.filter(s => s.questions_attempted > 0).length;

  const weakQuestions = questions
    .filter(q => (q.correct_percentage ?? 0) < 50)
    .sort((a, b) => a.correct_percentage - b.correct_percentage);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-primary-50 to-blue-50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{chapter?.name} — Results</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {classFilter ? `Class: ${classFilter} • ` : ''}
              {data ? `${data.total_questions} questions` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-800 flex-shrink-0 mt-0.5"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin mb-3" />
              <p className="text-gray-500 text-sm">Loading results…</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Attempted / Total students</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">
                    {attemptedCount} <span className="text-gray-400 font-normal">/</span> {students.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg correct %</p>
                  <p className={`mt-1 text-2xl font-bold tabular-nums ${getPercentageColor(data.average_percentage)}`}>
                    {data.average_percentage != null ? `${data.average_percentage}%` : '—'}
                  </p>
                </div>
              </div>

              {/* Weak questions */}
              {weakQuestions.length > 0 && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl shadow-sm p-5 mb-8">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-2">
                    <span className="text-amber-600" aria-hidden="true">⚠</span>
                    Weak questions
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Questions where average correct % is below 50%. Consider revising these.</p>
                  <div className="flex flex-wrap gap-2">
                    {weakQuestions.map((q, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white text-amber-800 border border-amber-200 rounded-lg shadow-sm"
                      >
                        {q.question_title.length > 60 ? q.question_title.slice(0, 60) + '…' : q.question_title}
                        <span className="text-amber-600 tabular-nums">({q.correct_percentage}%)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Question-wise analysis */}
              {questions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-shadow hover:shadow-md">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-800">Question-wise analysis</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Per-question correct rate across all students.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px]">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial no</th>
                          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Correct</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {questions.map((q, idx) => {
                          const pct = q.correct_percentage ?? 0;
                          const pctColor = pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600';
                          return (
                            <tr key={q.question_id || idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-3.5 text-sm font-medium text-gray-500 tabular-nums">{q.order ?? idx + 1}</td>
                              <td className="px-5 py-3.5 text-sm text-gray-800 max-w-md">{q.question_title || '—'}</td>
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

              {/* Student results */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800">Student results</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Per-student score and attempt summary. Click View result for question details.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial no</th>
                        <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student name</th>
                        <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Correct</th>
                        <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {students.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">No students found.</td>
                        </tr>
                      )}
                      {students.map((student, idx) => {
                        const isExpanded = expandedStudentId === student.user_id;
                        const hasAttempted = student.questions_attempted > 0;
                        return (
                          <React.Fragment key={student.user_id}>
                            <tr className={`hover:bg-gray-50/50 transition-colors ${isExpanded ? 'bg-gray-50/80' : ''}`}>
                              <td className="px-5 py-3.5 text-sm font-medium text-gray-500 tabular-nums">{idx + 1}</td>
                              <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{student.user_name}</td>
                              <td className="px-5 py-3.5">
                                <span className={`text-sm font-semibold tabular-nums ${getPercentageColor(student.percentage)}`}>
                                  {student.percentage != null ? `${student.percentage}%` : '—'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  hasAttempted
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}>
                                  {hasAttempted ? 'Attempted' : 'Not attempted'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setExpandedStudentId(isExpanded ? null : student.user_id)}
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
                                <td colSpan={5} className="px-5 py-0 bg-gray-50/50">
                                  <div className="py-4 px-5 border-t border-gray-100 animate-fade-in space-y-4">
                                    <div className="flex flex-wrap gap-6 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Questions attempted:</span>
                                        <span className="font-semibold text-gray-800">{student.questions_attempted}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Correct:</span>
                                        <span className="font-semibold text-green-600">{student.correct_answer_count}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Wrong:</span>
                                        <span className="font-semibold text-red-600">{student.wrong_answer_count}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-800 mb-3">All questions in this topic</p>
                                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="w-full min-w-[400px] text-sm">
                                          <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                                              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                              <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Result</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100 bg-white">
                                            {student.answers.map((ans, i) => (
                                              <tr key={i} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-2.5 text-gray-500 font-medium tabular-nums">{i + 1}</td>
                                                <td className="px-4 py-2.5 text-gray-800">{ans.question_title || '—'}</td>
                                                <td className="px-4 py-2.5 text-right">
                                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    ans.is_correct === true
                                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                      : ans.is_correct === false
                                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                                                  }`}>
                                                    {ans.is_correct === true ? 'Correct' : ans.is_correct === false ? 'Wrong' : 'Not attempted'}
                                                  </span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
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
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChapterDetailDialog;
