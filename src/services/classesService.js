import apiService from './api';

class ClassesService {
  async getClasses(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.school) queryParams.append('school', filters.school);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/classes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch classes: ${error.message}`);
    }
  }

  async getClassById(classId) {
    try {
      return await apiService.get(`/classes/${classId}`);
    } catch (error) {
      throw new Error(`Failed to fetch class: ${error.message}`);
    }
  }

  async createClass(classData) {
    try {
      console.log('ClassesService: Creating class with data:', classData);
      const response = await apiService.post('/classes/', classData);
      console.log('ClassesService: Class created successfully:', response);
      return response;
    } catch (error) {
      console.error('ClassesService: Failed to create class:', error);
      throw new Error(`Failed to create class: ${error.message}`);
    }
  }

  async updateClass(classId, classData) {
    try {
      console.log('ClassesService: Updating class with data:', classData);
      const response = await apiService.put(`/classes/${classId}/`, classData);
      console.log('ClassesService: Class updated successfully:', response);
      return response;
    } catch (error) {
      console.error('ClassesService: Failed to update class:', error);
      throw new Error(`Failed to update class: ${error.message}`);
    }
  }
}

export default new ClassesService();

