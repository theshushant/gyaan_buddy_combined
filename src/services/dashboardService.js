// Dashboard API service
import apiService from './api';

class DashboardService {
  // Get dashboard metrics
  async getDashboardMetrics(role = 'principal') {
    try {
      return await apiService.requestWithMock(`/dashboard/metrics?role=${role}`);
    } catch (error) {
      throw new Error(`Failed to fetch dashboard metrics: ${error.message}`);
    }
  }

  // Get progress trends data
  async getProgressTrends(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/dashboard/progress-trends${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch progress trends: ${error.message}`);
    }
  }

  // Get subject performance data
  async getSubjectPerformance(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/dashboard/subject-performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch subject performance: ${error.message}`);
    }
  }

  // Get class distribution data
  async getClassDistribution() {
    try {
      return await apiService.requestWithMock('/dashboard/class-distribution');
    } catch (error) {
      throw new Error(`Failed to fetch class distribution: ${error.message}`);
    }
  }

  // Get quick summary data
  async getQuickSummary() {
    try {
      return await apiService.requestWithMock('/dashboard/quick-summary');
    } catch (error) {
      throw new Error(`Failed to fetch quick summary: ${error.message}`);
    }
  }

  // Get alerts and announcements
  async getAlerts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/dashboard/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch alerts: ${error.message}`);
    }
  }

  // Get teacher dashboard data
  async getTeacherDashboard(teacherId) {
    try {
      return await apiService.requestWithMock(`/dashboard/teacher/${teacherId}`);
    } catch (error) {
      throw new Error(`Failed to fetch teacher dashboard: ${error.message}`);
    }
  }

  // Get student dashboard data
  async getStudentDashboard(studentId) {
    try {
      return await apiService.requestWithMock(`/dashboard/student/${studentId}`);
    } catch (error) {
      throw new Error(`Failed to fetch student dashboard: ${error.message}`);
    }
  }

  // Get recent activities
  async getRecentActivities(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/dashboard/recent-activities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch recent activities: ${error.message}`);
    }
  }
}

export default new DashboardService();
