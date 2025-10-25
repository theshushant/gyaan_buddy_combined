// Reports API service
import apiService from './api';

class ReportsService {
  // Get student performance reports
  async getStudentPerformanceReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.studentId) queryParams.append('studentId', filters.studentId);

      const endpoint = `/reports/student-performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch student performance reports: ${error.message}`);
    }
  }

  // Get progress over time reports
  async getProgressOverTimeReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/reports/progress-over-time${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch progress over time reports: ${error.message}`);
    }
  }

  // Get quiz/assignment summaries
  async getQuizAssignmentSummaries(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.type) queryParams.append('type', filters.type);

      const endpoint = `/reports/quiz-assignment-summaries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch quiz/assignment summaries: ${error.message}`);
    }
  }

  // Get AI insights reports
  async getAIInsightsReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/reports/ai-insights${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch AI insights reports: ${error.message}`);
    }
  }

  // Get analytics data
  async getAnalyticsData(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.metric) queryParams.append('metric', filters.metric);

      const endpoint = `/reports/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch analytics data: ${error.message}`);
    }
  }

  // Generate custom report
  async generateCustomReport(reportConfig) {
    try {
      return await apiService.requestWithMock('/reports/generate', {
        method: 'POST',
        body: reportConfig,
      });
    } catch (error) {
      throw new Error(`Failed to generate custom report: ${error.message}`);
    }
  }

  // Export report
  async exportReport(reportId, format = 'pdf') {
    try {
      return await apiService.requestWithMock(`/reports/${reportId}/export?format=${format}`);
    } catch (error) {
      throw new Error(`Failed to export report: ${error.message}`);
    }
  }

  // Get report templates
  async getReportTemplates() {
    try {
      return await apiService.requestWithMock('/reports/templates');
    } catch (error) {
      throw new Error(`Failed to fetch report templates: ${error.message}`);
    }
  }

  // Save report configuration
  async saveReportConfiguration(config) {
    try {
      return await apiService.requestWithMock('/reports/configurations', {
        method: 'POST',
        body: config,
      });
    } catch (error) {
      throw new Error(`Failed to save report configuration: ${error.message}`);
    }
  }
}

export default new ReportsService();
