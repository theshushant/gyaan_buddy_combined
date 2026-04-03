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
  CheckSquare,
  HelpCircle
} from 'lucide-react';
import classesService from '../services/classesService';
import subjectsService from '../services/subjectsService';
import modulesService from '../services/modulesService';
import aiService from '../services/aiService';

const AIDataGenerator = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [level, setLevel] = useState('1');
  const [questionType, setQuestionType] = useState('mcq_single');
  const [addImage, setAddImage] = useState(false);
  const [useMatplot, setUseMatplot] = useState(false);

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [generationResult, setGenerationResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [chapterId, setChapterId] = useState(null);

  const questionCountOptions = [
    { value: '3', label: '3 Questions' },
    { value: '5', label: '5 Questions' },
    { value: '10', label: '10 Questions' },
    { value: '15', label: '15 Questions' },
    { value: '20', label: '20 Questions' },
  ];

  const levelOptions = [
    { value: '1', label: 'Level 1 - Basic' },
    { value: '2', label: 'Level 2 - Easy' },
    { value: '3', label: 'Level 3 - Medium' },
    { value: '4', label: 'Level 4 - Hard' },
    { value: '5', label: 'Level 5 - HOTS (Advanced)' },
  ];

  const questionTypeOptions = [
    { value: 'mcq_single', label: 'MCQ - Single Correct' },
    { value: 'mcq_multiple', label: 'MCQ - Multiple Correct' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'rearrange', label: 'Re-arrange' },
  ];

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

  const handleGenerate = async () => {
    if (!selectedSubject || !selectedModule || !selectedChapter) {
      setError('Please select subject, module, and topic to generate questions.');
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
        question_type: questionType,
        add_image: addImage,
        use_matplot: useMatplot,
      };

      const response = useMatplot
        ? await aiService.generateAIQuestionsGemini(requestData)
        : await aiService.generateAIQuestions(requestData);
      
      const responseData = response.data || response;
      
      setGenerationResult(responseData);
      
      const questions = responseData.questions || [];
      setGeneratedQuestions(questions);
      setChapterId(responseData.chapter_id || selectedChapter);
      
      setSelectedQuestionIds(new Set(questions.map(q => q.id)));
      
      setSuccess(`Successfully generated ${responseData.questions_created || numberOfQuestions} questions!`);
    } catch (err) {
      console.error('Error generating AI questions:', err);
      setError(err.message || 'Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

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

  const toggleAllQuestions = () => {
    if (selectedQuestionIds.size === generatedQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(generatedQuestions.map(q => q.id)));
    }
  };

  const handleSave = async () => {
    if (!chapterId) {
      setError('No topic ID available. Please regenerate questions.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const questionIdsToKeep = Array.from(selectedQuestionIds);
      
      const response = await aiService.deactivateAIQuestions(questionIdsToKeep, chapterId);
      
      const result = response.data || response;
      
      setSuccess(`Successfully saved! ${result.deactivated_count || 0} unselected questions marked as inactive.`);
      
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

  const handleReset = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedModule('');
    setSelectedChapter('');
    setNumberOfQuestions('5');
    setLevel('1');
    setQuestionType('mcq_single');
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

  const isFormValid = selectedSubject && selectedModule && selectedChapter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gradient-start/10 to-gradient-end/10">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div 
              className="p-3 rounded-2xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}
            >
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Question Generator
              </h1>
              <p className="text-gray-600 mt-1">
                Generate intelligent questions using AI for your modules and topics
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-8 py-6" style={{ background: 'linear-gradient(135deg, rgba(0,22,122,0.1) 0%, rgba(30,58,138,0.1) 100%)' }}>
              <div className="flex items-center space-x-3">
                <Sparkles className="h-6 w-6 text-primary-500" />
                <h2 className="text-xl font-bold text-gray-900">Configure Generation Parameters</h2>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Select the target module and topic, then specify how many questions to generate
              </p>
            </div>

            <div className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Success</p>
                    <p className="text-sm text-green-600 mt-1">{success}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <BookOpen className="h-4 w-4 text-primary-500" />
                  <span>Class <span className="text-gray-400 font-normal">(Optional)</span></span>
                </label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    disabled={loadingClasses}
                    className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
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

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Layers className="h-4 w-4 text-primary-500" />
                  <span>Subject <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={loadingSubjects}
                    className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
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

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <FileText className="h-4 w-4 text-primary-500" />
                  <span>Module <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    disabled={!selectedSubject || loadingModules}
                    className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
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

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Hash className="h-4 w-4 text-primary-500" />
                  <span>Module Topic <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    disabled={!selectedModule || loadingChapters}
                    className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  >
                    <option value="">{!selectedModule ? 'Select module first' : 'Select Topic'}</option>
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

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <HelpCircle className="h-4 w-4 text-primary-500" />
                  <span>Question Type</span>
                </label>
                <div className="relative">
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300"
                  >
                    {questionTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <HelpCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <BarChart2 className="h-4 w-4 text-primary-500" />
                    <span>Number of Questions</span>
                  </label>
                  <div className="relative">
                    <select
                      value={numberOfQuestions}
                      onChange={(e) => setNumberOfQuestions(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300"
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

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Zap className="h-4 w-4 text-primary-500" />
                    <span>Difficulty Level</span>
                  </label>
                  <div className="relative">
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300"
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

              {level === '5' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">HOTS Questions</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Level 5 will generate Higher Order Thinking Skills (HOTS) questions. 
                      These questions will also be added to the Topic HOTS section.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="add_image_ai"
                    checked={addImage}
                    onChange={(e) => setAddImage(e.target.checked)}
                    className="h-5 w-5 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="add_image_ai" className="text-sm font-medium text-gray-700">
                    Generate images for questions
                  </label>
                </div>
                <div className="flex items-center space-x-3 pl-1">
                  <input
                    type="checkbox"
                    id="use_matplot_ai"
                    checked={useMatplot}
                    onChange={(e) => setUseMatplot(e.target.checked)}
                    disabled={!addImage}
                    className="h-5 w-5 text-primary-500 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="use_matplot_ai" className="text-sm font-medium text-gray-700">
                    Use matplotlib (Vertex Gemini) – uses Gemini when enabled
                  </label>
                </div>
              </div>

              {isFormValid && (
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-primary-500 uppercase tracking-wider">Generation Summary</h3>
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
                      <span className="text-gray-500">Topic:</span>
                      <span className="ml-2 text-gray-900 font-medium">{getSelectedChapterName()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Questions:</span>
                      <span className="ml-2 text-gray-900 font-medium">{numberOfQuestions}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {questionTypeOptions.find(t => t.value === questionType)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Level:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {levelOptions.find(l => l.value === level)?.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
                  className="flex items-center space-x-2 px-8 py-3 text-white font-bold rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}
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

          {generatedQuestions.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-8 py-6" style={{ background: 'linear-gradient(135deg, rgba(0,22,122,0.1) 0%, rgba(30,58,138,0.1) 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-primary-500" />
                    <h2 className="text-xl font-bold text-gray-900">Generated Questions</h2>
                    <span className="px-3 py-1 bg-primary-500/20 text-primary-500 rounded-full text-sm font-medium">
                      {selectedQuestionIds.size}/{generatedQuestions.length} selected
                    </span>
                  </div>
                  <button
                    onClick={toggleAllQuestions}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-500 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
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

              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {generatedQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`bg-gray-50 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedQuestionIds.has(question.id)
                        ? 'border-primary-500 shadow-md bg-primary-500/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleQuestionSelection(question.id)}
                  >
                    <div className="p-5">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {selectedQuestionIds.has(question.id) ? (
                            <div className="w-6 h-6 bg-primary-500 rounded-md flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-md bg-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="px-2.5 py-1 bg-primary-500/20 text-primary-500 rounded-md text-xs font-bold">
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

                          {question.explanation && (
                            <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                              <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-1">
                                Explanation
                              </p>
                              <p className="text-sm text-primary-500">
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
