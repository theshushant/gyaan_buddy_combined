import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import classesService from '../../services/classesService'

export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await classesService.getClasses(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchClassById = createAsyncThunk(
  'classes/fetchClassById',
  async (classId, { rejectWithValue }) => {
    try {
      const response = await classesService.getClassById(classId)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createClass = createAsyncThunk(
  'classes/createClass',
  async (classData, { rejectWithValue }) => {
    try {
      const response = await classesService.createClass(classData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateClass = createAsyncThunk(
  'classes/updateClass',
  async ({ classId, classData }, { rejectWithValue }) => {
    try {
      const response = await classesService.updateClass(classId, classData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  classes: [],
  currentClass: null,
  loading: {
    classes: false,
    currentClass: false,
    creating: false,
    updating: false
  },
  error: {
    classes: null,
    currentClass: null,
    creating: null,
    updating: null
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {
    search: '',
    grade: '',
    school: ''
  },
  summary: {
    totalClasses: 0,
    totalStudents: 0,
    averageScore: 0,
    activeClasses: 0
  }
}

const classesSlice = createSlice({
  name: 'classes',
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
        grade: '',
        school: ''
      }
    },
    clearCurrentClass: (state) => {
      state.currentClass = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.loading.classes = true
        state.error.classes = null
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading.classes = false
        console.log('Classes payload:', action.payload)
        
        if (Array.isArray(action.payload)) {
          state.classes = action.payload
          state.summary = calculateSummary(action.payload)
        } else if (action.payload && action.payload.classes && Array.isArray(action.payload.classes)) {
          state.classes = action.payload.classes
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination
          }
          if (action.payload.summary) {
            state.summary = action.payload.summary
          } else {
            state.summary = calculateSummary(action.payload.classes)
          }
        } else if (action.payload && action.payload.data) {
          const data = action.payload.data
          if (Array.isArray(data)) {
            state.classes = data
            state.summary = calculateSummary(data)
          } else if (data.classes && Array.isArray(data.classes)) {
            state.classes = data.classes
            if (data.pagination) {
              state.pagination = data.pagination
            }
            if (data.summary) {
              state.summary = data.summary
            } else {
              state.summary = calculateSummary(data.classes)
            }
          } else {
            state.classes = []
            state.summary = calculateSummary([])
          }
        } else {
          state.classes = []
          state.summary = calculateSummary([])
        }
        console.log('Classes after processing:', state.classes)
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading.classes = false
        state.error.classes = action.payload
      })

      .addCase(fetchClassById.pending, (state) => {
        state.loading.currentClass = true
        state.error.currentClass = null
      })
      .addCase(fetchClassById.fulfilled, (state, action) => {
        state.loading.currentClass = false
        state.currentClass = action.payload.data || action.payload.class || action.payload
      })
      .addCase(fetchClassById.rejected, (state, action) => {
        state.loading.currentClass = false
        state.error.currentClass = action.payload
      })

      .addCase(createClass.pending, (state) => {
        state.loading.creating = true
        state.error.creating = null
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.loading.creating = false
        console.log('Create class payload:', action.payload)
        
        let newClass = null
        if (action.payload && action.payload.data) {
          newClass = Array.isArray(action.payload.data) ? action.payload.data[0] : action.payload.data
        } else if (action.payload && action.payload.class) {
          newClass = action.payload.class
        } else if (Array.isArray(action.payload)) {
          newClass = action.payload[0]
        } else {
          newClass = action.payload
        }
        
        if (newClass) {
          state.classes.push(newClass)
          state.summary.totalClasses = state.classes.length
        }
      })
      .addCase(createClass.rejected, (state, action) => {
        state.loading.creating = false
        state.error.creating = action.payload
      })

      .addCase(updateClass.pending, (state) => {
        state.loading.updating = true
        state.error.updating = null
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        state.loading.updating = false
        console.log('Update class payload:', action.payload)
        
        let updatedClass = null
        if (action.payload && action.payload.data) {
          updatedClass = Array.isArray(action.payload.data) ? action.payload.data[0] : action.payload.data
        } else if (action.payload && action.payload.class) {
          updatedClass = action.payload.class
        } else if (Array.isArray(action.payload)) {
          updatedClass = action.payload[0]
        } else {
          updatedClass = action.payload
        }
        
        if (updatedClass && updatedClass.id) {
          const index = state.classes.findIndex(c => c.id === updatedClass.id || c.uuid === updatedClass.id)
          if (index !== -1) {
            state.classes[index] = updatedClass
          }
        }
      })
      .addCase(updateClass.rejected, (state, action) => {
        state.loading.updating = false
        state.error.updating = action.payload
      })
  }
})

function calculateSummary(classes) {
  if (!Array.isArray(classes) || classes.length === 0) {
    return {
      totalClasses: 0,
      totalStudents: 0,
      averageScore: 0,
      activeClasses: 0
    }
  }

  const totalClasses = classes.length
  const totalStudents = classes.reduce((sum, cls) => {
    return sum + (cls.students || cls.studentCount || 0)
  }, 0)
  
  const averageScore = classes.reduce((sum, cls) => {
    return sum + (cls.averageScore || 0)
  }, 0) / totalClasses
  
  const activeClasses = classes.filter(cls => {
    const status = cls.status || cls.active
    return status === 'active' || status === true || status === undefined
  }).length

  return {
    totalClasses,
    totalStudents,
    averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
    activeClasses
  }
}

export const {
  clearError,
  setFilters,
  clearFilters,
  clearCurrentClass
} = classesSlice.actions

export default classesSlice.reducer

