import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import subjectsService from '../../services/subjectsService'

// Async thunks for subjects API calls
export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await subjectsService.getSubjects(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchSubjectById = createAsyncThunk(
  'subjects/fetchSubjectById',
  async (subjectId, { rejectWithValue }) => {
    try {
      const response = await subjectsService.getSubjectById(subjectId)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  subjects: [],
  currentSubject: null,
  loading: {
    subjects: false,
    currentSubject: false
  },
  error: {
    subjects: null,
    currentSubject: null
  }
}

const subjectsSlice = createSlice({
  name: 'subjects',
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
    clearCurrentSubject: (state) => {
      state.currentSubject = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch subjects
      .addCase(fetchSubjects.pending, (state) => {
        state.loading.subjects = true
        state.error.subjects = null
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading.subjects = false
        console.log('Subjects payload:', action.payload)
        
        // Handle different response structures
        if (Array.isArray(action.payload)) {
          state.subjects = action.payload
        } else if (action.payload && action.payload.subjects && Array.isArray(action.payload.subjects)) {
          state.subjects = action.payload.subjects
        } else if (action.payload && action.payload.data) {
          const data = action.payload.data
          if (Array.isArray(data)) {
            state.subjects = data
          } else if (data.subjects && Array.isArray(data.subjects)) {
            state.subjects = data.subjects
          } else {
            state.subjects = []
          }
        } else {
          state.subjects = []
        }
        console.log('Subjects after processing:', state.subjects)
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading.subjects = false
        state.error.subjects = action.payload
      })

      // Fetch subject by ID
      .addCase(fetchSubjectById.pending, (state) => {
        state.loading.currentSubject = true
        state.error.currentSubject = null
      })
      .addCase(fetchSubjectById.fulfilled, (state, action) => {
        state.loading.currentSubject = false
        state.currentSubject = action.payload.data || action.payload.subject || action.payload
      })
      .addCase(fetchSubjectById.rejected, (state, action) => {
        state.loading.currentSubject = false
        state.error.currentSubject = action.payload
      })
  }
})

export const {
  clearError,
  clearCurrentSubject
} = subjectsSlice.actions

export default subjectsSlice.reducer

