// Tests/Missions API service
import apiService from './api';

class TestsService {
  // Get all missions/tests with optional filters
  async getMissions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/missions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch missions: ${error.message}`);
    }
  }

  // Get mission by ID
  async getMissionById(missionId) {
    try {
      return await apiService.get(`/missions/${missionId}`);
    } catch (error) {
      throw new Error(`Failed to fetch mission: ${error.message}`);
    }
  }

  // Create a new mission/test
  async createMission(missionData) {
    try {
      console.log('TestsService: Creating mission with data:', missionData);
      const response = await apiService.post('/missions/', missionData);
      console.log('TestsService: Mission created successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to create mission:', error);
      throw new Error(`Failed to create mission: ${error.message}`);
    }
  }

  // Update an existing mission
  async updateMission(missionId, missionData) {
    try {
      console.log('TestsService: Updating mission with data:', missionData);
      const response = await apiService.put(`/missions/${missionId}/`, missionData);
      console.log('TestsService: Mission updated successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to update mission:', error);
      throw new Error(`Failed to update mission: ${error.message}`);
    }
  }

  // Delete a mission
  async deleteMission(missionId) {
    try {
      return await apiService.delete(`/missions/${missionId}/`);
    } catch (error) {
      throw new Error(`Failed to delete mission: ${error.message}`);
    }
  }

  // Get all missions with past date created by logged in teacher
  async getAllMissions() {
    try {
      return await apiService.get('/missions/all/');
    } catch (error) {
      throw new Error(`Failed to fetch all missions: ${error.message}`);
    }
  }

  // Create a question for a mission
  async createMissionQuestion(missionId, questionData) {
    try {
      console.log('TestsService: Creating mission question with data:', questionData);
      const response = await apiService.post(`/missions/${missionId}/questions/`, questionData);
      console.log('TestsService: Mission question created successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to create mission question:', error);
      throw new Error(`Failed to create mission question: ${error.message}`);
    }
  }
}

export default new TestsService();

