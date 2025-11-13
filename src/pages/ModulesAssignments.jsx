import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Eye, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Filter,
  Search,
  TrendingUp,
  Calendar,
  Settings,
  Trash2,
  Edit,
  Play,
  BarChart3,
  Sparkles,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import modulesService from '../services/modulesService';
import subjectsService from '../services/subjectsService';
import questionsService from '../services/questionsService';
import CreateModuleModal from '../components/CreateModuleModal';
import CreateChapterModal from '../components/CreateChapterModal';
import SuccessModal from '../components/SuccessModal';

const ModulesAssignments = () => {
  const [expandedChapters, setExpandedChapters] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [allModulesData, setAllModulesData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateChapterModal, setShowCreateChapterModal] = useState(false);
  const [selectedModuleForChapter, setSelectedModuleForChapter] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({});
  const [creatingModule, setCreatingModule] = useState(false);
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createChapterError, setCreateChapterError] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [showViewQuestionsModal, setShowViewQuestionsModal] = useState(false);
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);
  const [selectedChapterForQuestion, setSelectedChapterForQuestion] = useState(null);
  const [chapterQuestions, setChapterQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [creatingQuestion, setCreatingQuestion] = useState(false);
  const [createQuestionError, setCreateQuestionError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  // Fetch all modules once and store locally
  const fetchAllModulesData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const modulesResponse = await modulesService.getModules();
      const modulesData = modulesResponse.data || modulesResponse;
      const modulesList = Array.isArray(modulesData) ? modulesData : [];

      const modulesWithChapters = await Promise.all(
        modulesList.map(async (module) => {
          try {
            const chaptersResponse = await modulesService.getModuleChapters(module.id);
            const chaptersData = chaptersResponse.data || chaptersResponse;
            const chaptersList = Array.isArray(chaptersData) ? chaptersData : [];

            return {
              id: module.id,
              subjectId: module.subject || module.subject_id || module.subject?.id,
              title: module.name || `Module ${module.order}`,
              completionRate: module.user_percentage || 0,
              isDue: module.status === 'due',
              // Store full module data for editing
              name: module.name,
              description: module.description || '',
              order: module.order || 1,
              is_active: module.is_active !== undefined ? module.is_active : true,
              is_enabled: module.is_enabled !== undefined ? module.is_enabled : false,
              subject: module.subject || module.subject_id || module.subject?.id,
              modules: chaptersList.map((chapter, idx) => ({
                id: chapter.id,
                title: chapter.title || `Chapter ${idx + 1}`
              }))
            };
          } catch (err) {
            console.error(`Error fetching chapters for module ${module.id}:`, err);
            return {
              id: module.id,
              subjectId: module.subject || module.subject_id || module.subject?.id,
              title: module.name || `Module ${module.order}`,
              completionRate: module.user_percentage || 0,
              isDue: module.status === 'due',
              // Store full module data for editing
              name: module.name,
              description: module.description || '',
              order: module.order || 1,
              is_active: module.is_active !== undefined ? module.is_active : true,
              is_enabled: module.is_enabled !== undefined ? module.is_enabled : false,
              subject: module.subject || module.subject_id || module.subject?.id,
              modules: []
            };
          }
        })
      );

      setAllModulesData(modulesWithChapters);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err.message || 'Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Local filtering based on selectedSubject
  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      return;
    }

    const filteredModules = allModulesData.filter(module => {
      const moduleSubjectId = module.subjectId?.toString() || '';
      const selectedSubjectId = selectedSubject.toString();
      return moduleSubjectId === selectedSubjectId;
    });

    setChapters(filteredModules);
    if (filteredModules.length > 0) {
      setExpandedChapters([filteredModules[0].id]);
    }
  }, [selectedSubject, allModulesData]);

  // Fetch subjects for the filter dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectsService.getSubjects();
        const subjectsData = response.data || response;
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        if (subjectsData.length > 0 && !selectedSubject) {
          setSelectedSubject(subjectsData[0].id);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch all modules once on component mount
  useEffect(() => {
    fetchAllModulesData();
  }, [fetchAllModulesData]);

  const handleCreateModule = async (moduleData) => {
    setCreatingModule(true);
    setCreateError(null);

    try {
      if (editingModule) {
        // Update existing module
        await modulesService.updateModule(editingModule.id, moduleData);
        setShowCreateModal(false);
        setEditingModule(null);
        setSuccessData({
          title: 'Module Updated Successfully',
          message: `Module "${moduleData.name}" has been updated successfully.`
        });
      } else {
        // Create new module
        await modulesService.createModule(moduleData);
        setShowCreateModal(false);
        setSuccessData({
          title: 'Module Created Successfully',
          message: `Module "${moduleData.name}" has been created successfully.`
        });
      }
      setShowSuccessModal(true);
      await fetchAllModulesData();
    } catch (err) {
      console.error('Error saving module:', err);
      setCreateError(err.message || `Failed to ${editingModule ? 'update' : 'create'} module. Please try again.`);
    } finally {
      setCreatingModule(false);
    }
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setShowCreateModal(true);
    setCreateError(null);
  };

  const handleCreateChapter = async (chapterData) => {
    if (!selectedModuleForChapter) {
      setCreateChapterError('No module selected');
      return;
    }

    setCreatingChapter(true);
    setCreateChapterError(null);

    try {
      const response = await modulesService.createChapter(selectedModuleForChapter.id, chapterData);
      const successMessage = response?.message || `Chapter "${chapterData.title}" has been created successfully.`;
      
      setShowCreateChapterModal(false);
      setSelectedModuleForChapter(null);
      setSuccessData({
        title: 'Chapter Created Successfully',
        message: successMessage
      });
      setShowSuccessModal(true);
      await fetchAllModulesData();
    } catch (err) {
      console.error('Error creating chapter:', err);
      let errorMessage = 'Failed to create chapter. Please try again.';
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setCreateChapterError(errorMessage);
    } finally {
      setCreatingChapter(false);
    }
  };

  const handleAddChapter = (module) => {
    setSelectedModuleForChapter(module);
    setShowCreateChapterModal(true);
    setCreateChapterError(null);
  };

  const handleViewQuestions = async (chapter) => {
    setSelectedChapterForQuestion(chapter);
    setLoadingQuestions(true);
    setChapterQuestions([]);
    setShowViewQuestionsModal(true);
    setEditingQuestion(null);

    try {
      // Use module_content API to get all content (questions and theories) for the chapter
      const response = await modulesService.getChapterModuleContent(chapter.id);
      const contentData = response.data || response;
      const contentList = Array.isArray(contentData) ? contentData : [];
      
      // Extract questions from module content (filter only question type content)
      const questions = contentList
        .filter(content => content.content_type === 'question' && content.question)
        .map(content => ({
          ...content.question,
          // Preserve module content metadata if needed
          module_content_id: content.id,
          order: content.order
        }));
      
      setChapterQuestions(questions);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setChapterQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleCreateQuestion = (chapter) => {
    setSelectedChapterForQuestion(chapter);
    setEditingQuestion(null);
    setShowCreateQuestionModal(true);
    setCreateQuestionError(null);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowCreateQuestionModal(true);
    setCreateQuestionError(null);
  };

  const handleSaveQuestion = async (questionData) => {
    if (!selectedChapterForQuestion) {
      setCreateQuestionError('No chapter selected');
      return;
    }

    setCreatingQuestion(true);
    setCreateQuestionError(null);

    try {
      const { options, image, ...questionPayload } = questionData;

      // If image is present or needs to be removed, create FormData
      let dataToSend;
      const needsFormData = image instanceof File || questionPayload.remove_image;
      if (needsFormData) {
        dataToSend = new FormData();
        Object.keys(questionPayload).forEach(key => {
          if (key !== 'remove_image' && questionPayload[key] !== null && questionPayload[key] !== undefined) {
            const value = questionPayload[key];
            // Handle different data types
            if (value instanceof File) {
              dataToSend.append(key, value);
            } else if (typeof value === 'boolean') {
              dataToSend.append(key, value.toString());
            } else if (typeof value === 'number') {
              dataToSend.append(key, value.toString());
            } else {
              dataToSend.append(key, value);
            }
          }
        });
        if (image instanceof File) {
          dataToSend.append('image', image);
        } else if (questionPayload.remove_image) {
          // For Django REST Framework, send empty file or null to clear image
          // We'll send an empty string which Django should interpret as clearing the field
          dataToSend.append('image', '');
        }
      } else {
        dataToSend = questionPayload;
      }

      if (editingQuestion) {
        // Update existing question
        const questionId = editingQuestion.id;
        await questionsService.updateQuestion(questionId, dataToSend);

        // Update options if provided
        if (options && options.length > 0 && (questionPayload.question_type === 'mcq_single' || questionPayload.question_type === 'mcq_multiple')) {
          // Note: You may need to implement update options endpoint or delete and recreate
          // For now, we'll just update the question
        }

        setShowCreateQuestionModal(false);
        setEditingQuestion(null);
        setSelectedChapterForQuestion(null);
        setSuccessData({
          title: 'Question Updated Successfully',
          message: 'Question has been updated successfully.'
        });
        setShowSuccessModal(true);
        // Refresh questions list
        if (showViewQuestionsModal) {
          await handleViewQuestions(selectedChapterForQuestion);
        }
      } else {
        // Create new question
        const questionResponse = await questionsService.createQuestion(dataToSend);
        const questionId = questionResponse.data?.id || questionResponse.id;

        if (!questionId) {
          throw new Error('Failed to get question ID from response');
        }

        if (options && options.length > 0 && (questionPayload.question_type === 'mcq_single' || questionPayload.question_type === 'mcq_multiple')) {
          await questionsService.createQuestionOptions(questionId, options);
        }

        await modulesService.createChapterModuleContent(selectedChapterForQuestion.id, {
          type: 'question',
          question: questionId
        });

        setShowCreateQuestionModal(false);
        setSelectedChapterForQuestion(null);
        setSuccessData({
          title: 'Question Created Successfully',
          message: 'Question has been created and added to the chapter successfully.'
        });
        setShowSuccessModal(true);
        await fetchAllModulesData();
      }
    } catch (err) {
      console.error(`Error ${editingQuestion ? 'updating' : 'creating'} question:`, err);
      setCreateQuestionError(err.message || `Failed to ${editingQuestion ? 'update' : 'create'} question. Please try again.`);
    } finally {
      setCreatingQuestion(false);
    }
  };

  const selectedSubjectName = subjects.find(s => s.id.toString() === selectedSubject.toString())?.name || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Modules & Assignments
                </h1>
                <p className="text-gray-600 mt-1">Manage your learning modules and assignments</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Modules</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{chapters.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Chapters</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {chapters.reduce((sum, ch) => sum + (ch.modules?.length || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selected Subject</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1 truncate max-w-[150px]">
                    {selectedSubjectName || 'None'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Filter className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 w-full md:w-auto">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <span>Filter by Subject</span>
              </label>
              <div className="relative">
                <select 
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full md:w-64 px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none cursor-pointer hover:border-gray-300"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  if (!selectedSubject) {
                    alert('Please select a subject first');
                    return;
                  }
                  setShowCreateModal(true);
                  setCreateError(null);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedSubject}
              >
                <Plus className="h-5 w-5" />
                <span>Create Module</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
              <Loader2 className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
            </div>
            <p className="text-gray-600 mt-4 font-medium">Loading modules...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold text-lg mb-1">Error Loading Modules</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    fetchAllModulesData();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modules List */}
        {!loading && !error && (
          <div className="space-y-4">
            {chapters.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Modules Found</h3>
                  <p className="text-gray-600 mb-6">
                    {selectedSubject 
                      ? `No modules found for the selected subject. Create your first module to get started!`
                      : 'Please select a subject to view modules.'}
                  </p>
                  {selectedSubject && (
                    <button
                      onClick={() => {
                        setShowCreateModal(true);
                        setCreateError(null);
                      }}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Create First Module</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              chapters.map((chapter, index) => (
                <div 
                  key={chapter.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Module Header */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-2 rounded-lg transition-colors ${
                          expandedChapters.includes(chapter.id) 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {expandedChapters.includes(chapter.id) ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-xl font-bold text-gray-900">{chapter.title}</h3>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1 px-3 py-1 bg-blue-50 rounded-full">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-600">
                                  {chapter.completionRate}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {chapter.modules?.length || 0} {chapter.modules?.length === 1 ? 'chapter' : 'chapters'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditModule(chapter);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Mark Due</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle toggle due status
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                              chapter.isDue ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                chapter.isDue ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedChapters.includes(chapter.id) && (
                    <div className="border-t border-gray-200 bg-gray-50/50 p-6 space-y-3 animate-slide-down">
                      {chapter.modules && chapter.modules.length > 0 ? (
                        chapter.modules.map((module, moduleIndex) => (
                          <div 
                            key={module.id} 
                            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                  <FileText className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{module.title}</h4>
                                  <p className="text-xs text-gray-500">Chapter {moduleIndex + 1}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewQuestions(module)}
                                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="text-sm font-medium">View</span>
                                </button>
                                <button
                                  onClick={() => handleCreateQuestion(module)}
                                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span className="text-sm font-medium">Question</span>
                                </button>
                                <Link 
                                  to={`/modules/${module.id}`}
                                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <Play className="h-4 w-4" />
                                  <span className="text-sm font-medium">Open</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <p>No chapters in this module yet.</p>
                        </div>
                      )}
                      <div className="pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleAddChapter(chapter)}
                          className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Add Chapter</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Create/Edit Module Modal */}
        {showCreateModal && (
          <CreateModuleModal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setEditingModule(null);
              setCreateError(null);
            }}
            onSave={handleCreateModule}
            loading={creatingModule}
            error={createError}
            selectedSubject={editingModule ? null : selectedSubject}
            moduleData={editingModule}
          />
        )}

        {/* Create Chapter Modal */}
        {showCreateChapterModal && (
          <CreateChapterModal
            isOpen={showCreateChapterModal}
            onClose={() => {
              setShowCreateChapterModal(false);
              setSelectedModuleForChapter(null);
              setCreateChapterError(null);
            }}
            onSave={handleCreateChapter}
            loading={creatingChapter}
            error={createChapterError}
            selectedModule={selectedModuleForChapter}
          />
        )}

        {/* View Questions Modal */}
        {showViewQuestionsModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
              setShowViewQuestionsModal(false);
              setSelectedChapterForQuestion(null);
              setChapterQuestions([]);
            }} />
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <HelpCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Questions
                        </h2>
                        <p className="text-sm text-purple-100 mt-0.5">
                          {selectedChapterForQuestion?.title || 'Chapter'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowViewQuestionsModal(false);
                        setSelectedChapterForQuestion(null);
                        setChapterQuestions([]);
                        setEditingQuestion(null);
                      }}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                  {loadingQuestions ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
                      <p className="text-gray-600 font-medium">Loading questions...</p>
                    </div>
                  ) : chapterQuestions.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <HelpCircle className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Found</h3>
                      <p className="text-gray-600 mb-6">This chapter doesn't have any questions yet.</p>
                      <button
                        onClick={() => {
                          setShowViewQuestionsModal(false);
                          handleCreateQuestion(selectedChapterForQuestion);
                        }}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Create First Question</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chapterQuestions.map((question, index) => (
                        <div
                          key={question.id}
                          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                <span className="text-sm font-bold text-blue-600">Q{index + 1}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                  {question.question_type?.replace('_', ' ').toUpperCase() || 'MCQ'}
                                </span>
                                <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full capitalize">
                                  {question.difficulty_level || 'Medium'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="text-sm font-medium">Edit</span>
                            </button>
                          </div>
                          <p className="text-gray-800 text-lg leading-relaxed">{question.question_text}</p>
                          {question.image && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Question Image:</p>
                              <div className="relative inline-block max-w-md">
                                <img
                                  src={question.image.startsWith('http') ? question.image : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${question.image}`}
                                  alt="Question"
                                  className="rounded-lg border-2 border-gray-200 max-w-full h-auto"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {question.options && question.options.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Options:</p>
                              <div className="space-y-2">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={option.id || optIndex}
                                    className={`flex items-center space-x-2 p-2 rounded-lg ${
                                      option.is_correct ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                    }`}
                                  >
                                    <span className="text-sm text-gray-600">{String.fromCharCode(65 + optIndex)}.</span>
                                    <span className="text-sm text-gray-800 flex-1">{option.option_text}</span>
                                    {option.is_correct && (
                                      <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {question.explanation && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Explanation: </span>
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Question Modal */}
        {showCreateQuestionModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
              setShowCreateQuestionModal(false);
              setSelectedChapterForQuestion(null);
              setCreateQuestionError(null);
            }} />
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className={`px-8 py-6 ${editingQuestion ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        {editingQuestion ? <Edit className="h-6 w-6 text-white" /> : <Plus className="h-6 w-6 text-white" />}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {editingQuestion ? 'Edit Question' : 'Create Question'}
                        </h2>
                        <p className={`text-sm mt-0.5 ${editingQuestion ? 'text-blue-100' : 'text-green-100'}`}>
                          {selectedChapterForQuestion?.title || 'Chapter'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateQuestionModal(false);
                        setSelectedChapterForQuestion(null);
                        setEditingQuestion(null);
                        setCreateQuestionError(null);
                      }}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                  <CreateQuestionForm
                    onSave={handleSaveQuestion}
                    onCancel={() => {
                      setShowCreateQuestionModal(false);
                      setSelectedChapterForQuestion(null);
                      setEditingQuestion(null);
                      setCreateQuestionError(null);
                    }}
                    loading={creatingQuestion}
                    error={createQuestionError}
                    initialData={editingQuestion}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title={successData.title}
            message={successData.message}
          />
        )}
      </div>
    </div>
  );
};

// Create Question Form Component
const CreateQuestionForm = ({ onSave, onCancel, loading, error, initialData }) => {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      // Pre-fill form with existing question data
      return {
        question_text: initialData.question_text || '',
        question_type: initialData.question_type || 'mcq_single',
        difficulty_level: initialData.difficulty_level || 'medium',
        exp_points: initialData.exp_points || 10,
        explanation: initialData.explanation || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        options: initialData.options && initialData.options.length > 0
          ? initialData.options.map((opt, idx) => ({
              option_text: opt.option_text || '',
              is_correct: opt.is_correct || false,
              order: opt.order || idx + 1,
            }))
          : [
              { option_text: '', is_correct: false, order: 1 },
              { option_text: '', is_correct: false, order: 2 },
              { option_text: '', is_correct: false, order: 3 },
              { option_text: '', is_correct: false, order: 4 },
            ],
      };
    }
    return {
      question_text: '',
      question_type: 'mcq_single',
      difficulty_level: 'medium',
      exp_points: 10,
      explanation: '',
      is_active: true,
      options: [
        { option_text: '', is_correct: false, order: 1 },
        { option_text: '', is_correct: false, order: 2 },
        { option_text: '', is_correct: false, order: 3 },
        { option_text: '', is_correct: false, order: 4 },
      ],
    };
  });
  const [validationError, setValidationError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(() => {
    // If editing and question has an image, set preview
    if (initialData?.image) {
      const imageUrl = initialData.image.startsWith('http') 
        ? initialData.image 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${initialData.image}`;
      return imageUrl;
    }
    return null;
  });

  // Reset image state when initialData changes (switching between edit/create modes)
  useEffect(() => {
    if (initialData?.image) {
      const imageUrl = initialData.image.startsWith('http') 
        ? initialData.image 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${initialData.image}`;
      setImagePreview(imageUrl);
      setImageFile(null);
    } else {
      setImagePreview(null);
      setImageFile(null);
    }
  }, [initialData]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, field, value) => {
    setValidationError(null); // Clear validation error when options change
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], [field]: value };
      return { ...prev, options: newOptions };
    });
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { option_text: '', is_correct: false, order: prev.options.length + 1 }]
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index).map((opt, idx) => ({ ...opt, order: idx + 1 }))
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setValidationError(null);
      
      // Clear remove_image flag if a new image is selected
      if (formData.remove_image) {
        setFormData(prev => {
          const { remove_image, ...rest } = prev;
          return rest;
        });
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('question-image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
    // If editing and had an existing image, mark it for removal
    if (initialData?.image) {
      // Set a flag to indicate image should be removed
      setFormData(prev => ({ ...prev, remove_image: true }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);
    
    // Validate that at least one correct option is selected for MCQ questions
    if (formData.question_type === 'mcq_single' || formData.question_type === 'mcq_multiple') {
      const validOptions = formData.options.filter(opt => opt.option_text.trim() !== '');
      const hasCorrectOption = validOptions.some(opt => opt.is_correct === true);
      
      if (!hasCorrectOption) {
        setValidationError('Please select at least one correct option.');
        return;
      }
      
      // Ensure we only send valid options (with text)
      const dataToSave = { ...formData, options: validOptions };
      if (imageFile) {
        dataToSave.image = imageFile;
      }
      onSave(dataToSave);
    } else {
      // For non-MCQ questions, just send the data
      const dataToSave = { ...formData };
      if (imageFile) {
        dataToSave.image = imageFile;
      }
      onSave(dataToSave);
    }
  };

  const getDifficultyColor = (level) => {
    switch(level) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}
      {validationError && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Validation Error</p>
            <p className="text-sm text-red-700 mt-1">{validationError}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Question Text <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.question_text}
          onChange={(e) => handleFieldChange('question_text', e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
          placeholder="Enter the question text..."
          disabled={loading}
        />
      </div>

      {/* Image Upload Field */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
          <ImageIcon className="h-4 w-4 text-gray-500" />
          <span>Question Image <span className="text-xs font-normal text-gray-500">(Optional)</span></span>
        </label>
        <div className="space-y-3">
          {/* File Input */}
          <div className="relative">
            <input
              id="question-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={loading}
            />
            <label
              htmlFor="question-image-upload"
              className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                validationError && validationError.includes('image')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
              } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <Upload className={`h-5 w-5 ${validationError && validationError.includes('image') ? 'text-red-400' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium ${validationError && validationError.includes('image') ? 'text-red-600' : 'text-gray-700'}`}>
                {imageFile ? imageFile.name : 'Choose image file'}
              </span>
            </label>
          </div>
          
          {/* Preview */}
          {imagePreview && (
            <div className="relative inline-block">
              <div className="relative max-w-md rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                <img
                  src={imagePreview}
                  alt="Question preview"
                  className="w-full h-auto object-contain max-h-64"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={loading}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {/* Help Text */}
          <p className="text-xs text-gray-500">
            Supported formats: JPG, PNG, GIF. Max size: 5MB
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Question Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.question_type}
            onChange={(e) => handleFieldChange('question_type', e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            disabled={loading}
          >
            <option value="mcq_single">MCQ - Single Correct Answer</option>
            <option value="mcq_multiple">MCQ - Multiple Correct Answers</option>
            <option value="short_answer">Short Answer Question</option>
          </select>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Difficulty Level <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.difficulty_level}
            onChange={(e) => handleFieldChange('difficulty_level', e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            disabled={loading}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Experience Points
          </label>
          <input
            type="number"
            value={formData.exp_points}
            onChange={(e) => handleFieldChange('exp_points', parseInt(e.target.value) || 10)}
            min="1"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            disabled={loading}
          />
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Status
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleFieldChange('is_active', e.target.checked)}
              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Explanation
        </label>
        <textarea
          value={formData.explanation}
          onChange={(e) => handleFieldChange('explanation', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
          placeholder="Enter explanation for the correct answer..."
          disabled={loading}
        />
      </div>

      {/* Options Section */}
      {(formData.question_type === 'mcq_single' || formData.question_type === 'mcq_multiple') && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Options <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addOption}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              <span>Add Option</span>
            </button>
          </div>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex-1">
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type={formData.question_type === 'mcq_single' ? 'radio' : 'checkbox'}
                      name="correct_answer"
                      checked={option.is_correct}
                      onChange={(e) => {
                        setValidationError(null); // Clear validation error when correct option is selected
                        if (formData.question_type === 'mcq_single') {
                          setFormData(prev => ({
                            ...prev,
                            options: prev.options.map((opt, idx) => ({
                              ...opt,
                              is_correct: idx === index
                            }))
                          }));
                        } else {
                          handleOptionChange(index, 'is_correct', e.target.checked);
                        }
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      disabled={loading}
                    />
                    <span>Correct</span>
                  </label>
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {formData.question_type === 'mcq_single' 
              ? 'Select exactly one correct answer'
              : 'Select one or more correct answers'}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
            initialData 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
          }`}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{initialData ? 'Updating...' : 'Creating...'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>{initialData ? 'Update Question' : 'Create Question'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ModulesAssignments;
