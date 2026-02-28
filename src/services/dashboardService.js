import apiService from './api';

class DashboardService {
  async getDashboardMetrics(role = 'principal', filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('role', role);
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      const endpoint = `/dashboard/metrics?${queryParams.toString()}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch dashboard metrics: ${error.message}`);
    }
  }

  async getProgressTrends(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/dashboard/progress-trends${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch progress trends: ${error.message}`);
    }
  }

  async getSubjectPerformance(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/dashboard/subject-performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch subject performance: ${error.message}`);
    }
  }

  async getClassDistribution() {
    try {
      return await apiService.get('/dashboard/class-distribution');
    } catch (error) {
      throw new Error(`Failed to fetch class distribution: ${error.message}`);
    }
  }

  async getQuickSummary(role = 'principal', filters = {}) {
    try {
      return await this.getDashboardMetrics(role, filters);
    } catch (error) {
      throw new Error(`Failed to fetch quick summary: ${error.message}`);
    }
  }

  async getAlerts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/dashboard/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch alerts: ${error.message}`);
    }
  }

  async getTeacherDashboard(teacherId) {
    try {
      return await apiService.get(`/dashboard/metrics?role=teacher`);
    } catch (error) {
      throw new Error(`Failed to fetch teacher dashboard: ${error.message}`);
    }
  }

  async getStudentDashboard(studentId) {
    try {
      return await apiService.get(`/dashboard/metrics?role=student`);
    } catch (error) {
      throw new Error(`Failed to fetch student dashboard: ${error.message}`);
    }
  }

  async getRecentActivities(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/dashboard/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch recent activities: ${error.message}`);
    }
  }
}

export default new DashboardService();
