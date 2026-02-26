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
import questionsService from '../services/questionsService';

const TestsQuizzes = () => {
  const [activeTab, setActiveTab] = useState('tests');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModulesChapters, setSelectedModulesChapters] = useState([]);
  const [chaptersLoadingFor, setChaptersLoadingFor] = useState(null);
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
  const [selectedGeneratedQuestionIds, setSelectedGeneratedQuestionIds] = useState(new Set());
  const [editingTest, setEditingTest] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTestQuestions, setEditTestQuestions] = useState([]);
  const [loadingEditQuestions, setLoadingEditQuestions] = useState(false);
  const [removingQuestionId, setRemovingQuestionId] = useState(null);
  const [loadingTestForEdit, setLoadingTestForEdit] = useState(false);
  const [questionAddMode, setQuestionAddMode] = useState('ai');
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);
  const [manualQuestionForm, setManualQuestionForm] = useState({
    question_text: '',
    question_type: 'mcq_single',
    difficulty_level: 'medium',
    explanation: '',
    options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }],
  });
  const [creatingQuestion, setCreatingQuestion] = useState(false);
  const [manualQuestionError, setManualQuestionError] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loadingBankQuestions, setLoadingBankQuestions] = useState(false);
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState(new Set());
  const [addingBankToTest, setAddingBankToTest] = useState(false);
  const [manualModeTestQuestions, setManualModeTestQuestions] = useState([]);
  const [loadingManualModeQuestions, setLoadingManualModeQuestions] = useState(false);
  
  const [aiFormData, setAiFormData] = useState({
    number_of_questions: 10,
    add_image: false,
    use_matplot: false
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

  const fetchChaptersForModule = useCallback(async (moduleId) => {
    if (!moduleId) return [];
    try {
      const response = await subjectsService.getChapters(moduleId);
      const chaptersData = response.data || response || [];
      return chaptersData.map(chapter => ({
        id: chapter.id || chapter.uuid,
        title: chapter.title || chapter
      })).filter(chapter => chapter.id && chapter.title);
    } catch (error) {
      console.error('Failed to fetch chapters for module:', error);
      return [];
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

  useEffect(() => {
    if (activeTab === 'tests') {
      fetchTests();
    }
  }, [activeTab, fetchTests]);

  useEffect(() => {
    if (activeTab === 'create' || isEditMode) {
      fetchClasses();
      fetchSubjects();
    }
  }, [activeTab, isEditMode, fetchClasses, fetchSubjects]);

  useEffect(() => {
    if (selectedSubject) {
      fetchModules(selectedSubject);
      if (!isEditMode) setSelectedModulesChapters([]);
    } else {
      setModules([]);
      if (!isEditMode) setSelectedModulesChapters([]);
    }
  }, [selectedSubject, fetchModules, isEditMode]);

  const fetchManualModeTestQuestions = useCallback(async () => {
    if (!selectedTest) return;
    const testId = selectedTest.id || selectedTest.uuid;
    setLoadingManualModeQuestions(true);
    try {
      const res = await testsService.getTestQuestions(testId);
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setManualModeTestQuestions(list);
    } catch (err) {
      console.error('Failed to fetch test questions:', err);
      setManualModeTestQuestions([]);
    } finally {
      setLoadingManualModeQuestions(false);
    }
  }, [selectedTest]);

  useEffect(() => {
    if (questionAddMode === 'manual' && selectedTest) {
      fetchManualModeTestQuestions();
    }
  }, [questionAddMode, selectedTest, fetchManualModeTestQuestions]);

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
      
      const cgs = editingTest.class_groups;
      if (cgs && Array.isArray(cgs) && cgs.length > 0) {
        const ids = cgs.map(c => c.id || c.uuid || c).filter(Boolean);
        setSelectedClasses(ids);
        setSelectedClass(ids.length === 1 ? ids[0] : '');
      } else if (editingTest.class_group) {
        const classId = editingTest.class_group?.id || editingTest.class_group?.uuid || editingTest.class_group;
        setSelectedClass(classId);
        setSelectedClasses(classId ? [classId] : []);
      } else {
        setSelectedClass('');
        setSelectedClasses([]);
      }

      const mc = editingTest.module_chapters;
      if (mc && Array.isArray(mc) && mc.length > 0) {
        setSelectedModulesChapters(mc.map(({ module_id, module_name, chapters: chList }) => ({
          moduleId: module_id,
          moduleName: module_name || '',
          chapterIds: (chList || []).map(c => c.id || c.uuid),
          chapters: (chList || []).map(c => ({ id: c.id || c.uuid, title: c.title || '' }))
        })));
      } else {
        setSelectedModulesChapters([]);
      }
    } else if (!isEditMode) {
      setFormData({
        testDate: '',
        testTime: '',
        duration: '',
      });
      setSelectedClass('');
      setSelectedClasses([]);
      setSelectedSubject('');
      setSelectedModulesChapters([]);
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

    const moduleChaptersPayload = selectedModulesChapters
      .filter(m => m.chapterIds && m.chapterIds.length > 0)
      .map(m => ({ module: m.moduleId, chapters: m.chapterIds }));

    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }
    const hasClass = selectedClass || (selectedClasses && selectedClasses.length > 0);
    if (!hasClass) {
      setError('Please select a class');
      return;
    }
    if (!moduleChaptersPayload.length) {
      setError('Please add at least one chapter and select at least one topic');
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
      
      const classIds = selectedClasses && selectedClasses.length > 0 ? selectedClasses : (selectedClass ? [selectedClass] : []);
      if (classIds.length === 0) {
        setError('Please select at least one class.');
        setSubmitting(false);
        return;
      }

      if (isEditMode && editingTest) {
        const testId = editingTest.id || editingTest.uuid;
        const testPayload = {
          test_datetime: testDateTime,
          duration: parseInt(formData.duration),
          subject: selectedSubject,
          module_chapters: moduleChaptersPayload,
          ...(classIds.length === 1 ? { class_group: classIds[0] } : {}),
          ...(classIds.length >= 1 ? { class_groups: classIds } : {}),
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
        setSelectedClasses([]);
        setSelectedSubject('');
        setSelectedModulesChapters([]);
        
        await fetchTests();
        
        setTimeout(() => {
          setActiveTab('tests');
        }, 1500);
      } else {
        const testPayload = {
          test_datetime: testDateTime,
          duration: parseInt(formData.duration),
          subject: selectedSubject,
          module_chapters: moduleChaptersPayload,
          ...(classIds.length === 1 ? { class_group: classIds[0] } : {}),
          ...(classIds.length >= 1 ? { class_groups: classIds } : {}),
        };
        
        const createdTest = await testsService.createTest(testPayload);
        const resBody = createdTest?.data ?? createdTest;
        const rawData = resBody?.data ?? resBody;
        const isMultipleTests = Array.isArray(rawData) && rawData.length > 0;
        const testData = isMultipleTests ? rawData[0] : rawData;
        
        const firstMc = moduleChaptersPayload[0];
        const firstChapterId = firstMc?.chapters?.[0];
        if (testData) {
          testData._subjectId = testData.subject?.id || testData.subject?.uuid || testData.subject || selectedSubject;
          testData._moduleId = firstMc?.module;
          testData._chapterId = firstChapterId;
          testData._moduleChapters = moduleChaptersPayload;
          testData._classGroups = testData.class_groups || (testData.class_group ? [testData.class_group] : []);
          if (isMultipleTests) {
            testData._testIds = rawData.map((t) => t.id || t.uuid).filter(Boolean);
            testData._isMultipleClassTest = true;
          }
        }
        
        setSelectedTest(testData);
        setShowQuestionGenerator(true);
        setSuccess(true);
        setError(null);
        
        setFormData({
          testDate: '',
          testTime: '',
          duration: '',
        });
        setSelectedClass('');
        setSelectedClasses([]);
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
      const subjectId = selectedTest._subjectId || selectedTest.subject?.id || selectedTest.subject?.uuid || selectedTest.subject || selectedSubject;
      let subjectName = selectedTest.subject_name || selectedTest.subject?.name || '';
      if (!subjectName && subjectId) subjectName = subjects.find(s => s.id === subjectId)?.name || '';
      
      const mcList = (selectedTest.module_chapters && selectedTest.module_chapters.length > 0)
        ? selectedTest.module_chapters
        : (selectedTest._moduleChapters || []);
      
      const module_chapters = [];
      for (const mc of mcList) {
        const moduleId = mc.module_id || mc.moduleId || mc.module;
        const moduleName = mc.module_name || mc.moduleName || '';
        const chapters = mc.chapters || [];
        for (const ch of chapters) {
          const chapterId = typeof ch === 'object' && ch !== null ? (ch.id || ch.uuid) : ch;
          const chapterName = typeof ch === 'object' && ch !== null ? (ch.title || ch.chapter_name || '') : '';
          if (moduleId && chapterId) {
            module_chapters.push({
              module_id: moduleId,
              chapter_id: chapterId,
              module_name: moduleName,
              chapter_name: chapterName
            });
          }
        }
      }
      
      if (!subjectId || !subjectName) {
        setGenerationError('Missing subject information.');
        return;
      }
      if (module_chapters.length === 0) {
        setGenerationError('Test has no chapters/topics selected. Edit the test to add at least one chapter and topic.');
        return;
      }
      
      const testIds = selectedTest._testIds;
      const singleTestId = selectedTest.id || selectedTest.uuid;
      const useMultipleTests = Array.isArray(testIds) && testIds.length > 0;
      if (!useMultipleTests && !singleTestId) {
        setGenerationError('Test ID is missing. Please select the test again or create it first.');
        return;
      }

      const classGroups = selectedTest._classGroups || selectedTest.class_groups || (selectedTest.class_group ? [selectedTest.class_group] : []);
      const firstClass = Array.isArray(classGroups) && classGroups.length > 0 ? classGroups[0] : null;
      let classContext = null;
      if (firstClass) {
        // Try to get name from class group object
        classContext = firstClass.name || firstClass.class_name || firstClass.class_group_name;
        // If not found, look it up from classes list
        if (!classContext) {
          const firstClassId = firstClass.id || firstClass.uuid || firstClass;
          const foundClass = classes.find(c => (c.id || c.uuid) === firstClassId);
          classContext = foundClass?.name || null;
        }
      }

      const requestData = {
        subject_id: subjectId,
        subject_name: subjectName,
        module_chapters,
        number_of_questions: aiFormData.number_of_questions,
        add_image: aiFormData.add_image,
        use_matplot: aiFormData.use_matplot,
        for_test: true,
        ...(useMultipleTests ? { test_ids: testIds } : { test_id: singleTestId })
      };
      if (classContext) {
        requestData.class_context = classContext;
      }

      const response = await aiService.generateAIQuestionsGemini(requestData);
      const responseData = response.data || response;
      const questions = responseData.data?.questions ?? responseData.questions;
      
      if (questions && questions.length > 0) {
        setGeneratedQuestions(questions);
        setSelectedGeneratedQuestionIds(new Set(questions.map(q => String(q.id || q.uuid)).filter(Boolean)));
        setSuccess(true);
        
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

  const handleEdit = async (test) => {
    setError(null);
    setSuccess(false);
    setShowQuestionGenerator(false);
    setEditTestQuestions([]);
    const testId = test.id || test.uuid;
    setLoadingTestForEdit(true);
    try {
      setLoadingEditQuestions(true);
      const [fullTestRes, questionsRes] = await Promise.all([
        testsService.getTestById(testId),
        testsService.getTestQuestions(testId).catch(() => ({ data: [] })),
      ]);
      const testData = fullTestRes.data || fullTestRes;
      const questionsList = Array.isArray(questionsRes?.data) ? questionsRes.data : (Array.isArray(questionsRes) ? questionsRes : []);
      setEditingTest(testData);
      setEditTestQuestions(questionsList);
      setIsEditMode(true);
      setActiveTab('create');
    } catch (err) {
      console.error('Failed to load test for edit:', err);
      setError('Failed to load test details.');
    } finally {
      setLoadingEditQuestions(false);
      setLoadingTestForEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingTest(null);
    setEditTestQuestions([]);
    setLoadingTestForEdit(false);
    setFormData({ testDate: '', testTime: '', duration: '' });
    setSelectedClass('');
    setSelectedClasses([]);
    setSelectedSubject('');
    setSelectedModulesChapters([]);
    setError(null);
    setShowQuestionGenerator(false);
  };

  const handleBackToForm = () => {
    setShowQuestionGenerator(false);
    setSelectedTest(null);
    setGeneratedQuestions([]);
    setSelectedGeneratedQuestionIds(new Set());
    setGenerationError(null);
    setSelectedSubject('');
    setSelectedClasses([]);
    setSelectedClass('');
    setSelectedModulesChapters([]);
    setQuestionAddMode('ai');
    setShowCreateQuestionModal(false);
    setShowBankModal(false);
    setManualModeTestQuestions([]);
  };

  const openCreateQuestionModal = () => {
    setManualQuestionForm({
      question_text: '',
      question_type: 'mcq_single',
      difficulty_level: 'medium',
      explanation: '',
      options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }],
    });
    setManualQuestionError(null);
    setShowCreateQuestionModal(true);
  };

  const handleCreateQuestionSubmit = async (e) => {
    e.preventDefault();
    setManualQuestionError(null);
    if (!manualQuestionForm.question_text?.trim()) {
      setManualQuestionError('Question text is required.');
      return;
    }
    const needsOptions = ['mcq_single', 'mcq_multiple'].includes(manualQuestionForm.question_type);
    if (needsOptions) {
      const validOptions = (manualQuestionForm.options || []).filter(o => (o.option_text || '').trim());
      if (validOptions.length < 2) {
        setManualQuestionError('At least 2 options are required for MCQ.');
        return;
      }
      const hasCorrect = validOptions.some(o => o.is_correct);
      if (!hasCorrect) {
        setManualQuestionError('Please mark at least one option as correct.');
        return;
      }
    }
    const testId = selectedTest?.id || selectedTest?.uuid;
    if (!testId) return;
    setCreatingQuestion(true);
    try {
      const payload = {
        question_text: manualQuestionForm.question_text.trim(),
        question_type: manualQuestionForm.question_type,
        difficulty_level: manualQuestionForm.difficulty_level,
        explanation: (manualQuestionForm.explanation || '').trim(),
      };
      if (needsOptions && manualQuestionForm.options?.length) {
        payload.options = manualQuestionForm.options
          .filter(o => (o.option_text || '').trim())
          .map((o, i) => ({ option_text: o.option_text.trim(), is_correct: !!o.is_correct, order: i + 1 }));
      }
      await testsService.createTestQuestion(testId, payload);
      setShowCreateQuestionModal(false);
      await fetchManualModeTestQuestions();
      await fetchTests();
    } catch (err) {
      setManualQuestionError(err.message || 'Failed to create question.');
    } finally {
      setCreatingQuestion(false);
    }
  };

  const addManualOption = () => {
    setManualQuestionForm(prev => ({
      ...prev,
      options: [...(prev.options || []), { option_text: '', is_correct: false }],
    }));
  };

  const removeManualOption = (index) => {
    setManualQuestionForm(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index),
    }));
  };

  const updateManualOption = (index, field, value) => {
    setManualQuestionForm(prev => {
      const opts = [...(prev.options || [])];
      if (!opts[index]) return prev;
      opts[index] = { ...opts[index], [field]: value };
      return { ...prev, options: opts };
    });
  };

  const openBankModal = async () => {
    setShowBankModal(true);
    setBankQuestions([]);
    setSelectedBankQuestionIds(new Set());
    const subjectId = selectedTest?._subjectId || selectedTest?.subject?.id || selectedTest?.subject?.uuid || selectedTest?.subject;
    setLoadingBankQuestions(true);
    try {
      const res = await questionsService.getQuestions(subjectId ? { subject: subjectId } : {});
      const list = res?.data ?? res ?? [];
      setBankQuestions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      setBankQuestions([]);
    } finally {
      setLoadingBankQuestions(false);
    }
  };

  const toggleBankQuestion = (qId) => {
    const id = String(qId);
    setSelectedBankQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddBankToTest = async () => {
    const ids = [...selectedBankQuestionIds];
    if (!ids.length) return;
    const testId = selectedTest?.id || selectedTest?.uuid;
    if (!testId) return;
    setAddingBankToTest(true);
    setManualQuestionError(null);
    try {
      await testsService.addTestQuestions(testId, ids);
      setShowBankModal(false);
      setSelectedBankQuestionIds(new Set());
      await fetchManualModeTestQuestions();
      await fetchTests();
    } catch (err) {
      setManualQuestionError(err.message || 'Failed to add questions to test.');
    } finally {
      setAddingBankToTest(false);
    }
  };

  const toggleGeneratedQuestionSelection = (questionId) => {
    const id = String(questionId);
    setSelectedGeneratedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllGeneratedQuestions = (selected) => {
    if (selected) {
      setSelectedGeneratedQuestionIds(new Set(generatedQuestions.map(q => String(q.id || q.uuid)).filter(Boolean)));
    } else {
      setSelectedGeneratedQuestionIds(new Set());
    }
  };

  const handleRemoveEditQuestion = async (questionId) => {
    if (!editingTest || !questionId) return;
    const testId = editingTest.id || editingTest.uuid;
    setRemovingQuestionId(questionId);
    setError(null);
    try {
      await testsService.removeTestQuestions(testId, [questionId]);
      setEditTestQuestions(prev => prev.filter(q => String(q.id || q.uuid) !== String(questionId)));
      if (editingTest.question_count != null) {
        setEditingTest(prev => prev ? { ...prev, question_count: Math.max(0, (prev.question_count ?? 0) - 1) } : null);
      }
    } catch (err) {
      console.error('Failed to remove question:', err);
      setError(err.message || 'Failed to remove question from test.');
    } finally {
      setRemovingQuestionId(null);
    }
  };

  const handleDone = async () => {
    const testId = selectedTest?.id || selectedTest?.uuid;
    const generatedIds = (generatedQuestions || []).map(q => String(q.id || q.uuid)).filter(Boolean);
    const deselectedIds = generatedIds.filter(id => !selectedGeneratedQuestionIds.has(id));
    if (testId && deselectedIds.length > 0) {
      try {
        await testsService.removeTestQuestions(testId, deselectedIds);
      } catch (err) {
        console.error('Failed to remove deselected questions:', err);
        setGenerationError(err.message || 'Failed to remove deselected questions.');
        return;
      }
    }
    setActiveTab('tests');
    setShowQuestionGenerator(false);
    setSelectedTest(null);
    setGeneratedQuestions([]);
    setSelectedGeneratedQuestionIds(new Set());
    setGenerationError(null);
    setSuccess(false);
    setSelectedSubject('');
    setSelectedModulesChapters([]);
    fetchTests();
  };

  const addModule = async (moduleId) => {
    if (!moduleId || selectedModulesChapters.some(m => m.moduleId === moduleId)) return;
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    setChaptersLoadingFor(moduleId);
    const chaptersList = await fetchChaptersForModule(moduleId);
    setChaptersLoadingFor(null);
    setSelectedModulesChapters(prev => [...prev, {
      moduleId: mod.id,
      moduleName: mod.name,
      chapterIds: [],
      chapters: chaptersList
    }]);
  };

  const removeModule = (moduleId) => {
    setSelectedModulesChapters(prev => prev.filter(m => m.moduleId !== moduleId));
  };

  const toggleChapter = (moduleId, chapterId) => {
    setSelectedModulesChapters(prev => prev.map(m => {
      if (m.moduleId !== moduleId) return m;
      const has = (m.chapterIds || []).includes(chapterId);
      return {
        ...m,
        chapterIds: has ? (m.chapterIds || []).filter(id => id !== chapterId) : [...(m.chapterIds || []), chapterId]
      };
    }));
  };

  const selectAllChapters = (moduleId, select) => {
    setSelectedModulesChapters(prev => prev.map(m => {
      if (m.moduleId !== moduleId) return m;
      return { ...m, chapterIds: select ? (m.chapters || []).map(c => c.id) : [] };
    }));
  };

  return (
    <div className="p-6 animate-fade-in bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 animate-slide-down mb-2">Tests & Quizzes</h1>
        <p className="text-gray-600">Create and manage tests for your students</p>
      </div>

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
              const testName = test.name || `${subjectName} ${className}`.trim() || 'Test';
              const scopeSummary = test.module_chapters_summary && Array.isArray(test.module_chapters_summary) && test.module_chapters_summary.length > 0
                ? test.module_chapters_summary.join(' • ')
                : (test.module_chapters && test.module_chapters.length > 0
                  ? test.module_chapters.map(mc => `${mc.module_name}: ${(mc.chapters || []).map(c => c.title).join(', ')}`).join(' • ')
                  : '');
              const questionCount = test.question_count || 0;
              
              return (
            <div 
                  key={test.id || test.uuid || index} 
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transform hover:scale-[1.01] transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {testName}
                      </h3>
                      {scopeSummary ? (
                        <p className="text-sm text-gray-500 mb-2">{scopeSummary}</p>
                      ) : null}
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
          <div className="px-8 py-6 text-white" style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}>
            <h2 className="text-3xl font-bold mb-2">
              {isEditMode ? '✏️ Edit Test' : '➕ Create New Test'}
            </h2>
            <p className="text-accent-500/50">
              {isEditMode ? 'Update the details for this test.' : 'Fill in the details below to create a new test for your students.'}
            </p>
          </div>

          <div className="p-8">
            {loadingTestForEdit ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-gray-500">
                <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
                <p className="text-lg font-medium">Loading test details...</p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
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

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <span className="text-primary-500">📚</span>
                  <span>Subject & Classes</span>
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
                      Classes <span className="text-red-500">*</span> <span className="text-gray-500 font-normal">(select one or more)</span>
                    </label>
                    {loadingClasses ? (
                      <p className="text-gray-500 text-sm">Loading classes...</p>
                    ) : (
                      <div className="border-2 border-gray-200 rounded-xl p-3 bg-white max-h-40 overflow-y-auto space-y-2">
                        {classes.map((cls) => {
                          const id = cls.id || cls.uuid;
                          const isChecked = selectedClasses.includes(id) || (selectedClass && selectedClass === id);
                          return (
                            <label key={id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                              <input
                                type="checkbox"
                                checked={!!isChecked}
                                disabled={isEditMode}
                                onChange={() => {
                                  if (isEditMode) return;
                                  const next = selectedClasses.includes(id)
                                    ? selectedClasses.filter(c => c !== id)
                                    : [...selectedClasses, id];
                                  setSelectedClasses(next);
                                  setSelectedClass(next.length === 1 ? next[0] : '');
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                              />
                              <span className="text-gray-800">{cls.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {(selectedClasses.length > 0 || selectedClass) && (
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedClasses.length || (selectedClass ? 1 : 0)} class(es) selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedSubject && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className="text-blue-500">📖</span>
                    <span>Chapters & Topics</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Add one or more chapters and select topics for each. At least one topic must be selected.</p>
                  <div className="flex flex-wrap items-end gap-3 mb-6">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Add chapter</label>
                      <select
                        id="add-module-select"
                        disabled={loadingModules}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white disabled:bg-gray-100"
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v) addModule(v);
                          e.target.value = '';
                        }}
                      >
                        <option value="">{loadingModules ? 'Loading chapters...' : 'Select chapter to add'}</option>
                        {modules
                          .filter(m => !selectedModulesChapters.some(s => s.moduleId === m.id))
                          .map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sel = document.getElementById('add-module-select');
                        if (sel?.value) addModule(sel.value);
                        if (sel) sel.value = '';
                      }}
                      className="px-4 py-3 rounded-xl font-medium text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}
                    >
                      Add chapter
                    </button>
                  </div>
                  {selectedModulesChapters.length > 0 && (
                    <div className="space-y-4">
                      {selectedModulesChapters.map(({ moduleId, moduleName, chapterIds, chapters }) => (
                        <div key={moduleId} className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-gray-800">{moduleName}</span>
                            <button
                              type="button"
                              onClick={() => removeModule(moduleId)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                            >
                              <X className="h-4 w-4" /> Remove
                            </button>
                          </div>
                          {chaptersLoadingFor === moduleId ? (
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                              <Loader2 className="h-4 w-4 animate-spin" /> Loading topics...
                            </div>
                          ) : chapters && chapters.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={(chapterIds || []).length === (chapters || []).length}
                                  onChange={(e) => selectAllChapters(moduleId, e.target.checked)}
                                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-gray-600">Select all</span>
                              </label>
                              {(chapters || []).map(ch => (
                                <label key={ch.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    checked={(chapterIds || []).includes(ch.id)}
                                    onChange={() => toggleChapter(moduleId, ch.id)}
                                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                                  />
                                  <span>{ch.title}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No topics in this chapter.</p>
                          )}
                          {(chapterIds || []).length > 0 && (
                            <p className="text-xs text-green-600 mt-2">{chapterIds.length} topic(s) selected</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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

              {isEditMode && editingTest && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className="text-green-600">📝</span>
                    <span>Questions in this test</span>
                    {(editingTest.question_count ?? editTestQuestions.length) > 0 && (
                      <span className="text-sm font-normal text-gray-500">
                        ({(editingTest.question_count ?? editTestQuestions.length)})
                      </span>
                    )}
                  </h3>
                  {loadingEditQuestions ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading questions...</span>
                    </div>
                  ) : editTestQuestions.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No questions yet. Use &quot;Generate more questions&quot; below to add questions with AI.</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {editTestQuestions.map((q, index) => {
                        const qId = q.id || q.uuid;
                        const isRemoving = removingQuestionId === qId;
                        return (
                          <div key={qId || index} className="bg-white rounded-lg border border-gray-200 p-3 flex items-start gap-3">
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-gray-800 line-clamp-2">{q.question_text}</p>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                  {q.question_type?.replace('_', ' ') || 'MCQ'}
                                </span>
                                {q.difficulty_level && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                                    {q.difficulty_level}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveEditQuestion(qId)}
                              disabled={isRemoving}
                              className="flex-shrink-0 p-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Remove question from test"
                            >
                              {isRemoving ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {isEditMode && editingTest && !loadingEditQuestions && (
                    <button
                      type="button"
                      onClick={() => {
                        const testData = editingTest;
                        testData._subjectId = testData.subject?.id || testData.subject?.uuid || testData.subject;
                        testData._moduleChapters = testData.module_chapters;
                        setSelectedTest(testData);
                        setShowQuestionGenerator(true);
                      }}
                      className="mt-4 px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate more questions
                    </button>
                  )}
                </div>
              )}

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
            )}
          </div>
        </div>
      )}

      {activeTab === 'create' && showQuestionGenerator && selectedTest && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 text-white" style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}>
            <div className="flex items-center justify-between">
          <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center space-x-2">
                  <Sparkles className="h-8 w-8" />
                  <span>{questionAddMode === 'ai' ? 'Generate Questions with AI' : 'Add Questions Manually'}</span>
                </h2>
                <p className="text-accent-500/50">
                  {questionAddMode === 'ai'
                    ? 'Use Vertex AI to automatically generate questions for your test'
                    : 'Create new questions or add existing ones from the question bank'}
            </p>
          </div>
          <button
                onClick={handleBackToForm}
                className="text-white hover:text-gray-200 transition-colors"
          >
                <X className="h-6 w-6" />
          </button>
        </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setQuestionAddMode('ai')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${questionAddMode === 'ai' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'}`}
              >
                <Sparkles className="h-4 w-4 inline mr-2" />
                Generate with AI
              </button>
              <button
                type="button"
                onClick={() => setQuestionAddMode('manual')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${questionAddMode === 'manual' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'}`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Add manually
              </button>
            </div>
          </div>

          <div className="p-8">
            {questionAddMode === 'manual' && manualQuestionError && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start space-x-3 mb-6">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{manualQuestionError}</p>
              </div>
            )}
            {questionAddMode === 'ai' && generationError && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start space-x-3 mb-6">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{generationError}</p>
          </div>
          </div>
            )}

            {questionAddMode === 'ai' && success && generatedQuestions.length > 0 && (
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

            {questionAddMode === 'ai' && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span>AI Generation Settings</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Questions will be generated with a <strong>mix of question types</strong> (MCQ single/multiple, short answer, rearrange) and a <strong>mix of difficulty levels</strong> (1–5) across all selected modules and topics.
              </p>
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
                <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="use_matplot"
                  name="use_matplot"
                  checked={aiFormData.use_matplot}
                  onChange={handleAIGenerationChange}
                  disabled={!aiFormData.add_image}
                  className="h-5 w-5 text-primary-500 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                />
                  <label htmlFor="use_matplot" className="text-sm font-medium text-gray-700">
                    Use matplotlib (Vertex Gemini code)
                  </label>
              </div>
            </div>
          </div>
            )}

            {questionAddMode === 'manual' && (
              <div className="space-y-6 mb-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={openCreateQuestionModal}
                    className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
                  >
                    <Plus className="h-4 w-4" />
                    Create new question
                  </button>
                  <button
                    type="button"
                    onClick={openBankModal}
                    className="px-4 py-2 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Add from question bank
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Questions in this test</h3>
                  {loadingManualModeQuestions ? (
                    <div className="flex items-center gap-2 text-gray-500 py-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading...
                    </div>
                  ) : manualModeTestQuestions.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No questions yet. Create one or add from the question bank.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {manualModeTestQuestions.map((q, index) => (
                        <div key={q.id || q.uuid || index} className="bg-white rounded-lg border border-gray-200 p-3 flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <p className="text-sm text-gray-800 line-clamp-2 flex-1">{q.question_text}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {q.question_type?.replace('_', ' ') || 'MCQ'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {questionAddMode === 'ai' && generatedQuestions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">Generated Questions — select which to keep</h3>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGeneratedQuestionIds.size === generatedQuestions.length}
                      onChange={(e) => selectAllGeneratedQuestions(e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span>Select all</span>
                  </label>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Deselected questions will be removed from the test and marked inactive (they will not be given to students).
                </p>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedQuestions.map((question, index) => {
                    const qId = String(question.id || question.uuid || '');
                    const isSelected = qId && selectedGeneratedQuestionIds.has(qId);
                    return (
                      <div
                        key={question.id || index}
                        className={`rounded-lg p-4 border-2 transition-colors ${isSelected ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-300 opacity-75'}`}
                      >
                        <div className="flex items-start gap-3">
                          <label className="flex-shrink-0 mt-0.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleGeneratedQuestionSelection(question.id || question.uuid)}
                              className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                            />
                          </label>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                              <span className="text-sm font-semibold text-gray-600">Question {index + 1}</span>
                              <div className="flex items-center gap-2">
                                {question.level != null && (
                                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded">
                                    Level {question.level}
                                  </span>
                                )}
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                  {question.question_type?.replace('_', ' ') || 'MCQ'}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-800 mb-2">{question.question_text}</p>
                            {question.image && (
                              <div className="mb-2">
                                <img
                                  src={question.image}
                                  alt="Question illustration"
                                  className="max-w-full max-h-48 rounded-lg border border-gray-200 object-contain"
                                />
                              </div>
                            )}
                            {question.options && question.options.length > 0 && (
                              <div className="ml-0 space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className={`text-sm ${option.is_correct ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                                    {option.is_correct && '✓ '}
                                    {option.option_text}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedGeneratedQuestionIds.size} of {generatedQuestions.length} selected to keep in test.
                </p>
              </div>
            )}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            {questionAddMode === 'manual' ? (
              <button
                type="button"
                onClick={handleDone}
                className="px-8 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Done</span>
              </button>
            ) : generatedQuestions.length > 0 ? (
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

      {showCreateQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !creatingQuestion && setShowCreateQuestionModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Create new question</h3>
              <button type="button" onClick={() => !creatingQuestion && setShowCreateQuestionModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateQuestionSubmit} className="p-6 space-y-4">
              {manualQuestionError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{manualQuestionError}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Question text <span className="text-red-500">*</span></label>
                <textarea
                  value={manualQuestionForm.question_text}
                  onChange={e => setManualQuestionForm(prev => ({ ...prev, question_text: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter the question..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                  <select
                    value={manualQuestionForm.question_type}
                    onChange={e => setManualQuestionForm(prev => ({ ...prev, question_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="mcq_single">MCQ (Single)</option>
                    <option value="mcq_multiple">MCQ (Multiple)</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="rearrange">Rearrange</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={manualQuestionForm.difficulty_level}
                    onChange={e => setManualQuestionForm(prev => ({ ...prev, difficulty_level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Explanation (optional)</label>
                <textarea
                  value={manualQuestionForm.explanation}
                  onChange={e => setManualQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Explanation for the correct answer"
                />
              </div>
              {['mcq_single', 'mcq_multiple'].includes(manualQuestionForm.question_type) && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Options <span className="text-red-500">*</span></label>
                    <button type="button" onClick={addManualOption} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Add option</button>
                  </div>
                  <div className="space-y-2">
                    {(manualQuestionForm.options || []).map((opt, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={opt.option_text}
                          onChange={e => updateManualOption(index, 'option_text', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder={`Option ${index + 1}`}
                        />
                        <label className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={!!opt.is_correct}
                            onChange={e => updateManualOption(index, 'is_correct', e.target.checked)}
                            className="rounded border-gray-300 text-primary-500"
                          />
                          Correct
                        </label>
                        <button type="button" onClick={() => removeManualOption(index)} disabled={(manualQuestionForm.options || []).length <= 2} className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => !creatingQuestion && setShowCreateQuestionModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={creatingQuestion} className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                  {creatingQuestion ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Creating...</> : 'Add to test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !addingBankToTest && setShowBankModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Add from question bank</h3>
              <button type="button" onClick={() => !addingBankToTest && setShowBankModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {loadingBankQuestions ? (
                <div className="flex items-center justify-center py-12 gap-2 text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Loading questions...
                </div>
              ) : bankQuestions.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">No questions found. Create questions first or try another subject.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {bankQuestions.map((q, index) => {
                    const qId = String(q.id || q.uuid || '');
                    const isSelected = selectedBankQuestionIds.has(qId);
                    return (
                      <div
                        key={qId || index}
                        className={`rounded-lg p-3 border-2 cursor-pointer transition-colors ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => toggleBankQuestion(qId)}
                      >
                        <div className="flex items-start gap-2">
                          <input type="checkbox" checked={isSelected} onChange={() => toggleBankQuestion(qId)} className="mt-1 rounded border-gray-300 text-primary-500" />
                          <p className="text-sm text-gray-800 line-clamp-2 flex-1">{q.question_text}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 flex-shrink-0">{q.question_type?.replace('_', ' ') || 'MCQ'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-600">{selectedBankQuestionIds.size} selected</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => !addingBankToTest && setShowBankModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={handleAddBankToTest} disabled={addingBankToTest || selectedBankQuestionIds.size === 0} className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}>
                  {addingBankToTest ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Adding...</> : 'Add selected to test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestsQuizzes;
