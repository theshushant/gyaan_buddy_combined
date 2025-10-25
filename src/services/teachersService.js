// Teachers API service
import apiService from './api';

class TeachersService {
  // Get all teachers with optional filters
  async getTeachers(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/teachers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch teachers: ${error.message}`);
    }
  }

  // Get teacher by ID
  async getTeacherById(teacherId) {
    try {
      return await apiService.requestWithMock(`/teachers/${teacherId}`);
    } catch (error) {
      throw new Error(`Failed to fetch teacher: ${error.message}`);
    }
  }

  // Create new teacher
  async createTeacher(teacherData) {
    try {
      return await apiService.requestWithMock('/teachers', {
        method: 'POST',
        body: teacherData,
      });
    } catch (error) {
      throw new Error(`Failed to create teacher: ${error.message}`);
    }
  }

  // Update teacher
  async updateTeacher(teacherId, teacherData) {
    try {
      return await apiService.requestWithMock(`/teachers/${teacherId}`, {
        method: 'PUT',
        body: teacherData,
      });
    } catch (error) {
      throw new Error(`Failed to update teacher: ${error.message}`);
    }
  }

  // Delete teacher
  async deleteTeacher(teacherId) {
    try {
      return await apiService.requestWithMock(`/teachers/${teacherId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error(`Failed to delete teacher: ${error.message}`);
    }
  }

  // Get teacher's classes
  async getTeacherClasses(teacherId) {
    try {
      return await apiService.requestWithMock(`/teachers/${teacherId}/classes`);
    } catch (error) {
      throw new Error(`Failed to fetch teacher classes: ${error.message}`);
    }
  }

  // Assign teacher to class
  async assignTeacherToClass(teacherId, classData) {
    try {
      return await apiService.requestWithMock(`/teachers/${teacherId}/classes`, {
        method: 'POST',
        body: classData,
      });
    } catch (error) {
      throw new Error(`Failed to assign teacher to class: ${error.message}`);
    }
  }

  // Get teacher performance metrics
  async getTeacherPerformance(teacherId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.classId) queryParams.append('classId', filters.classId);

      const endpoint = `/teachers/${teacherId}/performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch teacher performance: ${error.message}`);
    }
  }

  // Get teacher dashboard usage
  async getTeacherDashboardUsage(teacherId) {
    try {
      return await apiService.requestWithMock(`/teachers/${teacherId}/dashboard-usage`);
    } catch (error) {
      throw new Error(`Failed to fetch teacher dashboard usage: ${error.message}`);
    }
  }

  // Get teacher statistics
  async getTeacherStats() {
    try {
      return await apiService.requestWithMock('/teachers/stats');
    } catch (error) {
      throw new Error(`Failed to fetch teacher statistics: ${error.message}`);
    }
  }
}

export default new TeachersService();
