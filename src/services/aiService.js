// AI Services API
import apiService from './api';

class AIService {
  // Get AI suggestions
  async getAISuggestions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);

      const endpoint = `/ai/suggestions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch AI suggestions: ${error.message}`);
    }
  }

  // Get AI insights
  async getAIInsights(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/ai/insights${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch AI insights: ${error.message}`);
    }
  }

  // Generate AI content
  async generateAIContent(requestData) {
    try {
      return await apiService.requestWithMock('/ai/generate', {
        method: 'POST',
        body: requestData,
      });
    } catch (error) {
      throw new Error(`Failed to generate AI content: ${error.message}`);
    }
  }

  // Get AI generated questions
  async getAIGeneratedQuestions(requestData) {
    try {
      return await apiService.requestWithMock('/ai/questions/generate', {
        method: 'POST',
        body: requestData,
      });
    } catch (error) {
      throw new Error(`Failed to generate AI questions: ${error.message}`);
    }
  }

  // Analyze student performance with AI
  async analyzeStudentPerformance(studentId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/ai/analyze/student/${studentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to analyze student performance: ${error.message}`);
    }
  }

  // Get AI recommendations
  async getAIRecommendations(type, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.studentId) queryParams.append('studentId', filters.studentId);

      const endpoint = `/ai/recommendations/${type}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch AI recommendations: ${error.message}`);
    }
  }

  // Get AI heatmap data
  async getAIHeatmapData(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);

      const endpoint = `/ai/heatmap${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch AI heatmap data: ${error.message}`);
    }
  }

  // Get remedial activities suggestions
  async getRemedialActivities(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.studentId) queryParams.append('studentId', filters.studentId);

      const endpoint = `/ai/remedial-activities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch remedial activities: ${error.message}`);
    }
  }
}

export default new AIService();
