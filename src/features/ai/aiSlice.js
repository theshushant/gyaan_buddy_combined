import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import aiService from '../../services/aiService'

// Async thunks for AI API calls
export const fetchAISuggestions = createAsyncThunk(
  'ai/fetchAISuggestions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await aiService.getAISuggestions(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAIInsights = createAsyncThunk(
  'ai/fetchAIInsights',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await aiService.getAIInsights(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const generateAIContent = createAsyncThunk(
  'ai/generateAIContent',
  async (contentData, { rejectWithValue }) => {
    try {
      const response = await aiService.generateAIContent(contentData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAIRecommendations = createAsyncThunk(
  'ai/fetchAIRecommendations',
  async ({ type, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await aiService.getAIRecommendations(type, filters)
      return { type, recommendations: response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAIHeatmap = createAsyncThunk(
  'ai/fetchAIHeatmap',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await aiService.getAIHeatmap(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchRemedialActivities = createAsyncThunk(
  'ai/fetchRemedialActivities',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await aiService.getRemedialActivities(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const analyzeStudentPerformance = createAsyncThunk(
  'ai/analyzeStudentPerformance',
  async ({ studentId, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await aiService.analyzeStudentPerformance(studentId, filters)
      return { studentId, analysis: response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const generatePersonalizedContent = createAsyncThunk(
  'ai/generatePersonalizedContent',
  async ({ studentId, contentType, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await aiService.generatePersonalizedContent(studentId, contentType, filters)
      return { studentId, contentType, content: response }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  suggestions: [],
  insights: null,
  generatedContent: null,
  recommendations: {},
  heatmap: null,
  remedialActivities: [],
  studentAnalysis: {},
  personalizedContent: {},
  loading: {
    suggestions: false,
    insights: false,
    contentGeneration: false,
    recommendations: false,
    heatmap: false,
    remedialActivities: false,
    analysis: false,
    personalizedContent: false
  },
  error: {
    suggestions: null,
    insights: null,
    contentGeneration: null,
    recommendations: null,
    heatmap: null,
    remedialActivities: null,
    analysis: null,
    personalizedContent: null
  },
  filters: {
    category: '',
    priority: '',
    class: '',
    subject: '',
    studentId: '',
    contentType: ''
  },
  categories: [],
  priorities: [],
  generationHistory: []
}

const aiSlice = createSlice({
  name: 'ai',
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
        category: '',
        priority: '',
        class: '',
        subject: '',
        studentId: '',
        contentType: ''
      }
    },
    clearSuggestions: (state) => {
      state.suggestions = []
    },
    clearInsights: (state) => {
      state.insights = null
    },
    clearGeneratedContent: (state) => {
      state.generatedContent = null
    },
    clearRecommendations: (state, action) => {
      const type = action.payload
      if (type) {
        delete state.recommendations[type]
      } else {
        state.recommendations = {}
      }
    },
    clearHeatmap: (state) => {
      state.heatmap = null
    },
    clearRemedialActivities: (state) => {
      state.remedialActivities = []
    },
    clearStudentAnalysis: (state, action) => {
      const studentId = action.payload
      if (studentId) {
        delete state.studentAnalysis[studentId]
      } else {
        state.studentAnalysis = {}
      }
    },
    clearPersonalizedContent: (state, action) => {
      const studentId = action.payload
      if (studentId) {
        delete state.personalizedContent[studentId]
      } else {
        state.personalizedContent = {}
      }
    },
    addToGenerationHistory: (state, action) => {
      state.generationHistory.unshift(action.payload)
      // Keep only last 50 generations
      if (state.generationHistory.length > 50) {
        state.generationHistory = state.generationHistory.slice(0, 50)
      }
    },
    clearGenerationHistory: (state) => {
      state.generationHistory = []
    },
    markSuggestionAsApplied: (state, action) => {
      const suggestionId = action.payload
      const suggestion = state.suggestions.find(s => s.id === suggestionId)
      if (suggestion) {
        suggestion.status = 'applied'
        suggestion.appliedAt = new Date().toISOString()
      }
    },
    markSuggestionAsDismissed: (state, action) => {
      const suggestionId = action.payload
      const suggestion = state.suggestions.find(s => s.id === suggestionId)
      if (suggestion) {
        suggestion.status = 'dismissed'
        suggestion.dismissedAt = new Date().toISOString()
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch AI suggestions
      .addCase(fetchAISuggestions.pending, (state) => {
        state.loading.suggestions = true
        state.error.suggestions = null
      })
      .addCase(fetchAISuggestions.fulfilled, (state, action) => {
        state.loading.suggestions = false
        state.suggestions = action.payload.suggestions || action.payload
        if (action.payload.categories) {
          state.categories = action.payload.categories
        }
        if (action.payload.priorities) {
          state.priorities = action.payload.priorities
        }
      })
      .addCase(fetchAISuggestions.rejected, (state, action) => {
        state.loading.suggestions = false
        state.error.suggestions = action.payload
      })

      // Fetch AI insights
      .addCase(fetchAIInsights.pending, (state) => {
        state.loading.insights = true
        state.error.insights = null
      })
      .addCase(fetchAIInsights.fulfilled, (state, action) => {
        state.loading.insights = false
        state.insights = action.payload
      })
      .addCase(fetchAIInsights.rejected, (state, action) => {
        state.loading.insights = false
        state.error.insights = action.payload
      })

      // Generate AI content
      .addCase(generateAIContent.pending, (state) => {
        state.loading.contentGeneration = true
        state.error.contentGeneration = null
      })
      .addCase(generateAIContent.fulfilled, (state, action) => {
        state.loading.contentGeneration = false
        state.generatedContent = action.payload
      })
      .addCase(generateAIContent.rejected, (state, action) => {
        state.loading.contentGeneration = false
        state.error.contentGeneration = action.payload
      })

      // Fetch AI recommendations
      .addCase(fetchAIRecommendations.pending, (state) => {
        state.loading.recommendations = true
        state.error.recommendations = null
      })
      .addCase(fetchAIRecommendations.fulfilled, (state, action) => {
        state.loading.recommendations = false
        state.recommendations[action.payload.type] = action.payload.recommendations
      })
      .addCase(fetchAIRecommendations.rejected, (state, action) => {
        state.loading.recommendations = false
        state.error.recommendations = action.payload
      })

      // Fetch AI heatmap
      .addCase(fetchAIHeatmap.pending, (state) => {
        state.loading.heatmap = true
        state.error.heatmap = null
      })
      .addCase(fetchAIHeatmap.fulfilled, (state, action) => {
        state.loading.heatmap = false
        state.heatmap = action.payload
      })
      .addCase(fetchAIHeatmap.rejected, (state, action) => {
        state.loading.heatmap = false
        state.error.heatmap = action.payload
      })

      // Fetch remedial activities
      .addCase(fetchRemedialActivities.pending, (state) => {
        state.loading.remedialActivities = true
        state.error.remedialActivities = null
      })
      .addCase(fetchRemedialActivities.fulfilled, (state, action) => {
        state.loading.remedialActivities = false
        state.remedialActivities = action.payload.activities || action.payload
      })
      .addCase(fetchRemedialActivities.rejected, (state, action) => {
        state.loading.remedialActivities = false
        state.error.remedialActivities = action.payload
      })

      // Analyze student performance
      .addCase(analyzeStudentPerformance.pending, (state) => {
        state.loading.analysis = true
        state.error.analysis = null
      })
      .addCase(analyzeStudentPerformance.fulfilled, (state, action) => {
        state.loading.analysis = false
        state.studentAnalysis[action.payload.studentId] = action.payload.analysis
      })
      .addCase(analyzeStudentPerformance.rejected, (state, action) => {
        state.loading.analysis = false
        state.error.analysis = action.payload
      })

      // Generate personalized content
      .addCase(generatePersonalizedContent.pending, (state) => {
        state.loading.personalizedContent = true
        state.error.personalizedContent = null
      })
      .addCase(generatePersonalizedContent.fulfilled, (state, action) => {
        state.loading.personalizedContent = false
        const key = `${action.payload.studentId}_${action.payload.contentType}`
        state.personalizedContent[key] = action.payload.content
      })
      .addCase(generatePersonalizedContent.rejected, (state, action) => {
        state.loading.personalizedContent = false
        state.error.personalizedContent = action.payload
      })
  }
})

export const {
  clearError,
  setFilters,
  clearFilters,
  clearSuggestions,
  clearInsights,
  clearGeneratedContent,
  clearRecommendations,
  clearHeatmap,
  clearRemedialActivities,
  clearStudentAnalysis,
  clearPersonalizedContent,
  addToGenerationHistory,
  clearGenerationHistory,
  markSuggestionAsApplied,
  markSuggestionAsDismissed
} = aiSlice.actions

export default aiSlice.reducer
