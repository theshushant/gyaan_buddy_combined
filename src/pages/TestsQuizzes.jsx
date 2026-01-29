import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Trash2,
  Edit,
  Sparkles,
  BookOpen,
  FileText,
  Clock,
  Users
} from 'lucide-react';
import classesService from '../services/classesService';
import subjectsService from '../services/subjectsService';
import testsService from '../services/testsService';
import aiService from '../services/aiService';

const TestsQuizzes = () => {
  const [activeTab, setActiveTab] = useState('tests');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [formData, setFormData] = useState({
    testDate: '',
    testTime: '',
    duration: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showQuestionGenerator, setShowQuestionGenerator] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // AI Generation form state
  const [aiFormData, setAiFormData] = useState({
    number_of_questions: 10,
    level: 3,
    question_type: 'mcq_single',
    add_image: false
  });

  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);
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
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true);
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
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  const fetchModules = useCallback(async (subjectId) => {
    if (!subjectId) {
      setModules([]);
      return;
    }
    setLoadingModules(true);
    try {
      const response = await subjectsService.getModules(subjectId);
      const modulesData = response.data || response || [];
      const modulesList = modulesData.map(module => ({
        id: module.id || module.uuid,
        name: module.name || module
      })).filter(module => module.id && module.name);
      setModules(modulesList);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      setModules([]);
    } finally {
      setLoadingModules(false);
    }
  }, []);

  const fetchChapters = useCallback(async (moduleId) => {
    if (!moduleId) {
      setChapters([]);
      return;
    }
    setLoadingChapters(true);
    try {
      const response = await subjectsService.getAllChapters({module:moduleId});
      const chaptersData = response.data || response || [];
      const chaptersList = chaptersData.map(chapter => ({
        id: chapter.id || chapter.uuid,
        title: chapter.title || chapter
      })).filter(chapter => chapter.id && chapter.title);
      setChapters(chaptersList);
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
      setChapters([]);
    } finally {
      setLoadingChapters(false);
    }
  }, []);

  const fetchTests = useCallback(async () => {
    setLoadingTests(true);
    try {
      const response = await testsService.getTests();
      const testsData = response.data || response || [];
      setTests(testsData);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      setTests([]);
    } finally {
      setLoadingTests(false);
    }
  }, []);

  // Fetch tests when component loads or when tests tab is active
  useEffect(() => {
    if (activeTab === 'tests') {
      fetchTests();
    }
  }, [activeTab, fetchTests]);

  // Fetch classes and subjects when create tab is active
  useEffect(() => {
    if (activeTab === 'create' || isEditMode) {
      fetchClasses();
      fetchSubjects();
    }
  }, [activeTab, isEditMode, fetchClasses, fetchSubjects]);

  // Fetch modules when subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchModules(selectedSubject);
      setSelectedModule('');
      setSelectedChapter('');
    } else {
      setModules([]);
      setSelectedModule('');
      setSelectedChapter('');
    }
  }, [selectedSubject, fetchModules]);

  // Fetch chapters when module changes
  useEffect(() => {
    if (selectedModule) {
      fetchChapters(selectedModule);
      setSelectedChapter('');
    } else {
      setChapters([]);
      setSelectedChapter('');
    }
  }, [selectedModule, fetchChapters]);

  // Pre-fill form when editing a test
  useEffect(() => {
    if (editingTest && isEditMode) {
      const dateValue = editingTest.test_datetime;
      const testDate = dateValue 
        ? new Date(dateValue).toISOString().split('T')[0]
        : '';
      
      let testTime = '';
      if (editingTest.test_datetime) {
        const dateTime = new Date(editingTest.test_datetime);
        const hours = dateTime.getHours().toString().padStart(2, '0');
        const minutes = dateTime.getMinutes().toString().padStart(2, '0');
        if (hours !== '00' || minutes !== '00') {
          testTime = `${hours}:${minutes}`;
        }
      }
      
      setFormData({
        testDate,
        testTime,
        duration: editingTest.duration?.toString() || '',
      });
      
      if (editingTest.subject) {
        const subjectId = editingTest.subject?.id || editingTest.subject?.uuid || editingTest.subject;
        setSelectedSubject(subjectId);
      }
      
      if (editingTest.class_group) {
        const classId = editingTest.class_group?.id || editingTest.class_group?.uuid || editingTest.class_group;
        setSelectedClass(classId);
      }

      if (editingTest.module) {
        const moduleId = editingTest.module?.id || editingTest.module?.uuid || editingTest.module;
        setSelectedModule(moduleId);
      }

      if (editingTest.module_chapter) {
        const chapterId = editingTest.module_chapter?.id || editingTest.module_chapter?.uuid || editingTest.module_chapter;
        setSelectedChapter(chapterId);
      }
    } else if (!isEditMode) {
      setFormData({
        testDate: '',
        testTime: '',
        duration: '',
      });
      setSelectedClass('');
      setSelectedSubject('');
      setSelectedModule('');
      setSelectedChapter('');
    }
  }, [editingTest, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAIGenerationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAiFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }
    if (!selectedModule) {
      setError('Please select a module');
      return;
    }
    if (!selectedChapter) {
      setError('Please select a chapter');
      return;
    }
    if (!formData.testDate) {
      setError('Test date is required');
      return;
    }
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      setError('Please enter a valid duration in minutes');
      return;
    }

    setSubmitting(true);

    try {
      const testDateTime = formData.testTime 
        ? `${formData.testDate}T${formData.testTime}:00`
        : `${formData.testDate}T00:00:00`;
      
      if (isEditMode && editingTest) {
        const testId = editingTest.id || editingTest.uuid;
        const testPayload = {
          test_datetime: testDateTime,
          duration: parseInt(formData.duration),
          class_group: selectedClass,
          subject: selectedSubject,
          module: selectedModule,
          module_chapter: selectedChapter,
        };
        
        const updatedTest = await testsService.updateTest(testId, testPayload);
        const testData = updatedTest.data || updatedTest;
        
        setSuccess(true);
        setIsEditMode(false);
        setEditingTest(null);
        setFormData({
          testDate: '',
          testTime: '',
          duration: '',
        });
        setSelectedClass('');
        setSelectedSubject('');
        setSelectedModule('');
        setSelectedChapter('');
        
        await fetchTests();
        
        setTimeout(() => {
          setActiveTab('tests');
        }, 1500);
      } else {
        const testPayload = {
          test_datetime: testDateTime,
            duration: parseInt(formData.duration),
          class_group: selectedClass,
            subject: selectedSubject,
          module: selectedModule,
          module_chapter: selectedChapter,
        };
        
        const createdTest = await testsService.createTest(testPayload);
        const testData = createdTest.data || createdTest;
        
        // Store the IDs before resetting - we need them for question generation
        const testSubjectId = testData.subject?.id || testData.subject?.uuid || testData.subject || selectedSubject;
        const testModuleId = testData.module?.id || testData.module?.uuid || testData.module || selectedModule;
        const testChapterId = testData.module_chapter?.id || testData.module_chapter?.uuid || testData.module_chapter || selectedChapter;
        
        // Store these in the testData object for later use
        testData._subjectId = testSubjectId;
        testData._moduleId = testModuleId;
        testData._chapterId = testChapterId;
        
        setSelectedTest(testData);
        setShowQuestionGenerator(true);
        setSuccess(true);
        setError(null);
        
        // Don't reset subject/module/chapter yet - we need them for question generation
        // Keep them until we're done with question generation
        setFormData({
          testDate: '',
          testTime: '',
          duration: '',
        });
        setSelectedClass('');
      }
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} test:`, error);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} test. Please try again.`;
      
      if (error.responseData) {
        const apiError = error.responseData;
        if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.errors) {
          const errorMessages = Object.entries(apiError.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = `Validation errors: ${errorMessages}`;
        } else if (apiError.detail) {
          errorMessage = apiError.detail;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      } else if (error.response?.data) {
        const apiError = error.response.data;
        if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.detail) {
          errorMessage = apiError.detail;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedTest) return;
    
    setGeneratingQuestions(true);
    setGenerationError(null);
    
    try {
      // Get IDs from selectedTest (stored when test was created) or from state
      const subjectId = selectedTest._subjectId || selectedTest.subject?.id || selectedTest.subject?.uuid || selectedTest.subject || selectedSubject;
      const moduleId = selectedTest._moduleId || selectedTest.module?.id || selectedTest.module?.uuid || selectedTest.module || selectedModule;
      const chapterId = selectedTest._chapterId || selectedTest.module_chapter?.id || selectedTest.module_chapter?.uuid || selectedTest.module_chapter || selectedChapter;
      
      // Get names - try from test object first, then from state
      let subjectName = selectedTest.subject_name || selectedTest.subject?.name || '';
      let moduleName = selectedTest.module_name || selectedTest.module?.name || '';
      let chapterName = selectedTest.chapter_title || selectedTest.module_chapter?.title || '';
      
      // If names not in test object, get from state
      if (!subjectName && subjectId) {
        subjectName = subjects.find(s => s.id === subjectId)?.name || '';
      }
      if (!moduleName && moduleId) {
        // Need to fetch modules if not already loaded
        if (modules.length === 0 && subjectId) {
          await fetchModules(subjectId);
        }
        moduleName = modules.find(m => m.id === moduleId)?.name || '';
      }
      if (!chapterName && chapterId) {
        // Need to fetch chapters if not already loaded
        if (chapters.length === 0 && moduleId) {
          await fetchChapters(moduleId);
        }
        chapterName = chapters.find(c => c.id === chapterId)?.title || '';
      }
      
      // Validate that we have all required IDs
      if (!subjectId || !moduleId || !chapterId) {
        setGenerationError('Missing required information. Please ensure subject, module, and chapter are selected.');
        return;
      }
      
      // Get test ID
      const testId = selectedTest.id || selectedTest.uuid;
      
      const requestData = {
        subject_id: subjectId,
        module_id: moduleId,
        chapter_id: chapterId,
        subject_name: subjectName,
        module_name: moduleName,
        chapter_name: chapterName,
        number_of_questions: aiFormData.number_of_questions,
        level: aiFormData.level,
        question_type: aiFormData.question_type,
        add_image: aiFormData.add_image,
        for_test: true,
        test_id: testId
      };
      
      const response = await aiService.generateAIQuestionsGemini(requestData);
      const responseData = response.data || response;
      
      if (responseData.questions && responseData.questions.length > 0) {
        setGeneratedQuestions(responseData.questions);
        setSuccess(true);
        
        // Refresh tests to get updated question count
        await fetchTests();
      } else {
        setGenerationError('No questions were generated. Please try again.');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      let errorMessage = 'Failed to generate questions. Please try again.';
      
      if (error.responseData) {
        const apiError = error.responseData;
        if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.error) {
          errorMessage = apiError.error;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setGenerationError(errorMessage);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setIsEditMode(true);
    setActiveTab('create');
    setError(null);
    setSuccess(false);
    setShowQuestionGenerator(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingTest(null);
    setFormData({
      testDate: '',
      testTime: '',
      duration: '',
    });
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedModule('');
    setSelectedChapter('');
    setError(null);
    setShowQuestionGenerator(false);
  };

  const handleBackToForm = () => {
    setShowQuestionGenerator(false);
    setSelectedTest(null);
    setGeneratedQuestions([]);
    setGenerationError(null);
    // Now we can reset the form fields
    setSelectedSubject('');
    setSelectedModule('');
    setSelectedChapter('');
  };

  const handleDone = () => {
    // Navigate to All Tests tab
    setActiveTab('tests');
    // Reset question generator state
    setShowQuestionGenerator(false);
    setSelectedTest(null);
    setGeneratedQuestions([]);
    setGenerationError(null);
    setSuccess(false);
    // Reset form fields
    setSelectedSubject('');
    setSelectedModule('');
    setSelectedChapter('');
    // Refresh tests list to show updated question counts
    fetchTests();
  };

  return (
    <div className="p-6 animate-fade-in bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 animate-slide-down mb-2">Tests & Quizzes</h1>
        <p className="text-gray-600">Create and manage tests for your students</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => {
                if (isEditMode) {
                  handleCancelEdit();
                }
                setActiveTab('tests');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeTab === 'tests' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>All Tests</span>
              </div>
            </button>
            <button
              onClick={() => {
                if (isEditMode) {
                  handleCancelEdit();
                }
                setActiveTab('create');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeTab === 'create' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create New Test</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'tests' && (
        <div className="space-y-6">
          {loadingTests ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
              <div className="text-gray-500">Loading tests...</div>
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500">No tests found. Create your first test!</div>
            </div>
          ) : (
            tests.map((test, index) => {
              const dateValue = test.test_datetime;
              const testDate = dateValue 
                ? new Date(dateValue).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A';
              
              const className = test.class_group_name || test.class_group?.name || 'N/A';
              const subjectName = test.subject_name || test.subject?.name || 'N/A';
              const moduleName = test.module_name || test.module?.name || '';
              const chapterTitle = test.chapter_title || test.module_chapter?.title || '';
              const questionCount = test.question_count || 0;
              
              return (
            <div 
                  key={test.id || test.uuid || index} 
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transform hover:scale-[1.01] transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {moduleName && chapterTitle ? `${moduleName} - ${chapterTitle}` : moduleName || 'Test'}
                      </h3>
                      <div className="flex items-center space-x-4 text-gray-600 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{className}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{subjectName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{testDate}</span>
                        </div>
                      </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                        onClick={() => handleEdit(test)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
                  >
                    <Edit className="h-4 w-4" />
                        <span>Edit</span>
                  </button>
                  <Link 
                        to={`/tests/performance/${test.id || test.uuid}`}
                        className="text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
                    style={{ backgroundColor: '#00167a' }}
                  >
                        <span>📊</span>
                    <span>View Results</span>
                  </Link>
                </div>
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{test.duration || 'N/A'}</div>
                      <div className="text-sm text-gray-600 mt-1">Duration (min)</div>
                </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{questionCount}</div>
                      <div className="text-sm text-gray-600 mt-1">Questions</div>
                </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{className}</div>
                      <div className="text-sm text-gray-600 mt-1">Class</div>
                </div>
                </div>
            </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'create' && !showQuestionGenerator && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="px-8 py-6 text-white" style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}>
            <h2 className="text-3xl font-bold mb-2">
              {isEditMode ? '✏️ Edit Test' : '➕ Create New Test'}
            </h2>
            <p className="text-accent-500/50">
              {isEditMode ? 'Update the details for this test.' : 'Fill in the details below to create a new test for your students.'}
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start space-x-3 animate-slide-down">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-start space-x-3 animate-slide-down">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Success!</p>
                    <p className="text-sm text-green-700 mt-1">
                      {isEditMode ? 'Test updated successfully!' : 'Test created successfully! You can now generate questions.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Subject and Class Selection */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <span className="text-primary-500">📚</span>
                  <span>Subject & Class</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      disabled={loadingSubjects}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">{loadingSubjects ? 'Loading subjects...' : 'Select Subject'}</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      disabled={loadingClasses || isEditMode}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">{loadingClasses ? 'Loading classes...' : 'Select Class'}</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Module and Chapter Selection */}
              {selectedSubject && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className="text-blue-500">📖</span>
                    <span>Module & Chapter</span>
                </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Module <span className="text-red-500">*</span>
                  </label>
                      <select 
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        disabled={loadingModules}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">{loadingModules ? 'Loading modules...' : 'Select Module'}</option>
                        {modules.map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chapter <span className="text-red-500">*</span>
                          </label>
                      <select 
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(e.target.value)}
                        disabled={loadingChapters || !selectedModule}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">{loadingChapters ? 'Loading chapters...' : selectedModule ? 'Select Chapter' : 'Select Module First'}</option>
                        {chapters.map((chapter) => (
                          <option key={chapter.id} value={chapter.id}>
                            {chapter.title}
                          </option>
                        ))}
                      </select>
                      </div>
                  </div>
                </div>
              )}

              {/* Schedule Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <span className="text-purple-600">📅</span>
                  <span>Schedule & Duration</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Test Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="testDate"
                      value={formData.testDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Test Time
                    </label>
                    <input
                      type="time"
                      name="testTime"
                      value={formData.testTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 60"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                    required
                  />
                </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isEditMode ? 'Update Test' : 'Create Test'}</span>
                      <span className="text-xl">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'create' && showQuestionGenerator && selectedTest && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
          <div className="px-8 py-6 text-white" style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}>
            <div className="flex items-center justify-between">
          <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center space-x-2">
                  <Sparkles className="h-8 w-8" />
                  <span>Generate Questions with AI</span>
                </h2>
                <p className="text-accent-500/50">
                  Use Vertex AI to automatically generate questions for your test
            </p>
          </div>
          <button
                onClick={handleBackToForm}
                className="text-white hover:text-gray-200 transition-colors"
          >
                <X className="h-6 w-6" />
          </button>
        </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {generationError && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start space-x-3 mb-6">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{generationError}</p>
          </div>
          </div>
            )}

            {success && generatedQuestions.length > 0 && (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-start space-x-3 mb-6">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                  <p className="text-sm font-semibold text-green-800">Success!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Successfully generated {generatedQuestions.length} questions!
                  </p>
              </div>
            </div>
          )}

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span>AI Generation Settings</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Questions <span className="text-red-500">*</span>
            </label>
                  <input
                    type="number"
                    name="number_of_questions"
                    value={aiFormData.number_of_questions}
                    onChange={handleAIGenerationChange}
                    min="1"
                    max="50"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            />
          </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                    name="level"
                    value={aiFormData.level}
                    onChange={handleAIGenerationChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                  >
                    <option value={1}>Level 1 - Basic</option>
                    <option value={2}>Level 2 - Easy</option>
                    <option value={3}>Level 3 - Medium</option>
                    <option value={4}>Level 4 - Hard</option>
                    <option value={5}>Level 5 - HOTS (Advanced)</option>
              </select>
            </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question Type <span className="text-red-500">*</span>
              </label>
              <select
                    name="question_type"
                    value={aiFormData.question_type}
                    onChange={handleAIGenerationChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                  >
                    <option value="mcq_single">MCQ - Single Correct Answer</option>
                    <option value="mcq_multiple">MCQ - Multiple Correct Answers</option>
                    <option value="short_answer">Short Answer Question</option>
                    <option value="rearrange">Re-arrange/Ordering</option>
              </select>
            </div>
                <div className="flex items-center space-x-3 pt-8">
                <input
                  type="checkbox"
                    id="add_image"
                    name="add_image"
                    checked={aiFormData.add_image}
                    onChange={handleAIGenerationChange}
                  className="h-5 w-5 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                  <label htmlFor="add_image" className="text-sm font-medium text-gray-700">
                    Generate images for questions
                </label>
              </div>
            </div>
          </div>

            {/* Generated Questions Preview */}
            {generatedQuestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Questions Preview</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedQuestions.map((question, index) => (
                    <div key={question.id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-600">Question {index + 1}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {question.question_type}
                        </span>
          </div>
                      <p className="text-gray-800 mb-2">{question.question_text}</p>
                      {question.options && question.options.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`text-sm ${option.is_correct ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                              {option.is_correct && '✓ '}
                              {option.option_text}
              </div>
                          ))}
                    </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

            {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            {generatedQuestions.length > 0 ? (
              // Show Done button when questions are generated
              <button
                type="button"
                onClick={handleDone}
                className="px-8 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Done</span>
              </button>
            ) : (
              // Show Back and Generate buttons when no questions generated yet
              <>
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateQuestions}
                  disabled={generatingQuestions || !selectedTest}
                  className="px-8 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}
                >
                  {generatingQuestions ? (
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
              </>
            )}
          </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default TestsQuizzes;
