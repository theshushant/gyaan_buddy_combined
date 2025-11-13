import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import teachersService from '../../services/teachersService'

// Async thunks for teachers API calls
export const fetchTeachers = createAsyncThunk(
  'teachers/fetchTeachers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await teachersService.getTeachers(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchTeacherById = createAsyncThunk(
  'teachers/fetchTeacherById',
  async (teacherId, { rejectWithValue }) => {
    try {
      const response = await teachersService.getTeacherById(teacherId)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createTeacher = createAsyncThunk(
  'teachers/createTeacher',
  async (teacherData, { rejectWithValue }) => {
    try {
      const response = await teachersService.createTeacher(teacherData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateTeacher = createAsyncThunk(
  'teachers/updateTeacher',
  async ({ teacherId, teacherData }, { rejectWithValue }) => {
    try {
      const response = await teachersService.updateTeacher(teacherId, teacherData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteTeacher = createAsyncThunk(
  'teachers/deleteTeacher',
  async (teacherId, { rejectWithValue }) => {
    try {
      const response = await teachersService.deleteTeacher(teacherId)
      return { teacherId, response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchTeacherClasses = createAsyncThunk(
  'teachers/fetchTeacherClasses',
  async (teacherId, { rejectWithValue }) => {
    try {
      const response = await teachersService.getTeacherClasses(teacherId)
      // Handle different response formats
      let classesData = []
      if (Array.isArray(response)) {
        classesData = response
      } else if (response && Array.isArray(response.data)) {
        classesData = response.data
      } else if (response && Array.isArray(response.classes)) {
        classesData = response.classes
      } else if (response && response.data && Array.isArray(response.data.classes)) {
        classesData = response.data.classes
      }
      return { teacherId, classes: classesData }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchTeacherPerformance = createAsyncThunk(
  'teachers/fetchTeacherPerformance',
  async (teacherId, { rejectWithValue }) => {
    try {
      const response = await teachersService.getTeacherPerformance(teacherId)
      return { teacherId, performance: response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchTeacherStats = createAsyncThunk(
  'teachers/fetchTeacherStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await teachersService.getTeacherStats()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  teachers: [],
  currentTeacher: null,
  teacherStats: null,
  classes: {},
  performance: {},
  loading: {
    teachers: false,
    currentTeacher: false,
    stats: false,
    classes: false,
    performance: false,
    create: false,
    update: false,
    delete: false
  },
  error: {
    teachers: null,
    currentTeacher: null,
    stats: null,
    classes: null,
    performance: null,
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
    subject: ''
  }
}

const teachersSlice = createSlice({
  name: 'teachers',
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
        subject: ''
      }
    },
    clearCurrentTeacher: (state) => {
      state.currentTeacher = null
    },
    clearClasses: (state, action) => {
      const teacherId = action.payload
      if (teacherId) {
        delete state.classes[teacherId]
      } else {
        state.classes = {}
      }
    },
    clearPerformance: (state, action) => {
      const teacherId = action.payload
      if (teacherId) {
        delete state.performance[teacherId]
      } else {
        state.performance = {}
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch teachers
      .addCase(fetchTeachers.pending, (state) => {
        state.loading.teachers = true
        state.error.teachers = null
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading.teachers = false
        // Handle both array and object responses
        // Backend returns: { success: true, message: "...", data: [...] }
        let teachersData = []
        
        if (Array.isArray(action.payload)) {
          teachersData = action.payload
        } else if (action.payload.data && Array.isArray(action.payload.data)) {
          // Handle backend response format: { success: true, data: [...] }
          teachersData = action.payload.data
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination
          }
          if (action.payload.summary) {
            state.summary = action.payload.summary
          }
        } else if (action.payload.teachers && Array.isArray(action.payload.teachers)) {
          // Handle alternative response format: { teachers: [...] }
          teachersData = action.payload.teachers
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination
          }
          if (action.payload.summary) {
            state.summary = action.payload.summary
          }
        }
        
        // Transform backend fields to frontend format
        state.teachers = teachersData.map(teacher => ({
          id: teacher.id,
          firstName: teacher.firstName || teacher.first_name || '',
          lastName: teacher.lastName || teacher.last_name || '',
          email: teacher.email || '',
          username: teacher.username || '',
          subject: teacher.subject || teacher.user_type || 'Teacher',
          dashboardUsage: teacher.dashboardUsage || teacher.dashboard_usage || 0,
          overallMastery: teacher.overallMastery || teacher.overall_mastery || 0,
          studentsCount: teacher.studentsCount || teacher.students_count || 0,
          averageClassScore: teacher.averageClassScore || teacher.average_class_score || 0,
          classes: teacher.classes || teacher.class_list || [],
          userType: teacher.userType || teacher.user_type || 'teacher',
          schoolName: teacher.schoolName || teacher.school_name || '',
          isActive: teacher.isActive !== undefined ? teacher.isActive : teacher.is_active !== undefined ? teacher.is_active : true,
          // Include all original fields as well for backward compatibility
          ...teacher
        }))
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading.teachers = false
        state.error.teachers = action.payload
      })

      // Fetch teacher by ID
      .addCase(fetchTeacherById.pending, (state) => {
        state.loading.currentTeacher = true
        state.error.currentTeacher = null
      })
      .addCase(fetchTeacherById.fulfilled, (state, action) => {
        state.loading.currentTeacher = false
        // Handle backend response format: { success: true, data: {...}, message: "..." }
        // Extract data if it exists, otherwise use payload directly
        const teacherData = action.payload.data || action.payload
        state.currentTeacher = teacherData
      })
      .addCase(fetchTeacherById.rejected, (state, action) => {
        state.loading.currentTeacher = false
        state.error.currentTeacher = action.payload
      })

      // Create teacher
      .addCase(createTeacher.pending, (state) => {
        state.loading.create = true
        state.error.create = null
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.loading.create = false
        // Handle backend response format: { success: true, data: {...}, message: "..." }
        const teacherData = action.payload.data || action.payload
        state.teachers.push(teacherData)
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.loading.create = false
        state.error.create = action.payload
      })

      // Update teacher
      .addCase(updateTeacher.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        state.loading.update = false
        // Handle backend response format: { success: true, data: {...}, message: "..." }
        const teacherData = action.payload.data || action.payload
        const index = state.teachers.findIndex(teacher => teacher.id === teacherData.id)
        if (index !== -1) {
          state.teachers[index] = teacherData
        }
        if (state.currentTeacher && state.currentTeacher.id === teacherData.id) {
          state.currentTeacher = teacherData
        }
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.payload
      })

      // Delete teacher
      .addCase(deleteTeacher.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.loading.delete = false
        state.teachers = state.teachers.filter(teacher => teacher.id !== action.payload.teacherId)
        if (state.currentTeacher && state.currentTeacher.id === action.payload.teacherId) {
          state.currentTeacher = null
        }
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.payload
      })

      // Fetch teacher classes
      .addCase(fetchTeacherClasses.pending, (state) => {
        state.loading.classes = true
        state.error.classes = null
      })
      .addCase(fetchTeacherClasses.fulfilled, (state, action) => {
        state.loading.classes = false
        // Handle different response formats
        let classesData = action.payload.classes
        if (Array.isArray(classesData)) {
          state.classes[action.payload.teacherId] = classesData
        } else if (classesData && classesData.data && Array.isArray(classesData.data)) {
          state.classes[action.payload.teacherId] = classesData.data
        } else if (Array.isArray(action.payload.classes)) {
          state.classes[action.payload.teacherId] = action.payload.classes
        } else {
          state.classes[action.payload.teacherId] = []
        }
      })
      .addCase(fetchTeacherClasses.rejected, (state, action) => {
        state.loading.classes = false
        state.error.classes = action.payload
      })

      // Fetch teacher performance
      .addCase(fetchTeacherPerformance.pending, (state) => {
        state.loading.performance = true
        state.error.performance = null
      })
      .addCase(fetchTeacherPerformance.fulfilled, (state, action) => {
        state.loading.performance = false
        state.performance[action.payload.teacherId] = action.payload.performance
      })
      .addCase(fetchTeacherPerformance.rejected, (state, action) => {
        state.loading.performance = false
        state.error.performance = action.payload
      })

      // Fetch teacher stats
      .addCase(fetchTeacherStats.pending, (state) => {
        state.loading.stats = true
        state.error.stats = null
      })
      .addCase(fetchTeacherStats.fulfilled, (state, action) => {
        state.loading.stats = false
        state.teacherStats = action.payload
      })
      .addCase(fetchTeacherStats.rejected, (state, action) => {
        state.loading.stats = false
        state.error.stats = action.payload
      })
  }
})

export const {
  clearError,
  setFilters,
  clearFilters,
  clearCurrentTeacher,
  clearClasses,
  clearPerformance
} = teachersSlice.actions

export default teachersSlice.reducer
