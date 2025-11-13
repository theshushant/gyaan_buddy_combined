import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import reportsService from '../../services/reportsService'

// Async thunks for reports API calls
export const fetchStudentPerformanceReport = createAsyncThunk(
  'reports/fetchStudentPerformanceReport',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await reportsService.getStudentPerformanceReports(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchProgressOverTimeReport = createAsyncThunk(
  'reports/fetchProgressOverTimeReport',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await reportsService.getProgressOverTimeReports(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchQuizAssignmentSummaries = createAsyncThunk(
  'reports/fetchQuizAssignmentSummaries',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await reportsService.getQuizAssignmentSummaries(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAIInsightsReport = createAsyncThunk(
  'reports/fetchAIInsightsReport',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await reportsService.getAIInsightsReports(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAnalyticsReport = createAsyncThunk(
  'reports/fetchAnalyticsReport',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await reportsService.getAnalyticsData(filters)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const generateCustomReport = createAsyncThunk(
  'reports/generateCustomReport',
  async (reportConfig, { rejectWithValue }) => {
    try {
      const response = await reportsService.generateCustomReport(reportConfig)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchReportTemplates = createAsyncThunk(
  'reports/fetchReportTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportsService.getReportTemplates()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const exportReport = createAsyncThunk(
  'reports/exportReport',
  async ({ reportId, format = 'pdf' }, { rejectWithValue }) => {
    try {
      const response = await reportsService.exportReport(reportId, format)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  studentPerformanceReport: null,
  progressOverTimeReport: null,
  quizAssignmentSummaries: null,
  aiInsightsReport: null,
  analyticsReport: null,
  customReports: [],
  reportTemplates: [],
  loading: {
    studentPerformance: false,
    progressOverTime: false,
    quizAssignmentSummaries: false,
    aiInsights: false,
    analytics: false,
    customReport: false,
    templates: false,
    export: false
  },
  error: {
    studentPerformance: null,
    progressOverTime: null,
    quizAssignmentSummaries: null,
    aiInsights: null,
    analytics: null,
    customReport: null,
    templates: null,
    export: null
  },
  filters: {
    dateRange: '30d',
    class: '',
    subject: '',
    grade: '',
    studentId: '',
    reportType: ''
  },
  exportStatus: {
    isExporting: false,
    exportProgress: 0,
    exportUrl: null
  }
}

const reportsSlice = createSlice({
  name: 'reports',
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
        grade: '',
        studentId: '',
        reportType: ''
      }
    },
    clearReports: (state) => {
      state.studentPerformanceReport = null
      state.progressOverTimeReport = null
      state.quizAssignmentSummaries = null
      state.aiInsightsReport = null
      state.analyticsReport = null
      state.customReports = []
    },
    clearCustomReports: (state) => {
      state.customReports = []
    },
    removeCustomReport: (state, action) => {
      const reportId = action.payload
      state.customReports = state.customReports.filter(report => report.id !== reportId)
    },
    setExportStatus: (state, action) => {
      state.exportStatus = { ...state.exportStatus, ...action.payload }
    },
    clearExportStatus: (state) => {
      state.exportStatus = {
        isExporting: false,
        exportProgress: 0,
        exportUrl: null
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch student performance report
      .addCase(fetchStudentPerformanceReport.pending, (state) => {
        state.loading.studentPerformance = true
        state.error.studentPerformance = null
      })
      .addCase(fetchStudentPerformanceReport.fulfilled, (state, action) => {
        state.loading.studentPerformance = false
        state.studentPerformanceReport = action.payload
      })
      .addCase(fetchStudentPerformanceReport.rejected, (state, action) => {
        state.loading.studentPerformance = false
        state.error.studentPerformance = action.payload
      })

      // Fetch progress over time report
      .addCase(fetchProgressOverTimeReport.pending, (state) => {
        state.loading.progressOverTime = true
        state.error.progressOverTime = null
      })
      .addCase(fetchProgressOverTimeReport.fulfilled, (state, action) => {
        state.loading.progressOverTime = false
        state.progressOverTimeReport = action.payload
      })
      .addCase(fetchProgressOverTimeReport.rejected, (state, action) => {
        state.loading.progressOverTime = false
        state.error.progressOverTime = action.payload
      })

      // Fetch quiz assignment summaries
      .addCase(fetchQuizAssignmentSummaries.pending, (state) => {
        state.loading.quizAssignmentSummaries = true
        state.error.quizAssignmentSummaries = null
      })
      .addCase(fetchQuizAssignmentSummaries.fulfilled, (state, action) => {
        state.loading.quizAssignmentSummaries = false
        state.quizAssignmentSummaries = action.payload
      })
      .addCase(fetchQuizAssignmentSummaries.rejected, (state, action) => {
        state.loading.quizAssignmentSummaries = false
        state.error.quizAssignmentSummaries = action.payload
      })

      // Fetch AI insights report
      .addCase(fetchAIInsightsReport.pending, (state) => {
        state.loading.aiInsights = true
        state.error.aiInsights = null
      })
      .addCase(fetchAIInsightsReport.fulfilled, (state, action) => {
        state.loading.aiInsights = false
        state.aiInsightsReport = action.payload
      })
      .addCase(fetchAIInsightsReport.rejected, (state, action) => {
        state.loading.aiInsights = false
        state.error.aiInsights = action.payload
      })

      // Fetch analytics report
      .addCase(fetchAnalyticsReport.pending, (state) => {
        state.loading.analytics = true
        state.error.analytics = null
      })
      .addCase(fetchAnalyticsReport.fulfilled, (state, action) => {
        state.loading.analytics = false
        state.analyticsReport = action.payload
      })
      .addCase(fetchAnalyticsReport.rejected, (state, action) => {
        state.loading.analytics = false
        state.error.analytics = action.payload
      })

      // Generate custom report
      .addCase(generateCustomReport.pending, (state) => {
        state.loading.customReport = true
        state.error.customReport = null
      })
      .addCase(generateCustomReport.fulfilled, (state, action) => {
        state.loading.customReport = false
        state.customReports.push(action.payload)
      })
      .addCase(generateCustomReport.rejected, (state, action) => {
        state.loading.customReport = false
        state.error.customReport = action.payload
      })

      // Fetch report templates
      .addCase(fetchReportTemplates.pending, (state) => {
        state.loading.templates = true
        state.error.templates = null
      })
      .addCase(fetchReportTemplates.fulfilled, (state, action) => {
        state.loading.templates = false
        state.reportTemplates = action.payload.templates || action.payload
      })
      .addCase(fetchReportTemplates.rejected, (state, action) => {
        state.loading.templates = false
        state.error.templates = action.payload
      })

      // Export report
      .addCase(exportReport.pending, (state) => {
        state.loading.export = true
        state.error.export = null
        state.exportStatus.isExporting = true
        state.exportStatus.exportProgress = 0
      })
      .addCase(exportReport.fulfilled, (state, action) => {
        state.loading.export = false
        state.exportStatus.isExporting = false
        state.exportStatus.exportProgress = 100
        state.exportStatus.exportUrl = action.payload.downloadUrl || action.payload
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.loading.export = false
        state.error.export = action.payload
        state.exportStatus.isExporting = false
        state.exportStatus.exportProgress = 0
      })
  }
})

export const {
  clearError,
  setFilters,
  clearFilters,
  clearReports,
  clearCustomReports,
  removeCustomReport,
  setExportStatus,
  clearExportStatus
} = reportsSlice.actions

export default reportsSlice.reducer
