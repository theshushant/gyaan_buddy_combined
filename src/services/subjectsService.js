// Subjects API service
import apiService from './api';

class SubjectsService {
  // Get all subjects with optional filters
  async getSubjects(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/subjects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch subjects: ${error.message}`);
    }
  }

  // Get subject by ID
  async getSubjectById(subjectId) {
    try {
      return await apiService.get(`/subjects/${subjectId}`);
    } catch (error) {
      throw new Error(`Failed to fetch subject: ${error.message}`);
    }
  }
}

export default new SubjectsService();

