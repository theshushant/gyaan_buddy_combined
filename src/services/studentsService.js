import apiService from './api';

class StudentsService {
  async getStudents(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.search) queryParams.append('search', filters.search);
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.teacher) queryParams.append('teacher', filters.teacher);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/students/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch students: ${error.message}`);
    }
  }

  async getAttemptRates(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);

      const endpoint = `/students/attempt-rates/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch student attempt rates: ${error.message}`);
    }
  }

  async getStudentById(studentId) {
    try {
      const response = await apiService.get(`/users/${studentId}/`);
      if (response && response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch student: ${error.message}`);
    }
  }

  async createStudent(studentData) {
    try {
      console.log('StudentsService: Creating student with data:', studentData);
      
      const payload = {
        first_name: studentData.firstName || studentData.first_name,
        last_name: studentData.lastName || studentData.last_name,
        roll_number: studentData.rollNumber ? parseInt(studentData.rollNumber) : studentData.roll_number,
        date_of_birth: studentData.dateOfBirth || studentData.date_of_birth,
        user_type: 'student'
      };
      
      if (studentData.dateOfBirth || studentData.date_of_birth) {
        payload.date_of_birth = studentData.dateOfBirth || studentData.date_of_birth;
      }
      
      if (studentData.gender !== undefined && studentData.gender !== '') {
        payload.gender = studentData.gender;
      }
      
      if (studentData.parentName || studentData.parent_name) {
        payload.parent_name = studentData.parentName || studentData.parent_name;
      }
      
      if (studentData.class_id || studentData.classId) {
        payload.class_id = studentData.class_id || studentData.classId;
      }
      
      if (studentData.subject_ids || studentData.subjectIds) {
        const subjectIds = studentData.subject_ids || studentData.subjectIds;
        if (Array.isArray(subjectIds) && subjectIds.length > 0) {
          payload.subject_ids = subjectIds;
        }
      }
      
      if (studentData.parentContact) {
        const contact = studentData.parentContact.trim();
        if (contact.includes('@')) {
          payload.email = contact;
        } else {
          payload.phone_number = contact;
        }
      }
      
      if (studentData.email) payload.email = studentData.email;
      if (studentData.phone_number) payload.phone_number = studentData.phone_number;
      if (studentData.admission_number) payload.admission_number = studentData.admission_number;
      
      console.log('StudentsService: Transformed payload:', payload);
      
      const response = await apiService.post('/users/', payload);
      console.log('StudentsService: Student created successfully:', response);
      
      if (response && response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error('StudentsService: Failed to create student:', error);
      throw new Error(`Failed to create student: ${error.message}`);
    }
  }

  async updateStudent(studentId, studentData) {
    try {
      console.log('StudentsService: Updating student with data:', studentData);
      
      const payload = {};
      
      if (studentData.firstName !== undefined || studentData.first_name !== undefined) {
        payload.first_name = studentData.firstName || studentData.first_name;
      }
      if (studentData.lastName !== undefined || studentData.last_name !== undefined) {
        payload.last_name = studentData.lastName || studentData.last_name;
      }
      if (studentData.rollNumber !== undefined || studentData.roll_number !== undefined) {
        payload.roll_number = studentData.rollNumber ? parseInt(studentData.rollNumber) : (studentData.roll_number ? parseInt(studentData.roll_number) : undefined);
      }
      if (studentData.dateOfBirth !== undefined || studentData.date_of_birth !== undefined) {
        payload.date_of_birth = studentData.dateOfBirth || studentData.date_of_birth;
      }
      
      if (studentData.gender !== undefined && studentData.gender !== '') {
        payload.gender = studentData.gender;
      }
      
      if (studentData.parentName !== undefined || studentData.parent_name !== undefined) {
        payload.parent_name = studentData.parentName || studentData.parent_name;
      }
      
      if (studentData.class_id !== undefined || studentData.classId !== undefined) {
        payload.class_id = studentData.class_id || studentData.classId;
      }
      
      if (studentData.subject_ids !== undefined || studentData.subjectIds !== undefined) {
        const subjectIds = studentData.subject_ids || studentData.subjectIds;
        if (Array.isArray(subjectIds)) {
          payload.subject_ids = subjectIds;
        }
      }
      
      if (studentData.parentContact !== undefined) {
        const contact = studentData.parentContact.trim();
        if (contact.includes('@')) {
          payload.email = contact;
        } else if (contact) {
          payload.phone_number = contact;
        }
      }
      
      if (studentData.email !== undefined) payload.email = studentData.email;
      if (studentData.phone_number !== undefined) payload.phone_number = studentData.phone_number;
      if (studentData.admission_number !== undefined) payload.admission_number = studentData.admission_number;
      
      console.log('StudentsService: Transformed update payload:', payload);
      
      const response = await apiService.put(`/users/${studentId}/`, payload);
      console.log('StudentsService: Student updated successfully:', response);
      
      if (response && response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error('StudentsService: Failed to update student:', error);
      throw new Error(`Failed to update student: ${error.message}`);
    }
  }

  async deleteStudent(studentId) {
    try {
      console.log('StudentsService: Deleting student:', studentId);
      const response = await apiService.delete(`/users/${studentId}/`);
      console.log('StudentsService: Student deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('StudentsService: Failed to delete student:', error);
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  }

  async getStudentPerformance(studentId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.testType) queryParams.append('testType', filters.testType);

      const endpoint = `/students/${studentId}/performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch student performance: ${error.message}`);
    }
  }

  async getStudentTestHistory(studentId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/students/${studentId}/tests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch student test history: ${error.message}`);
    }
  }

  async getStudentsByClass(className) {
    try {
      return await apiService.get(`/students/class/${className}`);
    } catch (error) {
      throw new Error(`Failed to fetch students by class: ${error.message}`);
    }
  }

  async getStudentStats() {
    try {
      return await apiService.get('/students/stats');
    } catch (error) {
      throw new Error(`Failed to fetch student statistics: ${error.message}`);
    }
  }

  async bulkImportStudents(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await apiService.post('/students/bulk-import/', formData, { timeout: 300000 }); // 5 min for large files
    } catch (error) {
      throw new Error(`Failed to import students: ${error.message}`);
    }
  }

  async getStudentRecentTests(studentId) {
    try {
      const response = await apiService.get(`/students/${studentId}/recent-tests/`);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch student recent tests: ${error.message}`);
    }
  }

  async getStudentProgressTrends(studentId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.period) queryParams.append('period', filters.period);
      if (filters.subject) queryParams.append('subject', filters.subject);

      const endpoint = `/students/${studentId}/progress-trends${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch student progress trends: ${error.message}`);
    }
  }
}

export default new StudentsService();
