import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import studentsService from '../../services/studentsService'

// Async thunks for students API calls
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await studentsService.getStudents(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchStudentById = createAsyncThunk(
  'students/fetchStudentById',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await studentsService.getStudentById(studentId)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createStudent = createAsyncThunk(
  'students/createStudent',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await studentsService.createStudent(studentData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateStudent = createAsyncThunk(
  'students/updateStudent',
  async ({ studentId, studentData }, { rejectWithValue }) => {
    try {
      const response = await studentsService.updateStudent(studentId, studentData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteStudent = createAsyncThunk(
  'students/deleteStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await studentsService.deleteStudent(studentId)
      return { studentId, response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchStudentPerformance = createAsyncThunk(
  'students/fetchStudentPerformance',
  async ({ studentId, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await studentsService.getStudentPerformance(studentId, filters)
      return { studentId, performance: response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchStudentTestHistory = createAsyncThunk(
  'students/fetchStudentTestHistory',
  async ({ studentId, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await studentsService.getStudentTestHistory(studentId, filters)
      return { studentId, testHistory: response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchStudentsByClass = createAsyncThunk(
  'students/fetchStudentsByClass',
  async (className, { rejectWithValue }) => {
    try {
      const response = await studentsService.getStudentsByClass(className)
      return { className, students: response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchStudentStats = createAsyncThunk(
  'students/fetchStudentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentsService.getStudentStats()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchStudentProgressTrends = createAsyncThunk(
  'students/fetchStudentProgressTrends',
  async ({ studentId, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await studentsService.getStudentProgressTrends(studentId, filters)
      return { studentId, progressTrends: response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  students: [],
  currentStudent: null,
  studentStats: null,
  performance: {},
  testHistory: {},
  progressTrends: {},
  studentsByClass: {},
  loading: {
    students: false,
    currentStudent: false,
    stats: false,
    performance: false,
    testHistory: false,
    progressTrends: false,
    create: false,
    update: false,
    delete: false
  },
  error: {
    students: null,
    currentStudent: null,
    stats: null,
    performance: null,
    testHistory: null,
    progressTrends: null,
    create: null,
    update: null,
    delete: null
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {
    search: '',
    class: '',
    subject: ''
  }
}

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError: (state, action) => {
      const errorType = action.payload || 'all'
      if (errorType === 'all') {
        Object.keys(state.error).forEach(key => {
          state.error[key] = null
        })
      } else if (state.error[errorType] !== undefined) {
        state.error[errorType] = null
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        class: '',
        subject: ''
      }
    },
    clearCurrentStudent: (state) => {
      state.currentStudent = null
    },
    clearPerformance: (state, action) => {
      const studentId = action.payload
      if (studentId) {
        delete state.performance[studentId]
      } else {
        state.performance = {}
      }
    },
    clearTestHistory: (state, action) => {
      const studentId = action.payload
      if (studentId) {
        delete state.testHistory[studentId]
      } else {
        state.testHistory = {}
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch students
      .addCase(fetchStudents.pending, (state) => {
        state.loading.students = true
        state.error.students = null
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading.students = false
        console.log('Students payload:', action.payload)
        // Handle both array and object responses
        if (Array.isArray(action.payload)) {
          state.students = action.payload
        } else if (action.payload && action.payload.students && Array.isArray(action.payload.students)) {
          state.students = action.payload.students
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination
          }
          if (action.payload.summary) {
            state.summary = action.payload.summary
          }
        } else if (action.payload && action.payload.data) {
          // Handle nested data response
          const data = action.payload.data
          if (Array.isArray(data)) {
            state.students = data
          } else if (data.students && Array.isArray(data.students)) {
            state.students = data.students
            if (data.pagination) {
              state.pagination = data.pagination
            }
            if (data.summary) {
              state.summary = data.summary
            }
          } else {
            state.students = []
          }
        } else {
          state.students = []
        }
        console.log('Students after processing:', state.students)
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading.students = false
        state.error.students = action.payload
      })

      // Fetch student by ID
      .addCase(fetchStudentById.pending, (state) => {
        state.loading.currentStudent = true
        state.error.currentStudent = null
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.loading.currentStudent = false
        // Extract student data from response (handle different response structures)
        if (action.payload && action.payload.data) {
          state.currentStudent = Array.isArray(action.payload.data) ? action.payload.data[0] : action.payload.data
        } else {
          state.currentStudent = action.payload
        }
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loading.currentStudent = false
        state.error.currentStudent = action.payload
      })

      // Create student
      .addCase(createStudent.pending, (state) => {
        state.loading.create = true
        state.error.create = null
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.loading.create = false
        console.log('Create student payload:', action.payload)
        
        // Extract student data from response (handle different response structures)
        let newStudent = null
        if (action.payload && action.payload.data) {
          // Handle nested data response: { success: true, data: {...}, message: "..." }
          newStudent = Array.isArray(action.payload.data) ? action.payload.data[0] : action.payload.data
        } else if (action.payload && action.payload.student) {
          newStudent = action.payload.student
        } else if (Array.isArray(action.payload)) {
          newStudent = action.payload[0]
        } else {
          newStudent = action.payload
        }
        
        // Add new student to the list
        if (newStudent) {
          state.students.push(newStudent)
        }
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.loading.create = false
        state.error.create = action.payload
      })

      // Update student
      .addCase(updateStudent.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading.update = false
        // Extract student data from response (handle different response structures)
        let updatedStudent = null
        if (action.payload && action.payload.data) {
          updatedStudent = Array.isArray(action.payload.data) ? action.payload.data[0] : action.payload.data
        } else {
          updatedStudent = action.payload
        }
        
        if (updatedStudent && updatedStudent.id) {
          const index = state.students.findIndex(student => student.id === updatedStudent.id)
          if (index !== -1) {
            state.students[index] = updatedStudent
          }
          if (state.currentStudent && state.currentStudent.id === updatedStudent.id) {
            state.currentStudent = updatedStudent
          }
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.payload
      })

      // Delete student
      .addCase(deleteStudent.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading.delete = false
        state.students = state.students.filter(student => student.id !== action.payload.studentId)
        if (state.currentStudent && state.currentStudent.id === action.payload.studentId) {
          state.currentStudent = null
        }
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.payload
      })

      // Fetch student performance
      .addCase(fetchStudentPerformance.pending, (state) => {
        state.loading.performance = true
        state.error.performance = null
      })
      .addCase(fetchStudentPerformance.fulfilled, (state, action) => {
        state.loading.performance = false
        state.performance[action.payload.studentId] = action.payload.performance
      })
      .addCase(fetchStudentPerformance.rejected, (state, action) => {
        state.loading.performance = false
        state.error.performance = action.payload
      })

      // Fetch student test history
      .addCase(fetchStudentTestHistory.pending, (state) => {
        state.loading.testHistory = true
        state.error.testHistory = null
      })
      .addCase(fetchStudentTestHistory.fulfilled, (state, action) => {
        state.loading.testHistory = false
        state.testHistory[action.payload.studentId] = action.payload.testHistory
      })
      .addCase(fetchStudentTestHistory.rejected, (state, action) => {
        state.loading.testHistory = false
        state.error.testHistory = action.payload
      })

      // Fetch students by class
      .addCase(fetchStudentsByClass.fulfilled, (state, action) => {
        state.studentsByClass[action.payload.className] = action.payload.students
      })

      // Fetch student stats
      .addCase(fetchStudentStats.pending, (state) => {
        state.loading.stats = true
        state.error.stats = null
      })
      .addCase(fetchStudentStats.fulfilled, (state, action) => {
        state.loading.stats = false
        console.log('Student stats payload:', action.payload)
        // Handle different response structures
        state.studentStats = action.payload.data || action.payload
      })
      .addCase(fetchStudentStats.rejected, (state, action) => {
        state.loading.stats = false
        state.error.stats = action.payload
      })

      // Fetch student progress trends
      .addCase(fetchStudentProgressTrends.pending, (state) => {
        state.loading.progressTrends = true
        state.error.progressTrends = null
      })
      .addCase(fetchStudentProgressTrends.fulfilled, (state, action) => {
        state.loading.progressTrends = false
        state.progressTrends[action.payload.studentId] = action.payload.progressTrends
      })
      .addCase(fetchStudentProgressTrends.rejected, (state, action) => {
        state.loading.progressTrends = false
        state.error.progressTrends = action.payload
      })
  }
})

export const {
  clearError,
  setFilters,
  clearFilters,
  clearCurrentStudent,
  clearPerformance,
  clearTestHistory
} = studentsSlice.actions

export default studentsSlice.reducer
