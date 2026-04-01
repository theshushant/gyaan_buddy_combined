import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Trash2,
  Edit,
  BarChart3,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Brain,
  Zap,
  RefreshCw,
  Save,
  Check,
  Square,
  CheckSquare
} from 'lucide-react';
import modulesService from '../services/modulesService';
import subjectsService from '../services/subjectsService';
import classesService from '../services/classesService';
import questionsService from '../services/questionsService';
import aiService from '../services/aiService';
import CreateModuleModal from '../components/CreateModuleModal';
import CreateTopicModal from '../components/CreateTopicModal';
import SuccessModal from '../components/SuccessModal';

const ModulesAssignments = () => {
  const [expandedChapters, setExpandedChapters] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [allModulesData, setAllModulesData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateChapterModal, setShowCreateChapterModal] = useState(false);
  const [selectedModuleForChapter, setSelectedModuleForChapter] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
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
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [selectedChapterForAI, setSelectedChapterForAI] = useState(null);
  const [selectedModuleForQuestion, setSelectedModuleForQuestion] = useState(null);
  const [chaptersLoadingForModuleId, setChaptersLoadingForModuleId] = useState(null);
  const [togglingDueKey, setTogglingDueKey] = useState(null);
  const [dueDatePickerFor, setDueDatePickerFor] = useState(null); // { type: 'module'|'chapter', id, parentId?, anchor: { left, top, bottom } }
  const [updatingDueDateKey, setUpdatingDueDateKey] = useState(null);

  // PDF upload state
  const [pdfModalChapter, setPdfModalChapter] = useState(null);
  const [chapterPdfs, setChapterPdfs] = useState({});
  const [pdfLoadingFor, setPdfLoadingFor] = useState(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfDeletingId, setPdfDeletingId] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const pdfInputRef = useRef(null);

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleOpenPdfModal = async (chapter) => {
    setPdfModalChapter(chapter);
    setPdfError(null);
    if (!chapterPdfs[chapter.id]) {
      setPdfLoadingFor(chapter.id);
      try {
        const res = await modulesService.listChapterPdfs(chapter.id);
        const pdfs = (res?.data || []).flatMap(g => g.pdfs || []);
        setChapterPdfs(prev => ({ ...prev, [chapter.id]: pdfs }));
      } catch (err) {
        setPdfError(err.message);
      } finally {
        setPdfLoadingFor(null);
      }
    }
  };

  const handleClosePdfModal = () => {
    setPdfModalChapter(null);
    setPdfError(null);
  };

  const handlePdfFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !pdfModalChapter) return;
    e.target.value = '';
    const currentPdfs = chapterPdfs[pdfModalChapter.id] || [];
    if (currentPdfs.length >= 2) return;
    setPdfUploading(true);
    setPdfError(null);
    try {
      await modulesService.uploadChapterPdf(pdfModalChapter.id, file);
      const res = await modulesService.listChapterPdfs(pdfModalChapter.id);
      const pdfs = (res?.data || []).flatMap(g => g.pdfs || []);
      setChapterPdfs(prev => ({ ...prev, [pdfModalChapter.id]: pdfs }));
    } catch (err) {
      setPdfError(err.message);
    } finally {
      setPdfUploading(false);
    }
  };

  const handleDeletePdf = async (pdfId) => {
    setPdfDeletingId(pdfId);
    setPdfError(null);
    try {
      await modulesService.deleteChapterPdf(pdfId);
      setChapterPdfs(prev => ({
        ...prev,
        [pdfModalChapter.id]: (prev[pdfModalChapter.id] || []).filter(p => p.id !== pdfId),
      }));
    } catch (err) {
      setPdfError(err.message);
    } finally {
      setPdfDeletingId(null);
    }
  };

  const loadChaptersForModule = useCallback(async (moduleId) => {
    setChaptersLoadingForModuleId(moduleId);
    try {
      const chaptersResponse = await modulesService.getModuleChapters(moduleId);
      const chaptersData = chaptersResponse.data || chaptersResponse;
      const chaptersList = Array.isArray(chaptersData) ? chaptersData : [];

      setAllModulesData(prev => {
        const entry = prev.find(m => m.id === moduleId);
        if (entry && entry.modules !== undefined) return prev;
        return prev.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            modules: chaptersList.map((chapter, idx) => ({
              id: chapter.id,
              title: chapter.title || `Assignment ${idx + 1}`,
              isDue: chapter.is_due === true,
              dueDate: chapter.due_date || null
            }))
          };
        });
      });
    } catch (err) {
      console.error(`Error fetching chapters for module ${moduleId}:`, err);
      setAllModulesData(prev => prev.map(m => {
        if (m.id !== moduleId) return m;
        return { ...m, modules: [] };
      }));
    } finally {
      setChaptersLoadingForModuleId(null);
    }
  }, []);

  useEffect(() => {
    expandedChapters.forEach(moduleId => {
      const moduleEntry = allModulesData.find(m => m.id === moduleId);
      if (moduleEntry && moduleEntry.modules === undefined) {
        loadChaptersForModule(moduleId);
      }
    });
  }, [expandedChapters, allModulesData, loadChaptersForModule]);

  const fetchAllModulesData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = selectedClass ? { class: selectedClass } : {};
      const modulesResponse = await modulesService.getModules(filters);
      const modulesData = modulesResponse.data || modulesResponse;
      const modulesList = Array.isArray(modulesData) ? modulesData : [];

      const modulesWithoutChapters = modulesList.map((module) => ({
        id: module.id,
        subjectId: module.subject || module.subject_id || module.subject?.id,
        title: module.name || `Chapter ${module.order}`,
        completionRate: module.total_chapter_count > 0
          ? Math.round((module.due_chapter_count / module.total_chapter_count) * 100)
          : 0,
        isDue: module.is_due === true || module.status === 'due',
        dueDate: module.due_date || null,
        name: module.name,
        description: module.description || '',
        order: module.order || 1,
        is_active: module.is_active !== undefined ? module.is_active : true,
        is_enabled: module.is_enabled !== undefined ? module.is_enabled : false,
        subject: module.subject || module.subject_id || module.subject?.id,
        class_instance: module.class_instance || '',
        logo: module.logo || null,
        total_chapter_count: module.total_chapter_count ?? module.chapter_count ?? 0,
        due_chapter_count: module.due_chapter_count ?? 0,
        modules: undefined
      }));

      setAllModulesData(modulesWithoutChapters);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err.message || 'Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  const prevSubjectRef = useRef(selectedSubject);

  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      prevSubjectRef.current = selectedSubject;
      return;
    }

    const filteredModules = allModulesData.filter(module => {
      const moduleSubjectId = module.subjectId?.toString() || '';
      const selectedSubjectId = selectedSubject.toString();
      return moduleSubjectId === selectedSubjectId;
    });

    setChapters(filteredModules);
    const subjectChanged = prevSubjectRef.current !== selectedSubject;
    prevSubjectRef.current = selectedSubject;
    if (subjectChanged && filteredModules.length > 0) {
      setExpandedChapters([filteredModules[0].id]);
    }
  }, [selectedSubject, allModulesData]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [subjectsResponse, classesResponse] = await Promise.all([
          subjectsService.getSubjects(),
          classesService.getClasses(),
        ]);

        const subjectsData = subjectsResponse.data || subjectsResponse;
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        if (subjectsData.length > 0 && !selectedSubject) {
          setSelectedSubject(subjectsData[0].id);
        }

        const classesData = classesResponse.data || classesResponse;
        const classesList = Array.isArray(classesData) ? classesData : [];
        setClasses(classesList);
        if (classesList.length > 0) {
          setSelectedClass(classesList[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAllModulesData();
  }, [fetchAllModulesData]);

  const handleCreateModule = async (moduleData) => {
    setCreatingModule(true);
    setCreateError(null);

    try {
      if (editingModule) {
        await modulesService.updateModule(editingModule.id, moduleData);
        setShowCreateModal(false);
        setEditingModule(null);
        setSuccessData({
          title: 'Chapter Updated Successfully',
          message: `Chapter "${moduleData.name}" has been updated successfully.`
        });
      } else {
        await modulesService.createModule(moduleData);
        setShowCreateModal(false);
        setSuccessData({
          title: 'Chapter Created Successfully',
          message: `Chapter "${moduleData.name}" has been created successfully.`
        });
      }
      setShowSuccessModal(true);
      await fetchAllModulesData();
    } catch (err) {
      console.error('Error saving module:', err);
      setCreateError(err.responseData || err.message || `Failed to ${editingModule ? 'update' : 'create'} chapter. Please try again.`);
    } finally {
      setCreatingModule(false);
    }
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setShowCreateModal(true);
    setCreateError(null);
  };

  const handleDeleteModule = async (module) => {
    if (!window.confirm(`Delete module "${module.title || module.name}"? This will remove the module and all its assignments.`)) return;
    try {
      await modulesService.deleteModule(module.id);
      setExpandedChapters(prev => prev.filter(id => id !== module.id));
      await fetchAllModulesData();
      setSuccessData({ title: 'Module deleted', message: 'Module has been deleted successfully.' });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error deleting module:', err);
      setCreateError(err.message || 'Failed to delete module.');
    }
  };

  const handleDeleteChapter = async (assignment, parentModule) => {
    if (!window.confirm(`Delete assignment "${assignment.title}"?`)) return;
    try {
      await modulesService.deleteChapter(assignment.id);
      setAllModulesData(prev => prev.map(m => {
        if (m.id !== parentModule.id || !Array.isArray(m.modules)) return m;
        return { ...m, modules: m.modules.filter(ch => ch.id !== assignment.id) };
      }));
      setSuccessData({ title: 'Assignment deleted', message: 'Assignment has been deleted successfully.' });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setCreateChapterError(err.message || 'Failed to delete assignment.');
    }
  };

  const handleDeleteQuestion = async (question) => {
    if (!window.confirm(`Delete this question?`)) return;
    try {
      await questionsService.deleteQuestion(question.id);
      setChapterQuestions(prev => prev.filter(q => q.id !== question.id));
      setSuccessData({ title: 'Question deleted', message: 'Question has been deleted successfully.' });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error deleting question:', err);
      setCreateQuestionError(err.message || 'Failed to delete question.');
    }
  };

  const handleCreateChapter = async (chapterData) => {
    if (!selectedModuleForChapter && !editingChapter) {
      setCreateChapterError('No chapter selected');
      return;
    }

    setCreatingChapter(true);
    setCreateChapterError(null);

    try {
      if (editingChapter) {
        const response = await modulesService.updateChapter(editingChapter.id, chapterData);
        const successMessage = response?.message || `Assignment "${chapterData.title}" has been updated successfully.`;
        
        setShowCreateChapterModal(false);
        setEditingChapter(null);
        setSelectedModuleForChapter(null);
        setSuccessData({
          title: 'Assignment Updated Successfully',
          message: successMessage
        });
      } else {
        const response = await modulesService.createChapter(selectedModuleForChapter.id, chapterData);
        const successMessage = response?.message || `Assignment "${chapterData.title}" has been created successfully.`;
        
        setShowCreateChapterModal(false);
        setSelectedModuleForChapter(null);
        setSuccessData({
          title: 'Assignment Created Successfully',
          message: successMessage
        });
      }
      setShowSuccessModal(true);
      await fetchAllModulesData();
    } catch (err) {
      console.error(`Error ${editingChapter ? 'updating' : 'creating'} chapter:`, err);
      let errorMessage = `Failed to ${editingChapter ? 'update' : 'create'} assignment. Please try again.`;
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
    setEditingChapter(null);
    setShowCreateChapterModal(true);
    setCreateChapterError(null);
  };

  const handleToggleModuleDue = async (module, newDueStatus) => {
    const key = `module-${module.id}`;
    setTogglingDueKey(key);
    try {
      await modulesService.setModuleDue(module.id, newDueStatus);
      const today = new Date().toISOString().slice(0, 10);
      setAllModulesData(prev => prev.map(m =>
        m.id === module.id ? { ...m, isDue: newDueStatus, dueDate: newDueStatus ? today : null } : m
      ));
    } catch (err) {
      console.error('Error updating module due status:', err);
      setCreateChapterError(err.message || 'Failed to update due status.');
    } finally {
      setTogglingDueKey(null);
    }
  };

  const handleToggleChapterDue = async (chapter, parentModule, newDueStatus) => {
    const key = `chapter-${chapter.id}`;
    setTogglingDueKey(key);
    try {
      await modulesService.setChapterDue(chapter.id, newDueStatus);
      setAllModulesData(prev => prev.map(m => {
        if (m.id !== parentModule.id || !Array.isArray(m.modules)) return m;
        return {
          ...m,
          modules: m.modules.map(ch =>
            ch.id === chapter.id ? { ...ch, isDue: newDueStatus, dueDate: newDueStatus ? new Date().toISOString().slice(0, 10) : null } : ch
          )
        };
      }));
    } catch (err) {
      console.error('Error updating assignment due status:', err);
      setCreateChapterError(err.message || 'Failed to update due status.');
    } finally {
      setTogglingDueKey(null);
    }
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleUpdateModuleDueDate = async (module, newDate) => {
    const key = `module-${module.id}`;
    setUpdatingDueDateKey(key);
    setDueDatePickerFor(null);
    try {
      await modulesService.updateModuleDueDate(module.id, newDate || null);
      setAllModulesData(prev => prev.map(m =>
        m.id === module.id ? { ...m, dueDate: newDate || null, isDue: !!newDate } : m
      ));
    } catch (err) {
      console.error('Error updating module due date:', err);
      setCreateChapterError(err.message || 'Failed to update due date.');
    } finally {
      setUpdatingDueDateKey(null);
    }
  };

  const handleUpdateChapterDueDate = async (chapter, parentModule, newDate) => {
    const key = `chapter-${chapter.id}`;
    setUpdatingDueDateKey(key);
    setDueDatePickerFor(null);
    try {
      await modulesService.updateChapterDueDate(chapter.id, newDate || null);
      setAllModulesData(prev => prev.map(m => {
        if (m.id !== parentModule.id || !Array.isArray(m.modules)) return m;
        return {
          ...m,
          modules: m.modules.map(ch =>
            ch.id === chapter.id ? { ...ch, dueDate: newDate || null, isDue: !!newDate } : ch
          )
        };
      }));
    } catch (err) {
      console.error('Error updating assignment due date:', err);
      setCreateChapterError(err.message || 'Failed to update due date.');
    } finally {
      setUpdatingDueDateKey(null);
    }
  };

  const handleEditChapter = async (chapter, module) => {
    try {
      const response = await modulesService.getModuleChapters(module.id);
      const chaptersData = response.data || response;
      const chaptersList = Array.isArray(chaptersData) ? chaptersData : [];
      const fullChapterData = chaptersList.find(ch => ch.id === chapter.id);
      
      if (fullChapterData) {
        setEditingChapter(fullChapterData);
        setSelectedModuleForChapter(module);
        setShowCreateChapterModal(true);
        setCreateChapterError(null);
      } else {
        console.error('Assignment not found');
        setCreateChapterError('Assignment data not found. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching assignment data:', err);
      setCreateChapterError('Failed to load assignment data. Please try again.');
    }
  };

  const handleViewQuestions = async (chapter) => {
    setSelectedChapterForQuestion(chapter);
    setLoadingQuestions(true);
    setChapterQuestions([]);
    setShowViewQuestionsModal(true);
    setEditingQuestion(null);

    try {
      const response = await modulesService.getChapterModuleContent(chapter.id);
      const contentData = response.data || response;
      const contentList = Array.isArray(contentData) ? contentData : [];
      
      const questions = contentList
        .filter(content => content.content_type === 'question' && content.question)
        .map(content => ({
          ...content.question,
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

  const handleCreateQuestion = (chapter, parentModule = null) => {
    setSelectedChapterForQuestion(chapter);
    setSelectedModuleForQuestion(parentModule);
    setEditingQuestion(null);
    setShowCreateQuestionModal(true);
    setCreateQuestionError(null);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    if (!selectedChapterForQuestion && question.chapter_id) {
      setSelectedChapterForQuestion({ id: question.chapter_id, title: question.chapter_title || '' });
    }
    setShowCreateQuestionModal(true);
    setCreateQuestionError(null);
  };

  const handleOpenAIGenerate = () => {
    setSelectedChapterForAI({
      chapter: selectedChapterForQuestion,
      module: selectedModuleForQuestion
    });
    setShowCreateQuestionModal(false);
    setShowAIGenerateModal(true);
  };

  const handleSaveQuestion = async (questionData) => {
    if (!editingQuestion && !selectedChapterForQuestion) {
      setCreateQuestionError('No topic selected');
      return;
    }

    setCreatingQuestion(true);
    setCreateQuestionError(null);

    try {
      const { options, image, ...questionPayload } = questionData;

      let dataToSend;
      const needsFormData = image instanceof File || questionPayload.remove_image;
      const isMCQ = ['mcq_single', 'mcq_multiple', 'rearrange'].includes(questionPayload.question_type);
      
      if (needsFormData) {
        dataToSend = new FormData();
        Object.keys(questionPayload).forEach(key => {
          if (key !== 'remove_image' && questionPayload[key] !== null && questionPayload[key] !== undefined) {
            const value = questionPayload[key];
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
        
        if (selectedChapterForQuestion?.id) {
          dataToSend.append('chapter_id', selectedChapterForQuestion.id);
        }
        
        if (isMCQ && options && Array.isArray(options) && options.length > 0) {
          const validOptions = options
            .filter(opt => opt.option_text && opt.option_text.trim() !== '')
            .map((opt, idx) => ({
              option_text: opt.option_text.trim(),
              is_correct: opt.is_correct || false,
              order: opt.order || idx + 1,
            }));
          if (validOptions.length > 0) {
            dataToSend.append('options', JSON.stringify(validOptions));
          }
        }
        
        if (image instanceof File) {
          dataToSend.append('image', image);
        } else if (questionPayload.remove_image) {
          dataToSend.append('image', '');
        }
      } else {
        dataToSend = { ...questionPayload };
        
        if (selectedChapterForQuestion?.id) {
          dataToSend.chapter_id = selectedChapterForQuestion.id;
        }
        
        if (isMCQ && options && Array.isArray(options) && options.length > 0) {
          const validOptions = options
            .filter(opt => opt.option_text && opt.option_text.trim() !== '')
            .map((opt, idx) => ({
              option_text: opt.option_text.trim(),
              is_correct: opt.is_correct || false,
              order: opt.order || idx + 1,
            }));
          if (validOptions.length > 0) {
            dataToSend.options = validOptions;
          }
        }
      }

      if (editingQuestion) {
        const questionId = editingQuestion.id;
        const updateResponse = await questionsService.updateQuestion(questionId, dataToSend);
        const updateData = updateResponse.data || updateResponse;
        const optionErrors = updateData?.option_errors;

        setShowCreateQuestionModal(false);
        setEditingQuestion(null);
        setSelectedChapterForQuestion(null);
        setSuccessData({
          title: 'Question Updated Successfully',
          message: optionErrors?.length
            ? `Question updated, but some options failed to save: ${optionErrors.join('; ')}`
            : 'Question has been updated successfully.'
        });
        setShowSuccessModal(true);
        if (showViewQuestionsModal) {
          await handleViewQuestions(selectedChapterForQuestion);
        }
      } else {
        const questionResponse = await questionsService.createQuestion(dataToSend);
        const questionId = questionResponse.data?.id || questionResponse.id;
        const optionErrors = questionResponse.data?.option_errors;

        if (!questionId) {
          throw new Error('Failed to get question ID from response');
        }

        setShowCreateQuestionModal(false);
        setSelectedChapterForQuestion(null);
        setSuccessData({
          title: 'Question Created Successfully',
          message: optionErrors?.length
            ? `Question created, but some options failed to save: ${optionErrors.join('; ')}`
            : 'Question has been created and added to the assignment successfully.'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gradient-start/10 to-gradient-end/10">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div 
                className="p-3 rounded-2xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}
              >
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Chapters & Assignments
                </h1>
                <p className="text-gray-600 mt-1">Manage your learning chapters and assignments</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Chapters</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{chapters.length}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <FileText className="h-6 w-6 text-primary-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {chapters.reduce((sum, ch) => sum + (ch.total_chapter_count || 0), 0)}
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <span>Filter by Class</span>
              </label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-56 px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white appearance-none cursor-pointer hover:border-gray-300"
                >
                  <option value="">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <span>Filter by Subject</span>
              </label>
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-56 px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white appearance-none cursor-pointer hover:border-gray-300"
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
            <div>
              <button
                onClick={() => {
                  if (!selectedSubject) {
                    alert('Please select a subject first');
                    return;
                  }
                  setEditingModule(null);
                  setShowCreateModal(true);
                  setCreateError(null);
                }}
                className="flex items-center space-x-2 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}
                disabled={!selectedSubject}
              >
                <Plus className="h-5 w-5" />
                <span>Create Chapter</span>
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-500"></div>
              <Loader2 className="h-8 w-8 text-primary-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
            </div>
            <p className="text-gray-600 mt-4 font-medium">Loading modules...</p>
          </div>
        )}

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
                      className="inline-flex items-center space-x-2 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}
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
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-2 rounded-lg transition-colors ${
                          expandedChapters.includes(chapter.id) 
                            ? 'bg-primary-100 text-primary-500' 
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
                              <div className="flex items-center space-x-1 px-3 py-1 bg-primary-50 rounded-full">
                                <TrendingUp className="h-4 w-4 text-primary-500" />
                                <span className="text-sm font-semibold text-primary-500">
                                  {chapter.completionRate}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {`${chapter.total_chapter_count ?? 0} ${(chapter.total_chapter_count ?? 0) === 1 ? 'assignment' : 'assignments'}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPdfModal(chapter);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            PDF{chapterPdfs[chapter.id] ? ` (${chapterPdfs[chapter.id].length}/2)` : ''}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditModule(chapter);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md" style={{ backgroundColor: '#00167a' }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(chapter);
                          }}
                          className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Due</span>
                            <button
                              type="button"
                              disabled={togglingDueKey === `module-${chapter.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleModuleDue(chapter, !chapter.isDue);
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 disabled:opacity-60 disabled:pointer-events-none ${
                                chapter.isDue ? '' : 'bg-gray-300'
                              }`}
                              style={chapter.isDue ? { backgroundColor: '#00167a' } : {}}
                            >
                              {togglingDueKey === `module-${chapter.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin text-white mx-1" />
                              ) : (
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                    chapter.isDue ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedChapters.includes(chapter.id) && (
                    <div className="border-t border-gray-200 bg-gray-50/50 p-6 space-y-3 animate-slide-down">
                      {(chaptersLoadingForModuleId === chapter.id || chapter.modules === undefined) ? (
                        <div className="flex items-center justify-center py-8 text-gray-500">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading assignments...</span>
                        </div>
                      ) : chapter.modules.length > 0 ? (
                        chapter.modules.map((module, moduleIndex) => (
                          <div 
                            key={module.id} 
                            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                  <FileText className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{module.title}</h4>
                                  <p className="text-xs text-gray-500">Assignment {moduleIndex + 1}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setDueDatePickerFor(prev => prev?.type === 'chapter' && prev?.id === module.id ? null : { type: 'chapter', id: module.id, parentId: chapter.id, anchor: { left: rect.left, top: rect.top, bottom: rect.bottom } });
                                  }}
                                  className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                  title={module.dueDate ? `Due ${formatDueDate(module.dueDate)}` : 'Set due date'}
                                >
                                  <Calendar className="h-4 w-4" />
                                </button>
                                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                                  <span className="text-sm text-gray-600">Due</span>
                                  <button
                                    type="button"
                                    disabled={togglingDueKey === `chapter-${module.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleChapterDue(module, chapter, !module.isDue);
                                    }}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 disabled:opacity-60 disabled:pointer-events-none ${
                                      module.isDue ? '' : 'bg-gray-300'
                                    }`}
                                    style={module.isDue ? { backgroundColor: '#00167a' } : {}}
                                  >
                                    {togglingDueKey === `chapter-${module.id}` ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-white mx-1" />
                                    ) : (
                                      <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                          module.isDue ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                      />
                                    )}
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleEditChapter(module, chapter)}
                                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md" style={{ backgroundColor: '#00167a' }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="text-sm font-medium">Learn Mode</span>
                                </button>
                                <button
                                  onClick={() => handleViewQuestions(module)}
                                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="text-sm font-medium">View</span>
                                </button>
                                <button
                                  onClick={() => handleCreateQuestion(module, chapter)}
                                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span className="text-sm font-medium">Question</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChapter(module, chapter);
                                  }}
                                  className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <p>No assignments in this module yet.</p>
                        </div>
                      )}
                      <div className="pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleAddChapter(chapter)}
                          className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Add Assignment</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

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
            selectedClass={editingModule ? null : selectedClass}
            classes={classes}
            moduleData={editingModule}
          />
        )}

        {showCreateChapterModal && (
          <CreateTopicModal
            isOpen={showCreateChapterModal}
            onClose={() => {
              setShowCreateChapterModal(false);
              setSelectedModuleForChapter(null);
              setEditingChapter(null);
              setCreateChapterError(null);
            }}
            onSave={handleCreateChapter}
            loading={creatingChapter}
            error={createChapterError}
            selectedModule={selectedModuleForChapter}
            chapterData={editingChapter}
          />
        )}

        {/* PDF Upload Modal */}
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handlePdfFileSelected}
        />
        {pdfModalChapter && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClosePdfModal} />
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Chapter PDFs</h2>
                        <p className="text-sm text-orange-100 mt-0.5 truncate max-w-xs">{pdfModalChapter.title}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClosePdfModal}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {pdfLoadingFor === pdfModalChapter.id ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-6">
                        {(chapterPdfs[pdfModalChapter.id] || []).length === 0 ? (
                          <p className="text-center text-gray-500 py-6 text-sm">No PDFs uploaded yet.</p>
                        ) : (
                          (chapterPdfs[pdfModalChapter.id] || []).map(pdf => {
                            const statusColors = {
                              COMPLETED: 'bg-green-100 text-green-700',
                              PENDING: 'bg-yellow-100 text-yellow-700',
                              PROCESSING: 'bg-blue-100 text-blue-700',
                              FAILED: 'bg-red-100 text-red-700',
                            };
                            return (
                              <div key={pdf.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <div className="p-2 bg-orange-100 rounded-lg shrink-0">
                                    <FileText className="h-4 w-4 text-orange-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">{pdf.file_name}</p>
                                    <div className="flex items-center space-x-2 mt-0.5">
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[pdf.embedding_status] || 'bg-gray-100 text-gray-600'}`}>
                                        {pdf.embedding_status}
                                      </span>
                                      {pdf.total_pages && (
                                        <span className="text-xs text-gray-400">{pdf.total_pages} pages</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeletePdf(pdf.id)}
                                  disabled={pdfDeletingId === pdf.id}
                                  className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                                >
                                  {pdfDeletingId === pdf.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {(chapterPdfs[pdfModalChapter.id] || []).length >= 2 && (
                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-center">
                          Maximum 2 PDFs reached. Delete one to upload a new file.
                        </p>
                      )}

                      {pdfError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{pdfError}</p>
                      )}

                      <button
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={(chapterPdfs[pdfModalChapter.id] || []).length >= 2 || pdfUploading}
                        className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                      >
                        {pdfUploading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5" />
                            <span>Upload PDF</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showViewQuestionsModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
              setShowViewQuestionsModal(false);
              setSelectedChapterForQuestion(null);
              setChapterQuestions([]);
            }} />
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
                          {selectedChapterForQuestion?.title || 'Assignment'}
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
                      <p className="text-gray-600 mb-6">This assignment doesn't have any questions yet.</p>
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
                              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
                                <span className="text-sm font-bold text-primary-500">Q{index + 1}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 text-xs font-semibold bg-primary-100 text-primary-800 rounded-full">
                                  {question.question_type?.replace('_', ' ').toUpperCase() || 'MCQ'}
                                </span>
                                <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full capitalize">
                                  {question.difficulty_level || 'Medium'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditQuestion(question)}
                                className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md" style={{ backgroundColor: '#00167a' }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="text-sm font-medium">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(question)}
                                className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
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

        {showCreateQuestionModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
              setShowCreateQuestionModal(false);
              setSelectedChapterForQuestion(null);
              setCreateQuestionError(null);
            }} />
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div 
                  className="px-8 py-6"
                  style={{ background: editingQuestion ? 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' : 'linear-gradient(135deg, #16a34a 0%, #059669 100%)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        {editingQuestion ? <Edit className="h-6 w-6 text-white" /> : <Plus className="h-6 w-6 text-white" />}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {editingQuestion ? 'Edit Question' : 'Create Question'}
                        </h2>
                        <p className={`text-sm mt-0.5 ${editingQuestion ? 'text-accent-500/50' : 'text-green-100'}`}>
                          {selectedChapterForQuestion?.title || 'Assignment'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {!editingQuestion && (
                        <button
                          onClick={handleOpenAIGenerate}
                          className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg backdrop-blur-sm transition-all duration-200"
                        >
                          <Brain className="h-5 w-5" />
                          <span>Generate with AI</span>
                        </button>
                      )}
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
                </div>
                
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

        {showSuccessModal && (
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title={successData.title}
            message={successData.message}
          />
        )}

        {showAIGenerateModal && (
          <AIGenerateModal
            isOpen={showAIGenerateModal}
            onClose={() => {
              setShowAIGenerateModal(false);
              setSelectedChapterForAI(null);
            }}
            chapter={selectedChapterForAI}
            onSuccess={() => {
              setShowAIGenerateModal(false);
              setSelectedChapterForAI(null);
              setSuccessData({
                title: 'Questions Generated Successfully',
                message: 'AI-generated questions have been added to the assignment successfully.'
              });
              setShowSuccessModal(true);
              fetchAllModulesData();
            }}
          />
        )}

        {dueDatePickerFor?.anchor && createPortal(
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setDueDatePickerFor(null)}
          >
            <div
              className="fixed z-[101] bg-white border border-gray-200 rounded-lg shadow-xl p-3 flex flex-col gap-2 min-w-[220px]"
              style={{
                left: dueDatePickerFor.anchor.left,
                top: dueDatePickerFor.anchor.bottom + 6,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <label className="text-xs font-semibold text-gray-600">Due date</label>
              <input
                type="date"
                defaultValue={
                  dueDatePickerFor.type === 'module'
                    ? (allModulesData.find(m => m.id === dueDatePickerFor.id)?.dueDate || '')
                    : (() => {
                        const parent = allModulesData.find(m => m.id === dueDatePickerFor.parentId);
                        return parent?.modules?.find(m => m.id === dueDatePickerFor.id)?.dueDate || '';
                      })()
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                onChange={(e) => {
                  const v = e.target.value || null;
                  if (!v) return;
                  if (dueDatePickerFor.type === 'module') {
                    const chapter = allModulesData.find(m => m.id === dueDatePickerFor.id);
                    if (chapter) handleUpdateModuleDueDate(chapter, v);
                  } else {
                    const parentModule = allModulesData.find(m => m.id === dueDatePickerFor.parentId);
                    const assignment = parentModule?.modules?.find(m => m.id === dueDatePickerFor.id);
                    if (assignment && parentModule) handleUpdateChapterDueDate(assignment, parentModule, v);
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (dueDatePickerFor.type === 'module') {
                      const chapter = allModulesData.find(m => m.id === dueDatePickerFor.id);
                      if (chapter) handleUpdateModuleDueDate(chapter, null);
                    } else {
                      const parentModule = allModulesData.find(m => m.id === dueDatePickerFor.parentId);
                      const assignment = parentModule?.modules?.find(m => m.id === dueDatePickerFor.id);
                      if (assignment && parentModule) handleUpdateChapterDueDate(assignment, parentModule, null);
                    }
                    setDueDatePickerFor(null);
                  }}
                  className="flex-1 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setDueDatePickerFor(null)}
                  className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

const AIGenerateModal = ({ isOpen, onClose, chapter: chapterData, onSuccess }) => {
  const chapter = chapterData?.chapter;
  const parentModule = chapterData?.module;

  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState(['mcq_single']);
  const [addImage, setAddImage] = useState(false);
  const [useMatplot, setUseMatplot] = useState(false);
  const [aiProvider, setAiProvider] = useState('assessment');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [chapterId, setChapterId] = useState(null);
  const [assessmentSessionId, setAssessmentSessionId] = useState(null);
  const [modifyingQuestionId, setModifyingQuestionId] = useState(null);
  const [modifyType, setModifyType] = useState('CUSTOM');
  const [modifyInstruction, setModifyInstruction] = useState('');
  const [modifying, setModifying] = useState(false);
  const [modifyError, setModifyError] = useState(null);

  const questionTypeOptions = [
    { value: 'mcq_single', label: 'MCQ - Single Correct' },
    { value: 'mcq_multiple', label: 'MCQ - Multiple Correct' },
    { value: 'rearrange', label: 'Re-arrange' },
  ];

  const toggleQuestionType = (value) => {
    setSelectedQuestionTypes(prev => {
      const next = prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value];
      return next.length > 0 ? next : ['mcq_single'];
    });
  };

  const handleGenerate = async () => {
    if (!chapter?.id) {
      setError('No topic selected.');
      return;
    }

    if (!parentModule?.id || !parentModule?.subjectId) {
      setError('Missing module or subject information.');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);

    const num = parseInt(numberOfQuestions, 10);
    if (isNaN(num) || num < 1 || num > 100) {
      setError('Please enter a valid number of questions (1–100).');
      return;
    }

    try {
      let questions = [];

      if (aiProvider === 'assessment') {
        if (!parentModule.class_instance) {
          setError('Class information is missing for this module.');
          setGenerating(false);
          return;
        }
        const requestData = {
          class_ref: parentModule.class_instance,
          subject: parentModule.subjectId || parentModule.subject,
          chapter: parentModule.id,
          topic: chapter.id,
          num_questions: num,
        };
        const response = await aiService.generateAssessmentQuestions(requestData);
        const responseData = response.data || response;
        // Map assessment API shape → display shape (use DB id if available)
        questions = (responseData.questions || []).map((q, idx) => ({
          ...q,
          id: q.id || `assessment-${idx}`,
          level: q.difficulty_level,
        }));
        setGeneratedQuestions(questions);
        setChapterId(chapter.id);
        setAssessmentSessionId(responseData.session_id || null);
        setSelectedQuestionIds(new Set(questions.map(q => q.id)));
        setSuccess(`Generated ${questions.length} question${questions.length !== 1 ? 's' : ''} using Assessment AI (Claude).`);
      } else {
        const requestData = {
          subject_id: parentModule.subjectId,
          module_id: parentModule.id,
          chapter_id: chapter.id,
          subject_name: parentModule.title || '',
          module_name: parentModule.name || parentModule.title || '',
          chapter_name: chapter.title || '',
          number_of_questions: num,
          add_image: addImage,
          use_matplot: useMatplot,
        };
        if (selectedQuestionTypes.length > 0) {
          requestData.question_types = selectedQuestionTypes;
        }
        const response = aiProvider === 'gemini'
          ? await aiService.generateAIQuestionsGemini(requestData)
          : await aiService.generateAIQuestions(requestData);
        const responseData = response.data || response;
        questions = responseData.questions || [];
        setGeneratedQuestions(questions);
        setChapterId(responseData.chapter_id || chapter.id);
        setSelectedQuestionIds(new Set(questions.map(q => q.id)));
        setSuccess(`Successfully generated ${responseData.questions_created || num} questions using ${aiProvider === 'gemini' ? 'Gemini' : 'ChatGPT'}!`);
      }
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
      
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      console.error('Error saving questions:', err);
      setError(err.message || 'Failed to save questions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setNumberOfQuestions('5');
    setSelectedQuestionTypes(['mcq_single']);
    setAddImage(false);
    setUseMatplot(false);
    setAiProvider('assessment');
    setError(null);
    setSuccess(null);
    setGeneratedQuestions([]);
    setSelectedQuestionIds(new Set());
    setChapterId(null);
    setAssessmentSessionId(null);
    setModifyingQuestionId(null);
    setModifyType('CUSTOM');
    setModifyInstruction('');
    setModifyError(null);
  };

  const handleModifyQuestion = async (question) => {
    if (!assessmentSessionId) {
      setModifyError('No session ID — regenerate questions first.');
      return;
    }
    setModifying(true);
    setModifyError(null);
    try {
      // Strip the temp id before sending
      const { id: _tempId, level: _level, ...questionPayload } = question;
      const response = await aiService.modifyAssessmentQuestion({
        session_id: assessmentSessionId,
        question: questionPayload,
        modification_type: modifyType,
        instruction: modifyInstruction,
      });
      const modified = response?.data?.question;
      if (!modified) throw new Error('No question returned from modify API.');
      setGeneratedQuestions(prev =>
        prev.map(q =>
          q.id === question.id
            ? { ...modified, id: question.id, level: modified.difficulty_level }
            : q
        )
      );
      setModifyingQuestionId(null);
      setModifyInstruction('');
      setModifyType('CUSTOM');
    } catch (err) {
      setModifyError(err.message);
    } finally {
      setModifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-8 py-6" style={{ background: 'linear-gradient(135deg, #00167a 0%, #1e3a8a 100%)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    AI Question Generator
                  </h2>
                  <p className="text-sm text-accent-500/50 mt-0.5">
                    {chapter?.title || 'Assignment'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
            <div className="space-y-6">
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

              {generatedQuestions.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <BarChart3 className="h-4 w-4 text-primary-500" />
                      <span>Number of Questions</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={numberOfQuestions}
                      onChange={(e) => setNumberOfQuestions(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      placeholder="e.g. 5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <HelpCircle className="h-4 w-4 text-primary-500" />
                      <span>Question Types</span>
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {questionTypeOptions.map((option) => (
                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedQuestionTypes.includes(option.value)}
                            onChange={() => toggleQuestionType(option.value)}
                            className="h-5 w-5 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Select one or more types. Difficulty is set by the backend.</p>
                  </div>

                  {aiProvider !== 'assessment' && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="add_image_mod"
                          checked={addImage}
                          onChange={(e) => setAddImage(e.target.checked)}
                          className="h-5 w-5 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="add_image_mod" className="text-sm font-medium text-gray-700">
                          Generate images for questions
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 pl-1">
                        <input
                          type="checkbox"
                          id="use_matplot_mod"
                          checked={useMatplot}
                          onChange={(e) => setUseMatplot(e.target.checked)}
                          disabled={!addImage}
                          className="h-5 w-5 text-primary-500 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <label htmlFor="use_matplot_mod" className="text-sm font-medium text-gray-700">
                          Use matplotlib (Vertex Gemini code)
                        </label>
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
                      disabled={generating}
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
              )}

              {generatedQuestions.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-primary-500" />
                        <h3 className="text-lg font-bold text-gray-900">Generated Questions</h3>
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {selectedQuestionIds.size}/{generatedQuestions.length} selected
                        </span>
                      </div>
                      <button
                        onClick={toggleAllQuestions}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-500 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
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

                  <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {generatedQuestions.map((question, index) => (
                      <div
                        key={question.id}
                        className={`bg-gray-50 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          selectedQuestionIds.has(question.id)
                            ? 'border-primary-500 shadow-md bg-primary-50/30'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleQuestionSelection(question.id)}
                      >
                        <div className="p-4">
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
                                <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-bold">
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
                              <p className="text-gray-900 font-medium leading-relaxed text-sm">
                                {question.question_text}
                              </p>

                              {question.image && (
                                <div className="mt-3">
                                  <img
                                    src={question.image.startsWith('http') ? question.image : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${question.image}`}
                                    alt="Question"
                                    className="max-w-full max-h-48 rounded-lg border border-gray-200 object-contain"
                                    onError={(e) => { e.target.style.display = 'none' }}
                                  />
                                </div>
                              )}

                              {question.options && question.options.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {question.options.map((option, optIdx) => (
                                    <div
                                      key={option.id || optIdx}
                                      className={`flex items-center space-x-3 p-2 rounded-lg text-sm ${
                                        option.is_correct
                                          ? 'bg-green-50 border border-green-200'
                                          : 'bg-white border border-gray-200'
                                      }`}
                                    >
                                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
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
                              {question.hint && (
                                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                  <p className="text-xs font-semibold text-amber-700 mb-0.5">Hint</p>
                                  <p className="text-xs text-amber-800">{question.hint}</p>
                                </div>
                              )}
                              {question.explanation && (
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                  <p className="text-xs font-semibold text-blue-700 mb-0.5">Explanation</p>
                                  <p className="text-xs text-blue-800">{question.explanation}</p>
                                </div>
                              )}

                              {/* Modify button — assessment mode only */}
                              {aiProvider === 'assessment' && (
                                <div className="mt-3">
                                  {modifyingQuestionId !== question.id ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setModifyingQuestionId(question.id);
                                        setModifyType('CUSTOM');
                                        setModifyInstruction('');
                                        setModifyError(null);
                                      }}
                                      className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                                    >
                                      <Zap className="h-3 w-3" />
                                      <span>Modify</span>
                                    </button>
                                  ) : (
                                    <div
                                      className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <p className="text-xs font-semibold text-indigo-700">Modify this question</p>

                                      {/* Modification type selector */}
                                      <div className="flex flex-wrap gap-1.5">
                                        {[
                                          { value: 'CUSTOM', label: 'Custom' },
                                          { value: 'INCREASE_DIFFICULTY', label: 'Harder' },
                                          { value: 'DECREASE_DIFFICULTY', label: 'Easier' },
                                          { value: 'REPHRASE', label: 'Rephrase' },
                                          { value: 'CHANGE_CORRECT_ANSWER', label: 'Change Answer' },
                                        ].map(opt => (
                                          <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setModifyType(opt.value)}
                                            className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
                                              modifyType === opt.value
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                                            }`}
                                          >
                                            {opt.label}
                                          </button>
                                        ))}
                                      </div>

                                      {/* Custom instruction textarea */}
                                      <textarea
                                        value={modifyInstruction}
                                        onChange={(e) => setModifyInstruction(e.target.value)}
                                        placeholder={modifyType === 'CUSTOM' ? 'Describe what to change...' : 'Optional: add extra instruction'}
                                        rows={2}
                                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                      />

                                      {modifyError && (
                                        <p className="text-xs text-red-600">{modifyError}</p>
                                      )}

                                      <div className="flex items-center justify-end space-x-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setModifyingQuestionId(null);
                                            setModifyError(null);
                                          }}
                                          className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                          disabled={modifying}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleModifyQuestion(question)}
                                          disabled={modifying}
                                          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                          {modifying ? (
                                            <>
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                              <span>Modifying...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Zap className="h-3 w-3" />
                                              <span>Apply</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {generatedQuestions.length - selectedQuestionIds.size} question(s) will be marked as inactive
                      </p>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleReset}
                          className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          disabled={saving}
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Generate More</span>
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              <span>Done</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateQuestionForm = ({ onSave, onCancel, loading, error, initialData }) => {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        question_text: initialData.question_text || '',
        question_type: initialData.question_type || 'mcq_single',
        difficulty_level: initialData.difficulty_level || 'medium',
        level: initialData.level || 1,
        exp_points: initialData.exp_points || 10,
        explanation: initialData.explanation || '',
        hint: initialData.hint || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        is_hots: initialData.is_hots || false,
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
      hint: '',
      is_active: true,
      is_hots: false,
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
    if (initialData?.image) {
      const imageUrl = initialData.image.startsWith('http') 
        ? initialData.image 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${initialData.image}`;
      return imageUrl;
    }
    return null;
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        question_text: initialData.question_text || '',
        question_type: initialData.question_type || 'mcq_single',
        difficulty_level: initialData.difficulty_level || 'medium',
        level: initialData.level || 1,
        exp_points: initialData.exp_points || 10,
        explanation: initialData.explanation || '',
        hint: initialData.hint || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        is_hots: initialData.is_hots || false,
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
      });
    } else {
      setFormData({
        question_text: '',
        question_type: 'mcq_single',
        difficulty_level: 'medium',
        level: 1,
        exp_points: 10,
        explanation: '',
        hint: '',
        is_active: true,
        is_hots: false,
        options: [
          { option_text: '', is_correct: false, order: 1 },
          { option_text: '', is_correct: false, order: 2 },
          { option_text: '', is_correct: false, order: 3 },
          { option_text: '', is_correct: false, order: 4 },
        ],
      });
    }
  }, [initialData]);

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
    if (field === 'question_type') {
      if ((value === 'mcq_single' || value === 'mcq_multiple')) {
        setFormData(prev => {
          const hasOptions = prev.options && prev.options.length > 0;
          const options = hasOptions 
            ? prev.options 
            : [
                { option_text: '', is_correct: false, order: 1 },
                { option_text: '', is_correct: false, order: 2 },
                { option_text: '', is_correct: false, order: 3 },
                { option_text: '', is_correct: false, order: 4 },
              ];
          return { ...prev, [field]: value, options };
        });
      } else {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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
      if (!file.type.startsWith('image/')) {
        setValidationError('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setValidationError(null);
      
      if (formData.remove_image) {
        setFormData(prev => {
          const { remove_image, ...rest } = prev;
          return rest;
        });
      }
      
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
    const fileInput = document.getElementById('question-image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
    if (initialData?.image) {
      setFormData(prev => ({ ...prev, remove_image: true }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);
    
    if (['mcq_single', 'mcq_multiple', 'rearrange'].includes(formData.question_type)) {
      const options = formData.options && Array.isArray(formData.options) ? formData.options : [];
      const validOptions = options.filter(opt => opt.option_text && opt.option_text.trim() !== '');

      if (validOptions.length === 0) {
        setValidationError('Please add at least one option with text.');
        return;
      }

      const optionTexts = validOptions.map(opt => opt.option_text.trim().toLowerCase());
      const hasDuplicates = optionTexts.length !== new Set(optionTexts).size;
      if (hasDuplicates) {
        setValidationError('All options must have unique text. Please remove duplicate options.');
        return;
      }

      if (formData.question_type !== 'rearrange') {
        const hasCorrectOption = validOptions.some(opt => opt.is_correct === true);
        if (!hasCorrectOption) {
          setValidationError('Please select at least one correct option.');
          return;
        }
      }

      const dataToSave = {
        ...formData,
        options: validOptions.map((opt, idx) => ({
          option_text: opt.option_text.trim(),
          is_correct: opt.is_correct || false,
          order: opt.order || idx + 1,
        }))
      };
      if (imageFile) {
        dataToSave.image = imageFile;
      }
      onSave(dataToSave);
    } else {
      const dataToSave = { ...formData };
      delete dataToSave.options;
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

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
          <ImageIcon className="h-4 w-4 text-gray-500" />
          <span>Question Image <span className="text-xs font-normal text-gray-500">(Optional)</span></span>
        </label>
        <div className="space-y-3">
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
            <option value="rearrange">Re-arrange</option>
          </select>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Level
          </label>
          <select
            value={formData.level}
            onChange={(e) => handleFieldChange('level', parseInt(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            disabled={loading}
          >
            <option value={1}>Level 1</option>
            <option value={2}>Level 2</option>
            <option value={3}>Level 3</option>
            <option value={4}>Level 4</option>
            <option value={5}>Level 5</option>
          </select>
        </div>

      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Difficulty Level
        </label>
        <div className="flex space-x-3">
          {[
            { value: 'easy', label: 'Easy', active: 'bg-green-500 text-white border-green-500', inactive: 'bg-white text-green-700 border-green-300 hover:bg-green-50' },
            { value: 'medium', label: 'Medium', active: 'bg-yellow-500 text-white border-yellow-500', inactive: 'bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50' },
            { value: 'hard', label: 'Hard', active: 'bg-red-500 text-white border-red-500', inactive: 'bg-white text-red-700 border-red-300 hover:bg-red-50' },
          ].map(({ value, label, active, inactive }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleFieldChange('difficulty_level', value)}
              className={`flex-1 py-2 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${formData.difficulty_level === value ? active : inactive}`}
              disabled={loading}
            >
              {label}
            </button>
          ))}
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
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_hots"
                checked={formData.is_hots}
                onChange={(e) => handleFieldChange('is_hots', e.target.checked)}
                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="is_hots" className="text-sm font-medium text-gray-700">
                HOTS
              </label>
              <span className="text-xs text-gray-500">(Higher Order Thinking Skills)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Hint
          </label>
          <textarea
            value={formData.hint}
            onChange={(e) => handleFieldChange('hint', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
            placeholder="Enter a hint to help students..."
            disabled={loading}
          />
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
      </div>

      {['mcq_single', 'mcq_multiple', 'rearrange'].includes(formData.question_type) && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              {formData.question_type === 'rearrange' ? 'Items (in correct order)' : 'Options'} <span className="text-red-500">*</span>
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
                  {formData.question_type !== 'rearrange' && (
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer">
                      <input
                        type={formData.question_type === 'mcq_single' ? 'radio' : 'checkbox'}
                        name="correct_answer"
                        checked={option.is_correct}
                        onChange={(e) => {
                          setValidationError(null);
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
                  )}
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
              : formData.question_type === 'rearrange'
              ? 'Enter items in the correct order'
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
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-secondary-500 hover:to-primary-500'
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
