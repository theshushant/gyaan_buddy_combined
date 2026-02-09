import apiService from './api';

class TestsService {

  async getMissions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/missions/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch missions: ${error.message}`);
    }
  }

  async getMissionById(missionId) {
    try {
      return await apiService.get(`/missions/${missionId}/`);
    } catch (error) {
      throw new Error(`Failed to fetch mission: ${error.message}`);
    }
  }

  async createMission(missionData) {
    try {
      console.log('TestsService: Creating mission with data:', missionData);
      
      const payload = {
        mission_date: missionData.mission_date,
        subject: missionData.subject,
        class_group: missionData.class_group,
      };
      
      if (missionData.module) payload.module = missionData.module;
      if (missionData.module_chapter) payload.module_chapter = missionData.module_chapter;
      if (missionData.title) payload.title = missionData.title;
      if (missionData.description) payload.description = missionData.description;
      if (missionData.duration) payload.duration = missionData.duration;
      if (missionData.base_exp !== undefined) payload.base_exp = missionData.base_exp;
      if (missionData.exp_multiplier !== undefined) payload.exp_multiplier = missionData.exp_multiplier;
      if (missionData.is_active !== undefined) payload.is_active = missionData.is_active;
      
      console.log('TestsService: Transformed mission payload:', payload);
      const response = await apiService.post('/missions/', payload);
      console.log('TestsService: Mission created successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to create mission:', error);
      throw error;
    }
  }

  async updateMission(missionId, missionData) {
    try {
      console.log('TestsService: Updating mission with data:', missionData);
      
      const payload = {};
      
      if (missionData.mission_date) payload.mission_date = missionData.mission_date;
      if (missionData.subject) payload.subject = missionData.subject;
      if (missionData.class_group) payload.class_group = missionData.class_group;
      if (missionData.module) payload.module = missionData.module;
      if (missionData.module_chapter) payload.module_chapter = missionData.module_chapter;
      if (missionData.title !== undefined) payload.title = missionData.title;
      if (missionData.description !== undefined) payload.description = missionData.description;
      if (missionData.duration !== undefined) payload.duration = missionData.duration;
      if (missionData.base_exp !== undefined) payload.base_exp = missionData.base_exp;
      if (missionData.exp_multiplier !== undefined) payload.exp_multiplier = missionData.exp_multiplier;
      if (missionData.is_active !== undefined) payload.is_active = missionData.is_active;
      
      console.log('TestsService: Transformed mission update payload:', payload);
      const response = await apiService.put(`/missions/${missionId}/`, payload);
      console.log('TestsService: Mission updated successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to update mission:', error);
      throw error;
    }
  }

  async deleteMission(missionId) {
    try {
      return await apiService.delete(`/missions/${missionId}/`);
    } catch (error) {
      throw new Error(`Failed to delete mission: ${error.message}`);
    }
  }

  async getAllMissions() {
    try {
      return await apiService.get('/missions/all/');
    } catch (error) {
      throw new Error(`Failed to fetch all missions: ${error.message}`);
    }
  }

  async getMissionQuestions(missionId) {
    try {
      console.log('TestsService: Fetching questions for mission:', missionId);
      const response = await apiService.get(`/missions/${missionId}/questions/`);
      console.log('TestsService: Mission questions fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to fetch mission questions:', error);
      throw new Error(`Failed to fetch mission questions: ${error.message}`);
    }
  }

  async createMissionQuestion(missionId, questionData) {
    try {
      console.log('TestsService: Creating mission question with data:', questionData);
      const response = await apiService.post(`/missions/${missionId}/questions/`, questionData);
      console.log('TestsService: Mission question created successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to create mission question:', error);
      throw error;
    }
  }

  async startMission(missionId) {
    try {
      console.log('TestsService: Starting mission:', missionId);
      const response = await apiService.post(`/missions/${missionId}/start_mission/`);
      console.log('TestsService: Mission started successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to start mission:', error);
      throw error;
    }
  }

  async getStudentsPerformance(missionId) {
    try {
      console.log('TestsService: Fetching students performance for mission:', missionId);
      const response = await apiService.get(`/missions/${missionId}/students_performance/`);
      console.log('TestsService: Students performance fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to fetch students performance:', error);
      throw error;
    }
  }


  async getTests(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.module) queryParams.append('module', filters.module);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/tests/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch tests: ${error.message}`);
    }
  }

  async getMyTests() {
    try {
      return await apiService.get('/tests/my-tests/');
    } catch (error) {
      throw new Error(`Failed to fetch my tests: ${error.message}`);
    }
  }

  async getTestById(testId) {
    try {
      return await apiService.get(`/tests/${testId}/`);
    } catch (error) {
      throw new Error(`Failed to fetch test: ${error.message}`);
    }
  }

  async createTest(testData) {
    try {
      console.log('TestsService: Creating test with data:', testData);

      const payload = {
        test_datetime: testData.test_datetime,
        duration: parseInt(testData.duration),
        class_group: testData.class_group,
        subject: testData.subject,
      };

      const hasModuleChapters = testData.module_chapters && Array.isArray(testData.module_chapters) && testData.module_chapters.length > 0;
      const hasLegacy = testData.module && testData.module_chapter;

      if (hasModuleChapters) {
        payload.module_chapters = testData.module_chapters;
      } else if (hasLegacy) {
        payload.module = testData.module;
        payload.module_chapter = testData.module_chapter;
      } else {
        throw new Error('Provide either module_chapters (array of { module, chapters }) or module and module_chapter.');
      }

      console.log('TestsService: Transformed test payload:', payload);
      const response = await apiService.post('/tests/', payload);
      console.log('TestsService: Test created successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to create test:', error);
      throw error;
    }
  }

  async updateTest(testId, testData) {
    try {
      console.log('TestsService: Updating test with data:', testData);

      const payload = {};

      if (testData.test_datetime) payload.test_datetime = testData.test_datetime;
      if (testData.duration !== undefined) payload.duration = parseInt(testData.duration);
      if (testData.class_group) payload.class_group = testData.class_group;
      if (testData.subject) payload.subject = testData.subject;

      const hasModuleChapters = testData.module_chapters && Array.isArray(testData.module_chapters);
      const hasLegacy = testData.module && testData.module_chapter;

      if (hasModuleChapters) {
        payload.module_chapters = testData.module_chapters;
      } else if (hasLegacy) {
        payload.module = testData.module;
        payload.module_chapter = testData.module_chapter;
      }

      console.log('TestsService: Transformed test update payload:', payload);
      const response = await apiService.put(`/tests/${testId}/`, payload);
      console.log('TestsService: Test updated successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to update test:', error);
      throw error;
    }
  }

  async deleteTest(testId) {
    try {
      return await apiService.delete(`/tests/${testId}/`);
    } catch (error) {
      throw new Error(`Failed to delete test: ${error.message}`);
    }
  }

  async startTest(testId) {
    try {
      console.log('TestsService: Starting test:', testId);
      const response = await apiService.post(`/tests/${testId}/start/`);
      console.log('TestsService: Test started successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to start test:', error);
      throw error;
    }
  }

  async completeTest(testId) {
    try {
      console.log('TestsService: Completing test:', testId);
      const response = await apiService.post(`/tests/${testId}/complete/`);
      console.log('TestsService: Test completed successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to complete test:', error);
      throw error;
    }
  }

  async getTestQuestions(testId) {
    try {
      console.log('TestsService: Fetching questions for test:', testId);
      const response = await apiService.get(`/tests/${testId}/questions/`);
      console.log('TestsService: Test questions fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to fetch test questions:', error);
      throw new Error(`Failed to fetch test questions: ${error.message}`);
    }
  }

  async removeTestQuestions(testId, questionIds) {
    try {
      const response = await apiService.post(`/tests/${testId}/remove-questions/`, {
        question_ids: Array.isArray(questionIds) ? questionIds : [questionIds]
      });
      return response;
    } catch (error) {
      console.error('TestsService: Failed to remove test questions:', error);
      throw new Error(`Failed to remove test questions: ${error.message}`);
    }
  }

  async addTestQuestions(testId, questionIds) {
    try {
      const response = await apiService.post(`/tests/${testId}/add-questions/`, {
        question_ids: Array.isArray(questionIds) ? questionIds : [questionIds]
      });
      return response;
    } catch (error) {
      console.error('TestsService: Failed to add test questions:', error);
      throw new Error(`Failed to add test questions: ${error.message}`);
    }
  }

  async createTestQuestion(testId, questionData) {
    try {
      const response = await apiService.post(`/tests/${testId}/add-question/`, questionData);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to create and add question to test:', error);
      throw new Error(`Failed to create question: ${error.message}`);
    }
  }

  async checkTestAnswer(testId, answerData) {
    try {
      console.log('TestsService: Checking answer for test:', testId, answerData);
      const response = await apiService.post(`/tests/${testId}/check-answer/`, answerData);
      console.log('TestsService: Answer checked successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to check answer:', error);
      throw error;
    }
  }

  async getTestStudentsPerformance(testId) {
    try {
      console.log('TestsService: Fetching students performance for test:', testId);
      const response = await apiService.get(`/tests/${testId}/students-performance/`);
      console.log('TestsService: Test students performance fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('TestsService: Failed to fetch test students performance:', error);
      throw error;
    }
  }
}

export default new TestsService();

