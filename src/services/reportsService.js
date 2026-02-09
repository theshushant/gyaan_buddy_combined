import apiService from './api';

class ReportsService {
  async getStudentPerformanceReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.studentId) queryParams.append('studentId', filters.studentId);

      const endpoint = `/reports/student-performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch student performance reports: ${error.message}`);
    }
  }

  async getProgressOverTimeReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/reports/progress-over-time${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch progress over time reports: ${error.message}`);
    }
  }

  async getQuizAssignmentSummaries(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.type) queryParams.append('type', filters.type);

      const endpoint = `/reports/quiz-assignment-summaries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch quiz/assignment summaries: ${error.message}`);
    }
  }

  async getAIInsightsReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/reports/ai-insights${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch AI insights reports: ${error.message}`);
    }
  }

  async getAnalyticsData(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.metric) queryParams.append('metric', filters.metric);

      const endpoint = `/reports/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch analytics data: ${error.message}`);
    }
  }

  async generateCustomReport(reportConfig) {
    try {
      const response = await apiService.post('/reports/generate', reportConfig);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to generate custom report: ${error.message}`);
    }
  }

  async exportReport(reportId, format = 'pdf') {
    try {
      const response = await apiService.get(`/reports/${reportId}/export?format=${format}`);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to export report: ${error.message}`);
    }
  }

  async getReportTemplates() {
    try {
      const response = await apiService.get('/reports/templates');
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch report templates: ${error.message}`);
    }
  }

  async saveReportConfiguration(config) {
    try {
      const response = await apiService.post('/reports/configurations', config);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to save report configuration: ${error.message}`);
    }
  }
}

export default new ReportsService();
