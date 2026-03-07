import apiService from './api';

class AIService {
  async getAISuggestions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);

      const endpoint = `/ai/suggestions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch AI suggestions: ${error.message}`);
    }
  }

  async getAIInsights(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/ai/insights${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch AI insights: ${error.message}`);
    }
  }

  async generateAIContent(requestData) {
    try {
      return await apiService.get('/ai/generate', {
        method: 'POST',
        body: requestData,
      });
    } catch (error) {
      throw new Error(`Failed to generate AI content: ${error.message}`);
    }
  }

  async getAIGeneratedQuestions(requestData) {
    try {
      return await apiService.get('/ai/questions/generate', {
        method: 'POST',
        body: requestData,
      });
    } catch (error) {
      throw new Error(`Failed to generate AI questions: ${error.message}`);
    }
  }

  async analyzeStudentPerformance(studentId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

      const endpoint = `/ai/analyze/student/${studentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to analyze student performance: ${error.message}`);
    }
  }

  async getAIRecommendations(type, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.studentId) queryParams.append('studentId', filters.studentId);

      const endpoint = `/ai/recommendations/${type}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch AI recommendations: ${error.message}`);
    }
  }

  async getAIHeatmapData(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);

      const endpoint = `/ai/heatmap${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch AI heatmap data: ${error.message}`);
    }
  }

  async getRemedialActivities(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.studentId) queryParams.append('studentId', filters.studentId);

      const endpoint = `/ai/remedial-activities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch remedial activities: ${error.message}`);
    }
  }

  async generateAIQuestions(requestData) {
    try {
      const response = await apiService.post('/ai/generate-questions/', requestData, { timeout: 120000 });
      return response;
    } catch (error) {
      throw new Error(`Failed to generate AI questions: ${error.message}`);
    }
  }

  async generateAIQuestionsGemini(requestData) {
    try {
      const response = await apiService.post('/ai/generate-questions-vertex/', requestData, { timeout: 120000 });
      return response;
    } catch (error) {
      throw new Error(`Failed to generate AI questions with Vertex AI: ${error.message}`);
    }
  }

  async executeMatplotlibImage(matplotlibCode) {
    try {
      const response = await apiService.post('/ai/execute-matplotlib-image/', { matplotlib_code: matplotlibCode }, { timeout: 60000 });
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to execute matplotlib code: ${error.message}`);
    }
  }

  async deactivateAIQuestions(questionIdsToKeep, moduleChapterId) {
    try {
      const response = await apiService.post('/ai/deactivate-questions/', {
        question_ids: questionIdsToKeep,
        module_chapter_id: moduleChapterId
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to deactivate AI questions: ${error.message}`);
    }
  }
}

export default new AIService();
