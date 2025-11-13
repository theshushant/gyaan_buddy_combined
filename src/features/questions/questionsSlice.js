import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import questionsService from '../../services/questionsService'

// Async thunks for questions API calls
export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await questionsService.getQuestions(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchQuestionById = createAsyncThunk(
  'questions/fetchQuestionById',
  async (questionId, { rejectWithValue }) => {
    try {
      const response = await questionsService.getQuestionById(questionId)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createQuestion = createAsyncThunk(
  'questions/createQuestion',
  async (questionData, { rejectWithValue }) => {
    try {
      const response = await questionsService.createQuestion(questionData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateQuestion = createAsyncThunk(
  'questions/updateQuestion',
  async ({ questionId, questionData }, { rejectWithValue }) => {
    try {
      const response = await questionsService.updateQuestion(questionId, questionData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteQuestion = createAsyncThunk(
  'questions/deleteQuestion',
  async (questionId, { rejectWithValue }) => {
    try {
      const response = await questionsService.deleteQuestion(questionId)
      return { questionId, response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const generateAIQuestions = createAsyncThunk(
  'questions/generateAIQuestions',
  async (generationData, { rejectWithValue }) => {
    try {
      const response = await questionsService.generateAIQuestions(generationData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAIGeneratedQuestions = createAsyncThunk(
  'questions/fetchAIGeneratedQuestions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await questionsService.getAIGeneratedQuestions(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const saveAIQuestions = createAsyncThunk(
  'questions/saveAIQuestions',
  async (questionIds, { rejectWithValue }) => {
    try {
      const response = await questionsService.saveAIQuestions(questionIds)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchQuestionStats = createAsyncThunk(
  'questions/fetchQuestionStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await questionsService.getQuestionStats()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  questions: [],
  aiGeneratedQuestions: [],
  currentQuestion: null,
  questionStats: null,
  loading: {
    questions: false,
    currentQuestion: false,
    stats: false,
    aiGeneration: false,
    aiGenerated: false,
    create: false,
    update: false,
    delete: false,
    saveAI: false
  },
  error: {
    questions: null,
    currentQuestion: null,
    stats: null,
    aiGeneration: null,
    aiGenerated: null,
    create: null,
    update: null,
    delete: null,
    saveAI: null
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {
    type: '',
    difficulty: '',
    subject: '',
    grade: ''
  },
  availableFilters: {
    types: [],
    difficulties: [],
    subjects: [],
    grades: []
  }
}

const questionsSlice = createSlice({
  name: 'questions',
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
        type: '',
        difficulty: '',
        subject: '',
        grade: ''
      }
    },
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null
    },
    clearAIGeneratedQuestions: (state) => {
      state.aiGeneratedQuestions = []
    },
    selectAIQuestion: (state, action) => {
      const questionId = action.payload
      const question = state.aiGeneratedQuestions.find(q => q.id === questionId)
      if (question) {
        question.selected = !question.selected
      }
    },
    selectAllAIQuestions: (state) => {
      state.aiGeneratedQuestions.forEach(question => {
        question.selected = true
      })
    },
    deselectAllAIQuestions: (state) => {
      state.aiGeneratedQuestions.forEach(question => {
        question.selected = false
      })
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch questions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading.questions = true
        state.error.questions = null
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading.questions = false
        state.questions = action.payload.questions || action.payload
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
        if (action.payload.filters) {
          state.availableFilters = action.payload.filters
        }
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading.questions = false
        state.error.questions = action.payload
      })

      // Fetch question by ID
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading.currentQuestion = true
        state.error.currentQuestion = null
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.loading.currentQuestion = false
        state.currentQuestion = action.payload
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.loading.currentQuestion = false
        state.error.currentQuestion = action.payload
      })

      // Create question
      .addCase(createQuestion.pending, (state) => {
        state.loading.create = true
        state.error.create = null
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.loading.create = false
        state.questions.push(action.payload)
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading.create = false
        state.error.create = action.payload
      })

      // Update question
      .addCase(updateQuestion.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.questions.findIndex(question => question.id === action.payload.id)
        if (index !== -1) {
          state.questions[index] = action.payload
        }
        if (state.currentQuestion && state.currentQuestion.id === action.payload.id) {
          state.currentQuestion = action.payload
        }
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.payload
      })

      // Delete question
      .addCase(deleteQuestion.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.loading.delete = false
        state.questions = state.questions.filter(question => question.id !== action.payload.questionId)
        if (state.currentQuestion && state.currentQuestion.id === action.payload.questionId) {
          state.currentQuestion = null
        }
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.payload
      })

      // Generate AI questions
      .addCase(generateAIQuestions.pending, (state) => {
        state.loading.aiGeneration = true
        state.error.aiGeneration = null
      })
      .addCase(generateAIQuestions.fulfilled, (state, action) => {
        state.loading.aiGeneration = false
        state.aiGeneratedQuestions = action.payload.questions || action.payload
      })
      .addCase(generateAIQuestions.rejected, (state, action) => {
        state.loading.aiGeneration = false
        state.error.aiGeneration = action.payload
      })

      // Fetch AI generated questions
      .addCase(fetchAIGeneratedQuestions.pending, (state) => {
        state.loading.aiGenerated = true
        state.error.aiGenerated = null
      })
      .addCase(fetchAIGeneratedQuestions.fulfilled, (state, action) => {
        state.loading.aiGenerated = false
        state.aiGeneratedQuestions = action.payload.questions || action.payload
      })
      .addCase(fetchAIGeneratedQuestions.rejected, (state, action) => {
        state.loading.aiGenerated = false
        state.error.aiGenerated = action.payload
      })

      // Save AI questions
      .addCase(saveAIQuestions.pending, (state) => {
        state.loading.saveAI = true
        state.error.saveAI = null
      })
      .addCase(saveAIQuestions.fulfilled, (state, action) => {
        state.loading.saveAI = false
        // Remove saved questions from AI generated list
        const savedQuestionIds = action.payload.savedQuestionIds || action.payload
        state.aiGeneratedQuestions = state.aiGeneratedQuestions.filter(
          question => !savedQuestionIds.includes(question.id)
        )
      })
      .addCase(saveAIQuestions.rejected, (state, action) => {
        state.loading.saveAI = false
        state.error.saveAI = action.payload
      })

      // Fetch question stats
      .addCase(fetchQuestionStats.pending, (state) => {
        state.loading.stats = true
        state.error.stats = null
      })
      .addCase(fetchQuestionStats.fulfilled, (state, action) => {
        state.loading.stats = false
        state.questionStats = action.payload
      })
      .addCase(fetchQuestionStats.rejected, (state, action) => {
        state.loading.stats = false
        state.error.stats = action.payload
      })
  }
})

export const {
  clearError,
  setFilters,
  clearFilters,
  clearCurrentQuestion,
  clearAIGeneratedQuestions,
  selectAIQuestion,
  selectAllAIQuestions,
  deselectAllAIQuestions
} = questionsSlice.actions

export default questionsSlice.reducer
