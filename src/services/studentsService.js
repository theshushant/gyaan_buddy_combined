// Students API service
import apiService from './api';

class StudentsService {
  // Get all students with optional filters
  async getStudents(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add user_type=student to filter for students only
      queryParams.append('user_type', 'student');
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.teacher) queryParams.append('teacher', filters.teacher);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/users/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch students: ${error.message}`);
    }
  }

  // Get student by ID
  async getStudentById(studentId) {
    try {
      const response = await apiService.get(`/users/${studentId}/`);
      // Extract data from response if it's nested
      if (response && response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch student: ${error.message}`);
    }
  }

  // Create new student
  async createStudent(studentData) {
    try {
      console.log('StudentsService: Creating student with data:', studentData);
      
      // Transform frontend field names to backend field names
      const payload = {
        first_name: studentData.firstName || studentData.first_name,
        last_name: studentData.lastName || studentData.last_name,
        roll_number: studentData.rollNumber ? parseInt(studentData.rollNumber) : studentData.roll_number,
        date_of_birth: studentData.dateOfBirth || studentData.date_of_birth,
        user_type: 'student'
      };
      
      // Add date_of_birth explicitly if provided
      if (studentData.dateOfBirth || studentData.date_of_birth) {
        payload.date_of_birth = studentData.dateOfBirth || studentData.date_of_birth;
      }
      
      // Add parent_name if provided
      if (studentData.parentName || studentData.parent_name) {
        payload.parent_name = studentData.parentName || studentData.parent_name;
      }
      
      // Add class_id if provided
      if (studentData.class_id || studentData.classId) {
        payload.class_id = studentData.class_id || studentData.classId;
      }
      
      // Add subject_ids if provided
      if (studentData.subject_ids || studentData.subjectIds) {
        const subjectIds = studentData.subject_ids || studentData.subjectIds;
        if (Array.isArray(subjectIds) && subjectIds.length > 0) {
          payload.subject_ids = subjectIds;
        }
      }
      
      // Handle email/phone_number from parentContact
      // Check if parentContact is an email or phone number
      if (studentData.parentContact) {
        const contact = studentData.parentContact.trim();
        // Simple email regex check
        if (contact.includes('@')) {
          payload.email = contact;
        } else {
          payload.phone_number = contact;
        }
      }
      
      // Add optional fields if they exist
      if (studentData.email) payload.email = studentData.email;
      if (studentData.phone_number) payload.phone_number = studentData.phone_number;
      if (studentData.admission_number) payload.admission_number = studentData.admission_number;
      
      console.log('StudentsService: Transformed payload:', payload);
      
      // Use /users/ endpoint with user_type parameter
      const response = await apiService.post('/users/', payload);
      console.log('StudentsService: Student created successfully:', response);
      
      // Extract data from response if it's nested
      if (response && response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error('StudentsService: Failed to create student:', error);
      throw new Error(`Failed to create student: ${error.message}`);
    }
  }

  // Update student
  async updateStudent(studentId, studentData) {
    try {
      console.log('StudentsService: Updating student with data:', studentData);
      
      // Transform frontend field names to backend field names
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
      
      // Add parent_name if provided
      if (studentData.parentName !== undefined || studentData.parent_name !== undefined) {
        payload.parent_name = studentData.parentName || studentData.parent_name;
      }
      
      // Add class_id if provided
      if (studentData.class_id !== undefined || studentData.classId !== undefined) {
        payload.class_id = studentData.class_id || studentData.classId;
      }
      
      // Add subject_ids if provided
      if (studentData.subject_ids !== undefined || studentData.subjectIds !== undefined) {
        const subjectIds = studentData.subject_ids || studentData.subjectIds;
        if (Array.isArray(subjectIds) && subjectIds.length > 0) {
          payload.subject_ids = subjectIds;
        }
      }
      
      // Handle email/phone_number from parentContact
      if (studentData.parentContact !== undefined) {
        const contact = studentData.parentContact.trim();
        if (contact.includes('@')) {
          payload.email = contact;
        } else if (contact) {
          payload.phone_number = contact;
        }
      }
      
      // Add optional fields if they exist
      if (studentData.email !== undefined) payload.email = studentData.email;
      if (studentData.phone_number !== undefined) payload.phone_number = studentData.phone_number;
      if (studentData.admission_number !== undefined) payload.admission_number = studentData.admission_number;
      
      console.log('StudentsService: Transformed update payload:', payload);
      
      const response = await apiService.put(`/users/${studentId}/`, payload);
      console.log('StudentsService: Student updated successfully:', response);
      
      // Extract data from response if it's nested
      if (response && response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error('StudentsService: Failed to update student:', error);
      throw new Error(`Failed to update student: ${error.message}`);
    }
  }

  // Delete student
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

  // Get student performance data
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

  // Get student test history
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

  // Get students by class
  async getStudentsByClass(className) {
    try {
      return await apiService.get(`/students/class/${className}`);
    } catch (error) {
      throw new Error(`Failed to fetch students by class: ${error.message}`);
    }
  }

  // Get student statistics
  async getStudentStats() {
    try {
      return await apiService.get('/users/students/stats');
    } catch (error) {
      throw new Error(`Failed to fetch student statistics: ${error.message}`);
    }
  }

  // Get student progress trends
  async getStudentProgressTrends(studentId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.period) queryParams.append('period', filters.period);
      if (filters.subject) queryParams.append('subject', filters.subject);

      const endpoint = `/students/${studentId}/progress-trends${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(endpoint);
      // Extract data from backend response structure {success, message, data}
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch student progress trends: ${error.message}`);
    }
  }
}

export default new StudentsService();
