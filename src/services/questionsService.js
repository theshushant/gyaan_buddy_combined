// Questions API service
import apiService from './api';

class QuestionsService {
  // Get all questions with optional filters
  async getQuestions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/questions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }
  }

  // Get question by ID
  async getQuestionById(questionId) {
    try {
      return await apiService.requestWithMock(`/questions/${questionId}`);
    } catch (error) {
      throw new Error(`Failed to fetch question: ${error.message}`);
    }
  }

  // Create new question
  async createQuestion(questionData) {
    try {
      return await apiService.requestWithMock('/questions', {
        method: 'POST',
        body: questionData,
      });
    } catch (error) {
      throw new Error(`Failed to create question: ${error.message}`);
    }
  }

  // Update question
  async updateQuestion(questionId, questionData) {
    try {
      return await apiService.requestWithMock(`/questions/${questionId}`, {
        method: 'PUT',
        body: questionData,
      });
    } catch (error) {
      throw new Error(`Failed to update question: ${error.message}`);
    }
  }

  // Delete question
  async deleteQuestion(questionId) {
    try {
      return await apiService.requestWithMock(`/questions/${questionId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error(`Failed to delete question: ${error.message}`);
    }
  }

  // Generate AI questions
  async generateAIQuestions(requestData) {
    try {
      return await apiService.requestWithMock('/questions/ai/generate', {
        method: 'POST',
        body: requestData,
      });
    } catch (error) {
      throw new Error(`Failed to generate AI questions: ${error.message}`);
    }
  }

  // Get AI generated questions
  async getAIGeneratedQuestions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.type) queryParams.append('type', filters.type);

      const endpoint = `/questions/ai/generated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch AI generated questions: ${error.message}`);
    }
  }

  // Save AI generated questions
  async saveAIGeneratedQuestions(questions) {
    try {
      return await apiService.requestWithMock('/questions/ai/save', {
        method: 'POST',
        body: { questions },
      });
    } catch (error) {
      throw new Error(`Failed to save AI generated questions: ${error.message}`);
    }
  }

  // Get question statistics
  async getQuestionStats() {
    try {
      return await apiService.requestWithMock('/questions/stats');
    } catch (error) {
      throw new Error(`Failed to fetch question statistics: ${error.message}`);
    }
  }

  // Get questions by subject
  async getQuestionsBySubject(subject, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.type) queryParams.append('type', filters.type);

      const endpoint = `/questions/subject/${subject}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.requestWithMock(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch questions by subject: ${error.message}`);
    }
  }
}

export default new QuestionsService();
