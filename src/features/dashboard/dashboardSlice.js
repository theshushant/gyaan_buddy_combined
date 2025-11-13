import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import dashboardService from '../../services/dashboardService'

// Async thunks for dashboard API calls
export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchDashboardMetrics',
  async (role = 'principal', { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDashboardMetrics(role)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchProgressTrends = createAsyncThunk(
  'dashboard/fetchProgressTrends',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getProgressTrends(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchSubjectPerformance = createAsyncThunk(
  'dashboard/fetchSubjectPerformance',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getSubjectPerformance(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchClassDistribution = createAsyncThunk(
  'dashboard/fetchClassDistribution',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getClassDistribution()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchDashboardAlerts = createAsyncThunk(
  'dashboard/fetchDashboardAlerts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getAlerts(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentActivities(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchQuickSummary = createAsyncThunk(
  'dashboard/fetchQuickSummary',
  async (role = 'principal', { rejectWithValue }) => {
    try {
      const response = await dashboardService.getQuickSummary()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  metrics: [],
  progressTrends: null,
  subjectPerformance: null,
  classDistribution: null,
  alerts: [],
  recentActivities: [],
  quickSummary: [],
  loading: {
    metrics: false,
    progressTrends: false,
    subjectPerformance: false,
    classDistribution: false,
    alerts: false,
    recentActivities: false,
    quickSummary: false
  },
  error: {
    metrics: null,
    progressTrends: null,
    subjectPerformance: null,
    classDistribution: null,
    alerts: null,
    recentActivities: null,
    quickSummary: null
  },
  lastUpdated: null,
  filters: {
    dateRange: '30d',
    class: '',
    subject: '',
    grade: ''
  }
}

const dashboardSlice = createSlice({
  name: 'dashboard',
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
        dateRange: '30d',
        class: '',
        subject: '',
        grade: ''
      }
    },
    markAlertAsRead: (state, action) => {
      const alertId = action.payload
      const alert = state.alerts.find(alert => alert.id === alertId)
      if (alert) {
        alert.read = true
      }
    },
    markAllAlertsAsRead: (state) => {
      state.alerts.forEach(alert => {
        alert.read = true
      })
    },
    dismissAlert: (state, action) => {
      const alertId = action.payload
      state.alerts = state.alerts.filter(alert => alert.id !== alertId)
    },
    clearDashboard: (state) => {
      state.metrics = []
      state.progressTrends = null
      state.subjectPerformance = null
      state.classDistribution = null
      state.alerts = []
      state.recentActivities = []
      state.quickSummary = []
      state.lastUpdated = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard metrics
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading.metrics = true
        state.error.metrics = null
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading.metrics = false
        const response = action.payload.data || action.payload
        const metricsData = response.metrics || response
        state.metrics = Array.isArray(metricsData) ? metricsData : []
        
        // Extract quickSummary from the same response if available
        if (response.quickSummary) {
          state.quickSummary = Array.isArray(response.quickSummary) ? response.quickSummary : []
        }
        
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading.metrics = false
        state.error.metrics = action.payload
      })

      // Fetch progress trends
      .addCase(fetchProgressTrends.pending, (state) => {
        state.loading.progressTrends = true
        state.error.progressTrends = null
      })
      .addCase(fetchProgressTrends.fulfilled, (state, action) => {
        state.loading.progressTrends = false
        state.progressTrends = action.payload.data || action.payload
      })
      .addCase(fetchProgressTrends.rejected, (state, action) => {
        state.loading.progressTrends = false
        state.error.progressTrends = action.payload
      })

      // Fetch subject performance
      .addCase(fetchSubjectPerformance.pending, (state) => {
        state.loading.subjectPerformance = true
        state.error.subjectPerformance = null
      })
      .addCase(fetchSubjectPerformance.fulfilled, (state, action) => {
        state.loading.subjectPerformance = false
        state.subjectPerformance = action.payload.data || action.payload
      })
      .addCase(fetchSubjectPerformance.rejected, (state, action) => {
        state.loading.subjectPerformance = false
        state.error.subjectPerformance = action.payload
      })

      // Fetch class distribution
      .addCase(fetchClassDistribution.pending, (state) => {
        state.loading.classDistribution = true
        state.error.classDistribution = null
      })
      .addCase(fetchClassDistribution.fulfilled, (state, action) => {
        state.loading.classDistribution = false
        state.classDistribution = action.payload.data || action.payload
      })
      .addCase(fetchClassDistribution.rejected, (state, action) => {
        state.loading.classDistribution = false
        state.error.classDistribution = action.payload
      })

      // Fetch dashboard alerts
      .addCase(fetchDashboardAlerts.pending, (state) => {
        state.loading.alerts = true
        state.error.alerts = null
      })
      .addCase(fetchDashboardAlerts.fulfilled, (state, action) => {
        state.loading.alerts = false
        const alertsData = action.payload.data?.alerts || action.payload.alerts || action.payload
        state.alerts = Array.isArray(alertsData) ? alertsData : []
      })
      .addCase(fetchDashboardAlerts.rejected, (state, action) => {
        state.loading.alerts = false
        state.error.alerts = action.payload
      })

      // Fetch recent activities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.loading.recentActivities = true
        state.error.recentActivities = null
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.loading.recentActivities = false
        const activitiesData = action.payload.data?.activities || action.payload.activities || action.payload
        state.recentActivities = Array.isArray(activitiesData) ? activitiesData : []
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.loading.recentActivities = false
        state.error.recentActivities = action.payload
      })

      // Fetch quick summary
      .addCase(fetchQuickSummary.pending, (state) => {
        state.loading.quickSummary = true
        state.error.quickSummary = null
      })
      .addCase(fetchQuickSummary.fulfilled, (state, action) => {
        state.loading.quickSummary = false
        const quickSummaryData = action.payload.data?.quickSummary || action.payload.quickSummary || action.payload.summary || action.payload
        state.quickSummary = Array.isArray(quickSummaryData) ? quickSummaryData : []
      })
      .addCase(fetchQuickSummary.rejected, (state, action) => {
        state.loading.quickSummary = false
        state.error.quickSummary = action.payload
      })
  }
})

export const {
  clearError,
  setFilters,
  clearFilters,
  markAlertAsRead,
  markAllAlertsAsRead,
  dismissAlert,
  clearDashboard
} = dashboardSlice.actions

export default dashboardSlice.reducer
