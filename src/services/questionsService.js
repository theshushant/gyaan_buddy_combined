import apiService from './api';

class QuestionsService {
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
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }
  }

  async getQuestionById(questionId) {
    try {
      return await apiService.get(`/questions/${questionId}`);
    } catch (error) {
      throw new Error(`Failed to fetch question: ${error.message}`);
    }
  }

  async createQuestion(questionData) {
    try {
      const isFormData = questionData instanceof FormData;
      return await apiService.post('/questions/', questionData, { isFormData });
    } catch (error) {
      throw new Error(`Failed to create question: ${error.message}`);
    }
  }

  async updateQuestion(questionId, questionData) {
    try {
      const isFormData = questionData instanceof FormData;
      return await apiService.put(`/questions/${questionId}/`, questionData, { isFormData });
    } catch (error) {
      throw new Error(`Failed to update question: ${error.message}`);
    }
  }

  async deleteQuestion(questionId) {
    try {
      return await apiService.delete(`/questions/${questionId}/`);
    } catch (error) {
      throw new Error(`Failed to delete question: ${error.message}`);
    }
  }

  async generateAIQuestions(requestData) {
    try {
      return await apiService.get('/questions/ai/generate', {
        method: 'POST',
        body: requestData,
      });
    } catch (error) {
      throw new Error(`Failed to generate AI questions: ${error.message}`);
    }
  }

  async getAIGeneratedQuestions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.type) queryParams.append('type', filters.type);

      const endpoint = `/questions/ai/generated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch AI generated questions: ${error.message}`);
    }
  }

  async saveAIGeneratedQuestions(questions) {
    try {
      return await apiService.get('/questions/ai/save', {
        method: 'POST',
        body: { questions },
      });
    } catch (error) {
      throw new Error(`Failed to save AI generated questions: ${error.message}`);
    }
  }

  async getQuestionStats() {
    try {
      return await apiService.get('/questions/stats');
    } catch (error) {
      throw new Error(`Failed to fetch question statistics: ${error.message}`);
    }
  }

  async getQuestionsBySubject(subject, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.type) queryParams.append('type', filters.type);

      const endpoint = `/questions/subject/${subject}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch questions by subject: ${error.message}`);
    }
  }

  async createQuestionOptions(questionId, options) {
    try {
      return await apiService.post(`/questions/${questionId}/options/`, { options });
    } catch (error) {
      throw new Error(`Failed to create question options: ${error.message}`);
    }
  }

  async getQuestionBank(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.topic) queryParams.append('topic', filters.topic);
      if (filters.chapter) queryParams.append('chapter', filters.chapter);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.page_size) queryParams.append('page_size', filters.page_size);
      const endpoint = `/question-bank/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch question bank: ${error.message}`);
    }
  }

  async addBankQuestionsToChapter(chapterId, questionIds) {
    try {
      return await apiService.post('/question-bank/add-to-chapter/', {
        chapter_id: chapterId,
        question_ids: questionIds,
      });
    } catch (error) {
      throw new Error(`Failed to add questions to assignment: ${error.message}`);
    }
  }
}

export default new QuestionsService();
