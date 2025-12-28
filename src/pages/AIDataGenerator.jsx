import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Layers,
  FileText,
  Hash,
  BarChart2,
  Zap,
  Brain,
  RefreshCw,
  Save,
  Check,
  Square,
  CheckSquare
} from 'lucide-react';
import classesService from '../services/classesService';
import subjectsService from '../services/subjectsService';
import modulesService from '../services/modulesService';
import aiService from '../services/aiService';

const AIDataGenerator = () => {
  // Dropdown data states
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [chapters, setChapters] = useState([]);

  // Selected values
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [level, setLevel] = useState('1');

  // Loading states
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Result states
  const [generationResult, setGenerationResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Generated questions state
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [chapterId, setChapterId] = useState(null);

  // Number of questions options
  const questionCountOptions = [
    { value: '3', label: '3 Questions' },
    { value: '5', label: '5 Questions' },
    { value: '10', label: '10 Questions' },
    { value: '15', label: '15 Questions' },
    { value: '20', label: '20 Questions' },
  ];

  // Level options
  const levelOptions = [
    { value: '1', label: 'Level 1 - Basic' },
    { value: '2', label: 'Level 2 - Easy' },
    { value: '3', label: 'Level 3 - Medium' },
    { value: '4', label: 'Level 4 - Hard' },
    { value: '5', label: 'Level 5 - HOTS (Advanced)' },
  ];

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const response = await classesService.getClasses();
        const classesData = response.data || response;
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes. Please refresh and try again.');
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch subjects when class changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClass) {
        setSubjects([]);
        setSelectedSubject('');
        return;
      }

      setLoadingSubjects(true);
      try {
        const response = await subjectsService.getSubjects({ class: selectedClass });
        const subjectsData = response.data || response;
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        setSelectedSubject('');
        setModules([]);
        setSelectedModule('');
        setChapters([]);
        setSelectedChapter('');
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [selectedClass]);

  // Fetch modules when subject changes
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedSubject) {
        setModules([]);
        setSelectedModule('');
        return;
      }

      setLoadingModules(true);
      try {
        const response = await modulesService.getSubjectModules(selectedSubject);
        const modulesData = response.data || response;
        setModules(Array.isArray(modulesData) ? modulesData : []);
        setSelectedModule('');
        setChapters([]);
        setSelectedChapter('');
      } catch (err) {
        console.error('Error fetching modules:', err);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchModules();
  }, [selectedSubject]);

  // Fetch chapters when module changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedModule) {
        setChapters([]);
        setSelectedChapter('');
        return;
      }

      setLoadingChapters(true);
      try {
        const response = await modulesService.getModuleChapters(selectedModule);
        const chaptersData = response.data || response;
        setChapters(Array.isArray(chaptersData) ? chaptersData : []);
        setSelectedChapter('');
      } catch (err) {
        console.error('Error fetching chapters:', err);
      } finally {
        setLoadingChapters(false);
      }
    };
    fetchChapters();
  }, [selectedModule]);

  // Get selected names for display
  const getSelectedSubjectName = () => {
    const subject = subjects.find(s => s.id?.toString() === selectedSubject?.toString());
    return subject?.name || '';
  };

  const getSelectedModuleName = () => {
    const module = modules.find(m => m.id?.toString() === selectedModule?.toString());
    return module?.name || '';
  };

  const getSelectedChapterName = () => {
    const chapter = chapters.find(c => c.id?.toString() === selectedChapter?.toString());
    return chapter?.title || '';
  };

  // Handle generate button click
  const handleGenerate = async () => {
    // Validation
    if (!selectedSubject || !selectedModule || !selectedChapter) {
      setError('Please select subject, module, and chapter to generate questions.');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);
    setGenerationResult(null);

    try {
      const requestData = {
        class_id: selectedClass || null,
        subject_id: selectedSubject,
        module_id: selectedModule,
        chapter_id: selectedChapter,
        subject_name: getSelectedSubjectName(),
        module_name: getSelectedModuleName(),
        chapter_name: getSelectedChapterName(),
        number_of_questions: parseInt(numberOfQuestions),
        level: parseInt(level),
      };

      const response = await aiService.generateAIQuestions(requestData);
      
      // API returns data wrapped in 'data' property
      const responseData = response.data || response;
      
      setGenerationResult(responseData);
      
      // Store generated questions and chapter ID
      const questions = responseData.questions || [];
      setGeneratedQuestions(questions);
      setChapterId(responseData.chapter_id || selectedChapter);
      
      // Select all questions by default
      setSelectedQuestionIds(new Set(questions.map(q => q.id)));
      
      setSuccess(`Successfully generated ${responseData.questions_created || numberOfQuestions} questions!`);
    } catch (err) {
      console.error('Error generating AI questions:', err);
      setError(err.message || 'Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Toggle question selection
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Toggle all questions selection
  const toggleAllQuestions = () => {
    if (selectedQuestionIds.size === generatedQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(generatedQuestions.map(q => q.id)));
    }
  };

  // Handle save - deactivate unselected questions
  const handleSave = async () => {
    if (!chapterId) {
      setError('No chapter ID available. Please regenerate questions.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const questionIdsToKeep = Array.from(selectedQuestionIds);
      
      const response = await aiService.deactivateAIQuestions(questionIdsToKeep, chapterId);
      
      // API returns data wrapped in 'data' property
      const result = response.data || response;
      
      setSuccess(`Successfully saved! ${result.deactivated_count || 0} unselected questions marked as inactive.`);
      
      // Clear the questions list after successful save
      setGeneratedQuestions([]);
      setSelectedQuestionIds(new Set());
      setGenerationResult(null);
      setChapterId(null);
    } catch (err) {
      console.error('Error saving questions:', err);
      setError(err.message || 'Failed to save questions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedModule('');
    setSelectedChapter('');
    setNumberOfQuestions('5');
    setLevel('1');
    setError(null);
    setSuccess(null);
    setGenerationResult(null);
    setSubjects([]);
    setModules([]);
    setChapters([]);
    setGeneratedQuestions([]);
    setSelectedQuestionIds(new Set());
    setChapterId(null);
  };

  // Check if form is valid
  const isFormValid = selectedSubject && selectedModule && selectedChapter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Question Generator
              </h1>
              <p className="text-gray-600 mt-1">
                Generate intelligent questions using AI for your modules and chapters
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-8 py-6">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Configure Generation Parameters</h2>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Select the target module and chapter, then specify how many questions to generate
              </p>
            </div>

            {/* Form Content */}
            <div className="p-8 space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Success</p>
                    <p className="text-sm text-green-600 mt-1">{success}</p>
                  </div>
                </div>
              )}

              {/* Class Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>Class <span className="text-gray-400 font-normal">(Optional)</span></span>
                </label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    disabled={loadingClasses}
                    className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  >
                    <option value="">Select Class (Optional)</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name || cls.grade || `Class ${cls.id}`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {loadingClasses ? (
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <span>Subject <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={loadingSubjects}
                    className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {loadingSubjects ? (
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                      <Layers className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Module Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Module <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    disabled={!selectedSubject || loadingModules}
                    className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  >
                    <option value="">{!selectedSubject ? 'Select subject first' : 'Select Module'}</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {loadingModules ? (
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Chapter Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Hash className="h-4 w-4 text-blue-600" />
                  <span>Module Chapter <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    disabled={!selectedModule || loadingChapters}
                    className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  >
                    <option value="">{!selectedModule ? 'Select module first' : 'Select Chapter'}</option>
                    {chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {loadingChapters ? (
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                      <Hash className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Number of Questions & Level Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Number of Questions */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <BarChart2 className="h-4 w-4 text-blue-600" />
                    <span>Number of Questions</span>
                  </label>
                  <div className="relative">
                    <select
                      value={numberOfQuestions}
                      onChange={(e) => setNumberOfQuestions(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300"
                    >
                      {questionCountOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <BarChart2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Level */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span>Difficulty Level</span>
                  </label>
                  <div className="relative">
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300"
                    >
                      {levelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Zap className="h-5 w-5 text-gray-400" />
                    </div>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Level 5 Info */}
              {level === '5' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">HOTS Questions</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Level 5 will generate Higher Order Thinking Skills (HOTS) questions. 
                      These questions will also be added to the Chapter HOTS section.
                    </p>
                  </div>
                </div>
              )}

              {/* Summary Preview */}
              {isFormValid && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">Generation Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Subject:</span>
                      <span className="ml-2 text-gray-900 font-medium">{getSelectedSubjectName()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Module:</span>
                      <span className="ml-2 text-gray-900 font-medium">{getSelectedModuleName()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Chapter:</span>
                      <span className="ml-2 text-gray-900 font-medium">{getSelectedChapterName()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Questions:</span>
                      <span className="ml-2 text-gray-900 font-medium">{numberOfQuestions}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Level:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {levelOptions.find(l => l.value === level)?.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  disabled={generating}
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!isFormValid || generating}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 active:scale-95"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Generate Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generated Questions List */}
          {generatedQuestions.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Generated Questions</h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {selectedQuestionIds.size}/{generatedQuestions.length} selected
                    </span>
                  </div>
                  <button
                    onClick={toggleAllQuestions}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {selectedQuestionIds.size === generatedQuestions.length ? (
                      <>
                        <Square className="h-4 w-4" />
                        <span>Deselect All</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        <span>Select All</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Select the questions you want to keep. Unselected questions will be marked as inactive.
                </p>
              </div>

              {/* Questions List */}
              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {generatedQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`bg-gray-50 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedQuestionIds.has(question.id)
                        ? 'border-blue-500 shadow-md bg-blue-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleQuestionSelection(question.id)}
                  >
                    <div className="p-5">
                      {/* Question Header */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {selectedQuestionIds.has(question.id) ? (
                            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-md bg-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">
                              Q{index + 1}
                            </span>
                            <span className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium">
                              Level {question.level}
                            </span>
                            {question.is_hots && (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold">
                                HOTS
                              </span>
                            )}
                            <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                              {question.exp_points} XP
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium leading-relaxed">
                            {question.question_text}
                          </p>

                          {/* Options */}
                          {question.options && question.options.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {question.options.map((option, optIdx) => (
                                <div
                                  key={option.id || optIdx}
                                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                                    option.is_correct
                                      ? 'bg-green-50 border border-green-200'
                                      : 'bg-white border border-gray-200'
                                  }`}
                                >
                                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    option.is_correct
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className={`${
                                    option.is_correct ? 'text-green-700 font-medium' : 'text-gray-700'
                                  }`}>
                                    {option.option_text}
                                  </span>
                                  {option.is_correct && (
                                    <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Explanation */}
                          {question.explanation && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
                                Explanation
                              </p>
                              <p className="text-sm text-blue-800">
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {generatedQuestions.length - selectedQuestionIds.size} question(s) will be marked as inactive
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 active:scale-95"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>Save Selection</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDataGenerator;
