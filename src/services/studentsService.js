// Students API service
import apiService from './api';

class StudentsService {
  // Get all students with optional filters
  async getStudents(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/students${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch students: ${error.message}`);
    }
  }

  // Get student by ID
  async getStudentById(studentId) {
    try {
      return await apiService.requestWithMock(`/students/${studentId}`);
    } catch (error) {
      throw new Error(`Failed to fetch student: ${error.message}`);
    }
  }

  // Create new student
  async createStudent(studentData) {
    try {
      return await apiService.requestWithMock('/students', {
        method: 'POST',
        body: studentData,
      });
    } catch (error) {
      throw new Error(`Failed to create student: ${error.message}`);
    }
  }

  // Update student
  async updateStudent(studentId, studentData) {
    try {
      return await apiService.requestWithMock(`/students/${studentId}`, {
        method: 'PUT',
        body: studentData,
      });
    } catch (error) {
      throw new Error(`Failed to update student: ${error.message}`);
    }
  }

  // Delete student
  async deleteStudent(studentId) {
    try {
      return await apiService.requestWithMock(`/students/${studentId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  }

  // Get student performance data
  async getStudentPerformance(studentId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.testType) queryParams.append('testType', filters.testType);

      const endpoint = `/students/${studentId}/performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch student performance: ${error.message}`);
    }
  }

  // Get student test history
  async getStudentTestHistory(studentId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/students/${studentId}/tests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch student test history: ${error.message}`);
    }
  }

  // Get students by class
  async getStudentsByClass(className) {
    try {
      return await apiService.requestWithMock(`/students/class/${className}`);
    } catch (error) {
      throw new Error(`Failed to fetch students by class: ${error.message}`);
    }
  }

  // Get student statistics
  async getStudentStats() {
    try {
      return await apiService.requestWithMock('/students/stats');
    } catch (error) {
      throw new Error(`Failed to fetch student statistics: ${error.message}`);
    }
  }
}

export default new StudentsService();
