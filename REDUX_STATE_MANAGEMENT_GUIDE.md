# Redux State Management Implementation Guide

## Overview

This document provides a comprehensive guide for implementing and using Redux state management in the Gyaan Buddy application. All API calls are now managed through Redux slices with proper loading states, error handling, and data persistence.

## Architecture

### Redux Store Structure

```javascript
{
  auth: {
    user: null,
    role: null,
    isAuthenticated: false,
    loading: { login: false, logout: false, fetchUser: false, updateProfile: false, changePassword: false },
    error: { login: null, logout: null, fetchUser: null, updateProfile: null, changePassword: null },
    permissions: [],
    lastLogin: null
  },
  students: {
    students: [],
    currentStudent: null,
    studentStats: null,
    performance: {},
    testHistory: {},
    studentsByClass: {},
    loading: { students: false, currentStudent: false, stats: false, performance: false, testHistory: false, create: false, update: false, delete: false },
    error: { students: null, currentStudent: null, stats: null, performance: null, testHistory: null, create: null, update: null, delete: null },
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
    filters: { search: '', class: '', grade: '', subject: '' }
  },
  teachers: {
    teachers: [],
    currentTeacher: null,
    teacherStats: null,
    classes: {},
    performance: {},
    loading: { teachers: false, currentTeacher: false, stats: false, classes: false, performance: false, create: false, update: false, delete: false },
    error: { teachers: null, currentTeacher: null, stats: null, classes: null, performance: null, create: null, update: null, delete: null },
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
    filters: { search: '', subject: '', grade: '' }
  },
  questions: {
    questions: [],
    aiGeneratedQuestions: [],
    currentQuestion: null,
    questionStats: null,
    loading: { questions: false, currentQuestion: false, stats: false, aiGeneration: false, aiGenerated: false, create: false, update: false, delete: false, saveAI: false },
    error: { questions: null, currentQuestion: null, stats: null, aiGeneration: null, aiGenerated: null, create: null, update: null, delete: null, saveAI: null },
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
    filters: { type: '', difficulty: '', subject: '', grade: '' },
    availableFilters: { types: [], difficulties: [], subjects: [], grades: [] }
  },
  dashboard: {
    metrics: [],
    progressTrends: null,
    subjectPerformance: null,
    classDistribution: null,
    alerts: [],
    recentActivities: [],
    quickSummary: [],
    loading: { metrics: false, progressTrends: false, subjectPerformance: false, classDistribution: false, alerts: false, recentActivities: false, quickSummary: false },
    error: { metrics: null, progressTrends: null, subjectPerformance: null, classDistribution: null, alerts: null, recentActivities: null, quickSummary: null },
    lastUpdated: null,
    filters: { dateRange: '30d', class: '', subject: '', grade: '' }
  },
  reports: {
    studentPerformanceReport: null,
    progressOverTimeReport: null,
    quizAssignmentSummaries: null,
    aiInsightsReport: null,
    analyticsReport: null,
    customReports: [],
    reportTemplates: [],
    loading: { studentPerformance: false, progressOverTime: false, quizAssignmentSummaries: false, aiInsights: false, analytics: false, customReport: false, templates: false, export: false },
    error: { studentPerformance: null, progressOverTime: null, quizAssignmentSummaries: null, aiInsights: null, analytics: null, customReport: null, templates: null, export: null },
    filters: { dateRange: '30d', class: '', subject: '', grade: '', studentId: '', reportType: '' },
    exportStatus: { isExporting: false, exportProgress: 0, exportUrl: null }
  },
  ai: {
    suggestions: [],
    insights: null,
    generatedContent: null,
    recommendations: {},
    heatmap: null,
    remedialActivities: [],
    studentAnalysis: {},
    personalizedContent: {},
    loading: { suggestions: false, insights: false, contentGeneration: false, recommendations: false, heatmap: false, remedialActivities: false, analysis: false, personalizedContent: false },
    error: { suggestions: null, insights: null, contentGeneration: null, recommendations: null, heatmap: null, remedialActivities: null, analysis: null, personalizedContent: null },
    filters: { category: '', priority: '', class: '', subject: '', studentId: '', contentType: '' },
    categories: [],
    priorities: [],
    generationHistory: []
  }
}
```

## Redux Slices

### 1. Authentication Slice (`src/features/auth/authSlice.js`)

**Actions:**
- `loginUser(credentials)` - Login user with email/password
- `logoutUser()` - Logout current user
- `fetchCurrentUser()` - Get current user profile
- `updateUserProfile(profileData)` - Update user profile
- `changeUserPassword(passwordData)` - Change user password
- `switchRole(role)` - Switch user role
- `clearError(errorType)` - Clear specific or all errors

**Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, logoutUser, fetchCurrentUser } from '../features/auth/authSlice'

const LoginComponent = () => {
  const dispatch = useDispatch()
  const { user, isAuthenticated, loading, error } = useSelector(state => state.auth)

  const handleLogin = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap()
      // Login successful
    } catch (error) {
      // Handle login error
    }
  }

  return (
    // Component JSX
  )
}
```

### 2. Students Slice (`src/features/students/studentsSlice.js`)

**Actions:**
- `fetchStudents(filters)` - Get students with optional filters
- `fetchStudentById(studentId)` - Get specific student
- `createStudent(studentData)` - Create new student
- `updateStudent({ studentId, studentData })` - Update student
- `deleteStudent(studentId)` - Delete student
- `fetchStudentPerformance({ studentId, filters })` - Get student performance
- `fetchStudentTestHistory({ studentId, filters })` - Get test history
- `fetchStudentsByClass(className)` - Get students by class
- `fetchStudentStats()` - Get student statistics
- `setFilters(filters)` - Update filters
- `clearFilters()` - Reset filters
- `clearError(errorType)` - Clear errors

**Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudents, createStudent, setFilters } from '../features/students/studentsSlice'

const StudentsComponent = () => {
  const dispatch = useDispatch()
  const { students, loading, error, filters } = useSelector(state => state.students)

  useEffect(() => {
    dispatch(fetchStudents(filters))
  }, [dispatch, filters])

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }))
  }

  const handleAddStudent = async (studentData) => {
    try {
      await dispatch(createStudent(studentData)).unwrap()
      // Student created successfully
    } catch (error) {
      // Handle error
    }
  }

  return (
    // Component JSX
  )
}
```

### 3. Teachers Slice (`src/features/teachers/teachersSlice.js`)

**Actions:**
- `fetchTeachers(filters)` - Get teachers with filters
- `fetchTeacherById(teacherId)` - Get specific teacher
- `createTeacher(teacherData)` - Create new teacher
- `updateTeacher({ teacherId, teacherData })` - Update teacher
- `deleteTeacher(teacherId)` - Delete teacher
- `fetchTeacherClasses(teacherId)` - Get teacher's classes
- `fetchTeacherPerformance(teacherId)` - Get teacher performance
- `fetchTeacherStats()` - Get teacher statistics

### 4. Questions Slice (`src/features/questions/questionsSlice.js`)

**Actions:**
- `fetchQuestions(filters)` - Get questions with filters
- `fetchQuestionById(questionId)` - Get specific question
- `createQuestion(questionData)` - Create new question
- `updateQuestion({ questionId, questionData })` - Update question
- `deleteQuestion(questionId)` - Delete question
- `generateAIQuestions(generationData)` - Generate AI questions
- `fetchAIGeneratedQuestions(filters)` - Get AI generated questions
- `saveAIQuestions(questionIds)` - Save AI questions to bank
- `fetchQuestionStats()` - Get question statistics
- `selectAIQuestion(questionId)` - Select/deselect AI question
- `selectAllAIQuestions()` - Select all AI questions
- `deselectAllAIQuestions()` - Deselect all AI questions

### 5. Dashboard Slice (`src/features/dashboard/dashboardSlice.js`)

**Actions:**
- `fetchDashboardMetrics(role)` - Get dashboard metrics
- `fetchProgressTrends(filters)` - Get progress trends
- `fetchSubjectPerformance(filters)` - Get subject performance
- `fetchClassDistribution(filters)` - Get class distribution
- `fetchDashboardAlerts(filters)` - Get alerts
- `fetchRecentActivities(filters)` - Get recent activities
- `fetchQuickSummary(role)` - Get quick summary
- `markAlertAsRead(alertId)` - Mark alert as read
- `markAllAlertsAsRead()` - Mark all alerts as read
- `dismissAlert(alertId)` - Dismiss alert

### 6. Reports Slice (`src/features/reports/reportsSlice.js`)

**Actions:**
- `fetchStudentPerformanceReport(filters)` - Get student performance report
- `fetchProgressOverTimeReport(filters)` - Get progress over time report
- `fetchQuizAssignmentSummaries(filters)` - Get quiz summaries
- `fetchAIInsightsReport(filters)` - Get AI insights report
- `fetchAnalyticsReport(filters)` - Get analytics report
- `generateCustomReport(reportConfig)` - Generate custom report
- `fetchReportTemplates()` - Get report templates
- `exportReport({ reportId, format })` - Export report
- `removeCustomReport(reportId)` - Remove custom report

### 7. AI Slice (`src/features/ai/aiSlice.js`)

**Actions:**
- `fetchAISuggestions(filters)` - Get AI suggestions
- `fetchAIInsights(filters)` - Get AI insights
- `generateAIContent(contentData)` - Generate AI content
- `fetchAIRecommendations({ type, filters })` - Get AI recommendations
- `fetchAIHeatmap(filters)` - Get AI heatmap
- `fetchRemedialActivities(filters)` - Get remedial activities
- `analyzeStudentPerformance({ studentId, filters })` - Analyze student performance
- `generatePersonalizedContent({ studentId, contentType, filters })` - Generate personalized content
- `markSuggestionAsApplied(suggestionId)` - Mark suggestion as applied
- `markSuggestionAsDismissed(suggestionId)` - Mark suggestion as dismissed

## Component Integration Patterns

### 1. Basic Data Fetching

```javascript
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudents } from '../features/students/studentsSlice'

const StudentsList = () => {
  const dispatch = useDispatch()
  const { students, loading, error } = useSelector(state => state.students)

  useEffect(() => {
    dispatch(fetchStudents())
  }, [dispatch])

  if (loading.students) {
    return <div>Loading...</div>
  }

  if (error.students) {
    return <div>Error: {error.students}</div>
  }

  return (
    <div>
      {students.map(student => (
        <div key={student.id}>{student.name}</div>
      ))}
    </div>
  )
}
```

### 2. Form Submission with Error Handling

```javascript
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createStudent, clearError } from '../features/students/studentsSlice'

const AddStudentForm = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector(state => state.students)
  const [formData, setFormData] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createStudent(formData)).unwrap()
      // Success - form data is automatically added to state
      setFormData({})
    } catch (error) {
      // Error is automatically stored in state
      console.error('Failed to create student:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error.create && (
        <div className="error">
          {error.create}
          <button onClick={() => dispatch(clearError('create'))}>
            Clear Error
          </button>
        </div>
      )}
      <button type="submit" disabled={loading.create}>
        {loading.create ? 'Creating...' : 'Create Student'}
      </button>
    </form>
  )
}
```

### 3. Filter Management

```javascript
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudents, setFilters, clearFilters } from '../features/students/studentsSlice'

const StudentsWithFilters = () => {
  const dispatch = useDispatch()
  const { students, filters, loading } = useSelector(state => state.students)

  // Auto-fetch when filters change
  useEffect(() => {
    dispatch(fetchStudents(filters))
  }, [dispatch, filters])

  const handleSearchChange = (value) => {
    dispatch(setFilters({ search: value }))
  }

  const handleClassChange = (value) => {
    dispatch(setFilters({ class: value }))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search students..."
      />
      <select
        value={filters.class}
        onChange={(e) => handleClassChange(e.target.value)}
      >
        <option value="">All Classes</option>
        <option value="9A">Class 9A</option>
        <option value="10A">Class 10A</option>
      </select>
      <button onClick={handleClearFilters}>Clear Filters</button>
      
      {loading.students ? (
        <div>Loading...</div>
      ) : (
        <div>
          {students.map(student => (
            <div key={student.id}>{student.name}</div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 4. Optimistic Updates

```javascript
import { useDispatch, useSelector } from 'react-redux'
import { updateStudent } from '../features/students/studentsSlice'

const StudentCard = ({ student }) => {
  const dispatch = useDispatch()
  const { loading } = useSelector(state => state.students)

  const handleToggleStatus = async () => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active'
    try {
      await dispatch(updateStudent({
        studentId: student.id,
        studentData: { ...student, status: newStatus }
      })).unwrap()
      // Update successful - state is automatically updated
    } catch (error) {
      // Handle error - you might want to revert the UI change
      console.error('Failed to update student:', error)
    }
  }

  return (
    <div>
      <h3>{student.name}</h3>
      <p>Status: {student.status}</p>
      <button
        onClick={handleToggleStatus}
        disabled={loading.update}
      >
        {loading.update ? 'Updating...' : 'Toggle Status'}
      </button>
    </div>
  )
}
```

## Error Handling Patterns

### 1. Global Error Handling

```javascript
import { useSelector } from 'react-redux'

const ErrorBoundary = () => {
  const authError = useSelector(state => state.auth.error)
  const studentsError = useSelector(state => state.students.error)
  const teachersError = useSelector(state => state.teachers.error)

  const hasAnyError = Object.values(authError).some(err => err) ||
                     Object.values(studentsError).some(err => err) ||
                     Object.values(teachersError).some(err => err)

  if (hasAnyError) {
    return (
      <div className="error-notification">
        <p>An error occurred. Please try again.</p>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    )
  }

  return null
}
```

### 2. Component-Level Error Handling

```javascript
import { useSelector, useDispatch } from 'react-redux'
import { clearError } from '../features/students/studentsSlice'

const StudentsComponent = () => {
  const dispatch = useDispatch()
  const { students, error, loading } = useSelector(state => state.students)

  const handleRetry = () => {
    dispatch(clearError('students'))
    dispatch(fetchStudents())
  }

  if (error.students) {
    return (
      <div className="error-state">
        <h3>Failed to load students</h3>
        <p>{error.students}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    )
  }

  // Rest of component
}
```

## Loading States

### 1. Individual Loading States

```javascript
const StudentsComponent = () => {
  const { loading } = useSelector(state => state.students)

  return (
    <div>
      {loading.students && <div>Loading students...</div>}
      {loading.create && <div>Creating student...</div>}
      {loading.update && <div>Updating student...</div>}
      {loading.delete && <div>Deleting student...</div>}
    </div>
  )
}
```

### 2. Combined Loading States

```javascript
const StudentsComponent = () => {
  const { loading } = useSelector(state => state.students)
  
  const isLoading = Object.values(loading).some(load => load)

  if (isLoading) {
    return <div>Loading...</div>
  }

  // Rest of component
}
```

## Best Practices

### 1. Always Use `.unwrap()` for Error Handling

```javascript
// Good
try {
  await dispatch(createStudent(data)).unwrap()
  // Success
} catch (error) {
  // Handle error
}

// Bad - errors won't be caught
dispatch(createStudent(data))
```

### 2. Use Selectors for Computed Values

```javascript
// Good - use selectors for derived state
const { students, filters } = useSelector(state => state.students)
const filteredStudents = students.filter(student => 
  student.name.toLowerCase().includes(filters.search.toLowerCase())
)

// Bad - don't compute in component
const students = useSelector(state => state.students.students)
const search = useSelector(state => state.students.filters.search)
const filteredStudents = students.filter(student => 
  student.name.toLowerCase().includes(search.toLowerCase())
)
```

### 3. Clear Errors When Appropriate

```javascript
// Clear errors when user starts new action
const handleSubmit = async (data) => {
  dispatch(clearError('create')) // Clear previous errors
  try {
    await dispatch(createStudent(data)).unwrap()
  } catch (error) {
    // Error will be stored in state
  }
}
```

### 4. Use Filters Effectively

```javascript
// Good - filters are managed in Redux
const handleSearch = (value) => {
  dispatch(setFilters({ search: value }))
}

// Auto-fetch when filters change
useEffect(() => {
  dispatch(fetchStudents(filters))
}, [dispatch, filters])
```

## Testing Redux Integration

### 1. Testing Components with Redux

```javascript
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import StudentsComponent from './StudentsComponent'
import studentsReducer from '../features/students/studentsSlice'

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      students: studentsReducer
    },
    preloadedState: {
      students: {
        students: [],
        loading: { students: false },
        error: { students: null },
        filters: { search: '', class: '', grade: '', subject: '' },
        ...initialState
      }
    }
  })
}

test('renders students list', () => {
  const store = createTestStore({
    students: [
      { id: '1', name: 'John Doe', class: '10A' },
      { id: '2', name: 'Jane Smith', class: '10B' }
    ]
  })

  render(
    <Provider store={store}>
      <StudentsComponent />
    </Provider>
  )

  expect(screen.getByText('John Doe')).toBeInTheDocument()
  expect(screen.getByText('Jane Smith')).toBeInTheDocument()
})
```

### 2. Testing Async Actions

```javascript
import { configureStore } from '@reduxjs/toolkit'
import studentsReducer, { fetchStudents } from '../features/students/studentsSlice'

test('fetchStudents action', async () => {
  const store = configureStore({
    reducer: { students: studentsReducer }
  })

  await store.dispatch(fetchStudents())
  
  const state = store.getState()
  expect(state.students.students).toHaveLength(5) // Assuming mock returns 5 students
  expect(state.students.loading.students).toBe(false)
})
```

## Migration Guide

### From Direct API Calls to Redux

**Before (Direct API):**
```javascript
const StudentsComponent = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      try {
        const data = await studentsService.getStudents()
        setStudents(data.students)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {students.map(student => <div key={student.id}>{student.name}</div>)}
    </div>
  )
}
```

**After (Redux):**
```javascript
const StudentsComponent = () => {
  const dispatch = useDispatch()
  const { students, loading, error } = useSelector(state => state.students)

  useEffect(() => {
    dispatch(fetchStudents())
  }, [dispatch])

  return (
    <div>
      {loading.students && <div>Loading...</div>}
      {error.students && <div>Error: {error.students}</div>}
      {students.map(student => <div key={student.id}>{student.name}</div>)}
    </div>
  )
}
```

## Performance Considerations

### 1. Memoization

```javascript
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

const StudentsComponent = () => {
  const { students, filters } = useSelector(state => state.students)

  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(filters.search.toLowerCase())
    )
  }, [students, filters.search])

  return (
    <div>
      {filteredStudents.map(student => (
        <div key={student.id}>{student.name}</div>
      ))}
    </div>
  )
}
```

### 2. Selective Subscriptions

```javascript
// Good - only subscribe to needed data
const StudentsComponent = () => {
  const students = useSelector(state => state.students.students)
  const loading = useSelector(state => state.students.loading.students)
  
  // Component logic
}

// Bad - subscribes to entire students state
const StudentsComponent = () => {
  const studentsState = useSelector(state => state.students)
  const students = studentsState.students
  const loading = studentsState.loading.students
  
  // Component logic
}
```

## Troubleshooting

### Common Issues

1. **Actions not dispatching**: Make sure you're using `useDispatch()` hook
2. **State not updating**: Check if you're using `.unwrap()` for async actions
3. **Infinite re-renders**: Ensure dependencies in `useEffect` are correct
4. **Errors not clearing**: Use `clearError()` action when appropriate

### Debug Tools

```javascript
// Add Redux DevTools extension for debugging
const store = configureStore({
  reducer: {
    // your reducers
  },
  devTools: process.env.NODE_ENV !== 'production'
})
```

## Conclusion

This Redux implementation provides:

- ✅ **Centralized State Management**: All API data is managed in Redux store
- ✅ **Consistent Loading States**: Every async operation has loading indicators
- ✅ **Comprehensive Error Handling**: Errors are captured and can be displayed to users
- ✅ **Optimistic Updates**: UI updates immediately while API calls happen in background
- ✅ **Filter Management**: Search and filter state is persisted and managed centrally
- ✅ **Type Safety**: Well-defined state structure with TypeScript support
- ✅ **Testing Support**: Easy to test components and actions in isolation
- ✅ **Performance**: Selective subscriptions and memoization prevent unnecessary re-renders

The implementation follows Redux best practices and provides a solid foundation for scaling the application.
