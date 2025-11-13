import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Trash2,
  Edit
} from 'lucide-react';
import classesService from '../services/classesService';
import subjectsService from '../services/subjectsService';
import testsService from '../services/testsService';

const TestsQuizzes = () => {
  const [activeTab, setActiveTab] = useState('tests');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [missions, setMissions] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    testDate: '',
    testTime: '',
    duration: '',
    notification: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdMissions, setCreatedMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [creatingQuestion, setCreatingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState(null);
  const [missionQuestions, setMissionQuestions] = useState([]);
  const [editingMission, setEditingMission] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const response = await classesService.getClasses();
      // Extract data array from response
      const classesData = response.data || response || [];
      // Store full class objects (with id and name)
      const classesList = classesData.map(cls => ({
        id: cls.id || cls.uuid,
        name: cls.name || `${cls.grade || ''} ${cls.section || ''}`.trim() || cls
      })).filter(cls => cls.id && cls.name); // Filter out invalid entries
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
      // Extract data array from response
      const subjectsData = response.data || response || [];
      // Store full subject objects (with id and name)
      const subjectsList = subjectsData.map(subject => ({
        id: subject.id || subject.uuid,
        name: subject.name || subject
      })).filter(subject => subject.id && subject.name); // Filter out invalid entries
      setSubjects(subjectsList);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  const fetchMissions = useCallback(async () => {
    setLoadingMissions(true);
    try {
      const response = await testsService.getAllMissions();
      // Extract data array from response
      const missionsData = response.data || response || [];
      setMissions(missionsData);
    } catch (error) {
      console.error('Failed to fetch missions:', error);
      setMissions([]);
    } finally {
      setLoadingMissions(false);
    }
  }, []);

  // Fetch missions when component loads or when tests tab is active
  useEffect(() => {
    if (activeTab === 'tests') {
      fetchMissions();
    }
  }, [activeTab, fetchMissions]);

  // Fetch classes and subjects when create tab is active or when editing
  useEffect(() => {
    if (activeTab === 'create' || isEditMode) {
      fetchClasses();
      fetchSubjects();
    }
  }, [activeTab, isEditMode, fetchClasses, fetchSubjects]);

  // Pre-fill form when editing a mission
  useEffect(() => {
    if (editingMission && isEditMode) {
      // Extract date from mission_date
      const missionDate = editingMission.mission_date 
        ? new Date(editingMission.mission_date).toISOString().split('T')[0]
        : '';
      
      // Extract time from description if available, or leave empty
      const timeMatch = editingMission.description?.match(/\d{1,2}:\d{2}/);
      const missionTime = timeMatch ? timeMatch[0] : '';
      
      setFormData({
        title: editingMission.title || '',
        testDate: missionDate,
        testTime: missionTime,
        duration: editingMission.duration?.toString() || '',
        notification: false // This might not be stored, defaulting to false
      });
      
      // Set selected subject and class
      if (editingMission.subject) {
        const subjectId = editingMission.subject?.id || editingMission.subject?.uuid || editingMission.subject;
        setSelectedSubject(subjectId);
      }
      
      if (editingMission.class_group) {
        const classId = editingMission.class_group?.id || editingMission.class_group?.uuid || editingMission.class_group;
        setSelectedClasses([classId]);
      }
    } else if (!isEditMode) {
      // Reset form when not in edit mode
      setFormData({
        title: '',
        testDate: '',
        testTime: '',
        duration: '',
        notification: false
      });
      setSelectedSubject('');
      setSelectedClasses([]);
    }
  }, [editingMission, isEditMode]);

  const handleClassToggle = (classId) => {
    setSelectedClasses(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.title.trim()) {
      setError('Test title is required');
      return;
    }
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }
    if (selectedClasses.length === 0) {
      setError('Please select at least one class');
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
      // Combine date and time into a datetime string
      const missionDate = formData.testDate; // Just the date, backend expects date only
      
      if (isEditMode && editingMission) {
        // Update existing mission
        const missionId = editingMission.id || editingMission.uuid;
        const missionPayload = {
          title: formData.title,
          description: `Test scheduled for ${formData.testDate}${formData.testTime ? ` at ${formData.testTime}` : ''}`,
          mission_date: missionDate,
          duration: parseInt(formData.duration),
          subject: selectedSubject,
          class_group: selectedClasses[0], // In edit mode, we only update the single class
          exp_multiplier: editingMission.exp_multiplier || '1.00',
          base_exp: editingMission.base_exp || 10,
          is_active: editingMission.is_active !== undefined ? editingMission.is_active : true
        };
        
        const updatedMission = await testsService.updateMission(missionId, missionPayload);
        const missionData = updatedMission.data || updatedMission;
        
        setSuccess(true);
        setIsEditMode(false);
        setEditingMission(null);
        
        // Reset form
        setFormData({
          title: '',
          testDate: '',
          testTime: '',
          duration: '',
          notification: false
        });
        setSelectedSubject('');
        setSelectedClasses([]);
        
        // Refresh missions list
        await fetchMissions();
        
        // Switch back to tests tab after a short delay
        setTimeout(() => {
          setActiveTab('tests');
        }, 1500);
      } else {
        // Create one mission per selected class
        const missionPromises = selectedClasses.map(classId => {
          const missionPayload = {
            title: formData.title,
            description: `Test scheduled for ${formData.testDate}${formData.testTime ? ` at ${formData.testTime}` : ''}`,
            mission_date: missionDate,
            duration: parseInt(formData.duration),
            subject: selectedSubject,
            class_group: classId,
            exp_multiplier: '1.00',
            base_exp: 10,
            is_active: true
          };
          return testsService.createMission(missionPayload);
        });

        const createdMissionsData = await Promise.all(missionPromises);
        
        // Extract mission data from responses
        const missions = createdMissionsData.map(res => res.data || res);
        setCreatedMissions(missions);
        
        // If only one mission was created, automatically select it
        if (missions.length === 1) {
          setSelectedMission(missions[0]);
          setShowQuestionForm(true);
        }
        
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          testDate: '',
          testTime: '',
          duration: '',
          notification: false
        });
        setSelectedSubject('');
        setSelectedClasses([]);
        
        // Don't redirect, stay on create tab to add questions
      }
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} test:`, error);
      setError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} test. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (mission) => {
    setEditingMission(mission);
    setIsEditMode(true);
    setActiveTab('create');
    setError(null);
    setSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingMission(null);
    setFormData({
      title: '',
      testDate: '',
      testTime: '',
      duration: '',
      notification: false
    });
    setSelectedSubject('');
    setSelectedClasses([]);
    setError(null);
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Tests & Quizzes</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                if (isEditMode) {
                  handleCancelEdit();
                }
                setActiveTab('tests');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'tests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Tests
            </button>
            <button
              onClick={() => {
                if (isEditMode) {
                  handleCancelEdit();
                }
                setActiveTab('create');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create New Test
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'tests' && (
        <div className="space-y-6">
          {loadingMissions ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading missions...</div>
            </div>
          ) : missions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No past missions found.</div>
            </div>
          ) : (
            missions.map((mission, index) => {
              // Format mission date
              const missionDate = mission.mission_date 
                ? new Date(mission.mission_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : 'N/A';
              
              // Get class name
              const className = mission.class_group?.name || mission.class_group || 'N/A';
              
              // Get subject name
              const subjectName = mission.subject?.name || mission.subject || 'N/A';
              
              return (
            <div 
              key={mission.id || mission.uuid || index} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up"
              style={{animationDelay: `${0.1 + index * 0.1}s`}}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{mission.title}</h3>
                  <p className="text-gray-600">{className} / {subjectName} | Mission Date: {missionDate}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(mission)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Test</span>
                  </button>
                  <Link 
                    to="/tests/performance/priya-sharma"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 hover:shadow-lg"
                  >
                    <span className="transform transition-transform duration-200 hover:rotate-12">📊</span>
                    <span>View Results</span>
                  </Link>
                </div>
              </div>

              {/* Mission Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center transform hover:scale-105 transition-all duration-300 animate-count-up" style={{animationDelay: '0.2s'}}>
                  <div className="text-2xl font-bold text-blue-600">{mission.duration || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Duration (min)</div>
                </div>
                <div className="text-center transform hover:scale-105 transition-all duration-300 animate-count-up" style={{animationDelay: '0.3s'}}>
                  <div className="text-2xl font-bold text-green-600">{mission.base_exp || 0}</div>
                  <div className="text-sm text-gray-600">Base EXP</div>
                </div>
                <div className="text-center transform hover:scale-105 transition-all duration-300 animate-count-up" style={{animationDelay: '0.4s'}}>
                  <div className="text-2xl font-bold text-purple-600">{mission.exp_multiplier || '1.00'}</div>
                  <div className="text-sm text-gray-600">EXP Multiplier</div>
                </div>
                <div className="text-center transform hover:scale-105 transition-all duration-300 animate-count-up" style={{animationDelay: '0.5s'}}>
                  <div className="text-2xl font-bold text-gray-800">{mission.questions?.length || 0}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
              </div>

              {/* Mission Description */}
              {mission.description && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.6s'}}>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 transform transition-transform duration-200 hover:rotate-12">📝</span>
                    <span className="text-sm font-medium text-blue-800">
                      {mission.description}
                    </span>
                  </div>
                </div>
              )}
            </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'create' && !showQuestionForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isEditMode ? 'Edit Test' : 'Create New Test'}
            </h2>
            <p className="text-gray-600">
              {isEditMode ? 'Update the details for this test.' : 'Enter the basic details for your new test.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {isEditMode ? 'Test updated successfully!' : 'Test created successfully! Redirecting...'}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., 'Modern Physics - Chapter 1 Test'"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={loadingSubjects}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Class(es) to Assign</label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
                {loadingClasses ? (
                  <div className="text-center text-gray-500 py-4">Loading classes...</div>
                ) : classes.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No classes available</div>
                ) : (
                  classes.map((cls) => (
                    <label key={cls.id} className="flex items-center space-x-2 mb-2">
                      <input 
                        type="checkbox" 
                        checked={selectedClasses.includes(cls.id)}
                        onChange={() => handleClassToggle(cls.id)}
                        disabled={isEditMode}
                        className="rounded" 
                      />
                      <span>{cls.name}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {isEditMode ? 'Class cannot be changed when editing a test.' : 'Select multiple classes to assign this test.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Date</label>
                <input
                  type="date"
                  name="testDate"
                  value={formData.testDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Time</label>
                <input
                  type="time"
                  name="testTime"
                  value={formData.testTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (in minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 60"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="notification" 
                name="notification"
                checked={formData.notification}
                onChange={handleInputChange}
                className="rounded" 
              />
              <label htmlFor="notification" className="text-sm text-gray-700">
                30-minute prior auto-notification to students
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  if (isEditMode) {
                    handleCancelEdit();
                  } else {
                    setFormData({
                      title: '',
                      testDate: '',
                      testTime: '',
                      duration: '',
                      notification: false
                    });
                    setSelectedSubject('');
                    setSelectedClasses([]);
                    setError(null);
                  }
                }}
                disabled={submitting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                    <span className="animate-spin">⏳</span>
                  </>
                ) : (
                  <>
                    <span>{isEditMode ? 'Update Test' : 'Create Test'}</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'create' && showQuestionForm && selectedMission && (
        <TestView 
          mission={selectedMission}
          createdMissions={createdMissions}
          onBack={() => {
            setShowQuestionForm(false);
            setSelectedMission(null);
            setCreatedMissions([]);
            setMissionQuestions([]);
            setQuestionError(null);
          }}
          onMissionSelect={(mission) => {
            setSelectedMission(mission);
            setQuestionError(null);
          }}
          onCreateQuestion={async (questionData) => {
            setCreatingQuestion(true);
            setQuestionError(null);
            try {
              const missionId = selectedMission.id || selectedMission.uuid;
              const response = await testsService.createMissionQuestion(missionId, questionData);
              
              // Add the question to the list
              const newQuestion = response.data?.question || response.question;
              setMissionQuestions(prev => [...prev, newQuestion]);
              
              // Reset form will be handled by CreateQuestionForm
              return true;
            } catch (error) {
              console.error('Error creating question:', error);
              setQuestionError(error.message || 'Failed to create question. Please try again.');
              return false;
            } finally {
              setCreatingQuestion(false);
            }
          }}
          creatingQuestion={creatingQuestion}
          questionError={questionError}
          missionQuestions={missionQuestions}
        />
      )}
    </div>
  );
};

// Test View Component for adding questions
const TestView = ({ 
  mission, 
  createdMissions, 
  onBack, 
  onMissionSelect, 
  onCreateQuestion,
  creatingQuestion,
  questionError,
  missionQuestions
}) => {
  const [formData, setFormData] = useState({
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
  });

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, field, value) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validOptions = formData.options.filter(opt => opt.option_text.trim() !== '');
    const questionData = { ...formData, options: validOptions };
    
    const success = await onCreateQuestion(questionData);
    if (success) {
      // Reset form
      setFormData({
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
      });
    }
  };

  const missionDate = mission.mission_date 
    ? new Date(mission.mission_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{mission.title}</h2>
            <p className="text-gray-600 mt-1">
              {mission.class_group?.name || 'N/A'} / {mission.subject?.name || 'N/A'} | {missionDate}
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Mission selector if multiple missions */}
        {createdMissions.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Mission</label>
            <select
              value={mission.id || mission.uuid}
              onChange={(e) => {
                const selected = createdMissions.find(m => (m.id || m.uuid) === e.target.value);
                if (selected) onMissionSelect(selected);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {createdMissions.map((m) => (
                <option key={m.id || m.uuid} value={m.id || m.uuid}>
                  {m.title} - {m.class_group?.name || 'N/A'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{mission.duration || 'N/A'}</div>
            <div className="text-sm text-gray-600">Duration (min)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{missionQuestions.length}</div>
            <div className="text-sm text-gray-600">Questions Added</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{mission.base_exp || 10}</div>
            <div className="text-sm text-gray-600">Base EXP</div>
          </div>
        </div>
      </div>

      {/* Question Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Add Question</h3>
          <p className="text-gray-600">Create a new question for this test.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questionError && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{questionError}</p>
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              placeholder="Enter the question text..."
              disabled={creatingQuestion}
            />
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled={creatingQuestion}
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled={creatingQuestion}
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled={creatingQuestion}
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
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={creatingQuestion}
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              placeholder="Enter explanation for the correct answer..."
              disabled={creatingQuestion}
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
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  disabled={creatingQuestion}
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
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        disabled={creatingQuestion}
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer">
                        <input
                          type={formData.question_type === 'mcq_single' ? 'radio' : 'checkbox'}
                          name="correct_answer"
                          checked={option.is_correct}
                          onChange={(e) => {
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          disabled={creatingQuestion}
                        />
                        <span>Correct</span>
                      </label>
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={creatingQuestion}
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
              onClick={onBack}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={creatingQuestion}
            >
              Done
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={creatingQuestion}
            >
              {creatingQuestion ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Add Question</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestsQuizzes;
