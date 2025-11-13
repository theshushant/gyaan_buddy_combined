// Teachers API service
import apiService from './api';

class TeachersService {
  // Get all teachers with optional filters
  async getTeachers(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/users/teachers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch teachers: ${error.message}`);
    }
  }

  // Get teacher by ID
  async getTeacherById(teacherId) {
    try {
      return await apiService.get(`/users/${teacherId}`);
    } catch (error) {
      throw new Error(`Failed to fetch teacher: ${error.message}`);
    }
  }

  // Create new teacher
  async createTeacher(teacherData) {
    try {
      // Transform frontend field names to backend field names
      const payload = {
        first_name: teacherData.firstName || teacherData.first_name,
        last_name: teacherData.lastName || teacherData.last_name,
        email: teacherData.email || null,
        user_type: 'teacher'
      };
      
      // Add password and confirm password if provided
      if (teacherData.password) {
        payload.password = teacherData.password;
      }
      if (teacherData.confirmPassword || teacherData.confirm_password) {
        payload.confirm_password = teacherData.confirmPassword || teacherData.confirm_password;
      }
      
      // Add optional fields if they exist
      if (teacherData.phone_number || teacherData.phoneNumber) {
        payload.phone_number = teacherData.phone_number || teacherData.phoneNumber;
      }
      if (teacherData.date_of_birth || teacherData.dateOfBirth) {
        payload.date_of_birth = teacherData.date_of_birth || teacherData.dateOfBirth;
      }
      if (teacherData.bio) payload.bio = teacherData.bio;
      if (teacherData.profile_picture || teacherData.profilePicture) {
        payload.profile_picture = teacherData.profile_picture || teacherData.profilePicture;
      }
      if (teacherData.employeeId || teacherData.employee_id) {
        payload.employee_id = teacherData.employeeId || teacherData.employee_id;
      }
      
      // Add is_class_teacher field
      if (teacherData.isClassTeacher !== undefined || teacherData.is_class_teacher !== undefined) {
        payload.is_class_teacher = teacherData.isClassTeacher !== undefined 
          ? teacherData.isClassTeacher 
          : teacherData.is_class_teacher;
      }
      
      // Handle class and subject assignments
      // If there are assignments, use the first assignment's class_id and collect all subject_ids
      if (teacherData.assignments && teacherData.assignments.length > 0) {
        // Get the first assignment's class_id
        const firstAssignment = teacherData.assignments[0];
        if (firstAssignment.class) {
          payload.class_id = firstAssignment.class;
        }
        
        // Collect all subject IDs from all assignments
        const allSubjectIds = new Set();
        teacherData.assignments.forEach(assignment => {
          if (assignment.subjects && Array.isArray(assignment.subjects)) {
            assignment.subjects.forEach(subjectId => {
              allSubjectIds.add(subjectId);
            });
          }
        });
        
        if (allSubjectIds.size > 0) {
          payload.subject_ids = Array.from(allSubjectIds);
        }
      }
      
      console.log('TeachersService: Transformed payload:', payload);
      
      // Use /users/ endpoint with user_type parameter
      return await apiService.post('/users/', payload);
    } catch (error) {
      throw new Error(`Failed to create teacher: ${error.message}`);
    }
  }

  // Update teacher
  async updateTeacher(teacherId, teacherData) {
    try {
      // Transform frontend field names to backend field names
      const payload = {
        first_name: teacherData.firstName || teacherData.first_name,
        last_name: teacherData.lastName || teacherData.last_name,
        email: teacherData.email || null,
      };
      
      // Add password and confirm password if provided
      if (teacherData.password) {
        payload.password = teacherData.password;
      }
      if (teacherData.confirmPassword || teacherData.confirm_password) {
        payload.confirm_password = teacherData.confirmPassword || teacherData.confirm_password;
      }
      
      // Add optional fields if they exist
      if (teacherData.phone_number || teacherData.phoneNumber) {
        payload.phone_number = teacherData.phone_number || teacherData.phoneNumber;
      }
      if (teacherData.date_of_birth || teacherData.dateOfBirth) {
        payload.date_of_birth = teacherData.date_of_birth || teacherData.dateOfBirth;
      }
      if (teacherData.bio) payload.bio = teacherData.bio;
      if (teacherData.profile_picture || teacherData.profilePicture) {
        payload.profile_picture = teacherData.profile_picture || teacherData.profilePicture;
      }
      if (teacherData.employeeId || teacherData.employee_id) {
        payload.employee_id = teacherData.employeeId || teacherData.employee_id;
      }
      
      // Add is_class_teacher field
      if (teacherData.isClassTeacher !== undefined || teacherData.is_class_teacher !== undefined) {
        payload.is_class_teacher = teacherData.isClassTeacher !== undefined 
          ? teacherData.isClassTeacher 
          : teacherData.is_class_teacher;
      }
      
      // Handle class and subject assignments
      // If there are assignments, use the first assignment's class_id and collect all subject_ids
      if (teacherData.assignments && teacherData.assignments.length > 0) {
        // Get the first assignment's class_id
        const firstAssignment = teacherData.assignments[0];
        let classId = null;
        
        // Extract class_id - handle both string ID and object with id property
        if (firstAssignment.class) {
          if (typeof firstAssignment.class === 'string' || typeof firstAssignment.class === 'number') {
            classId = firstAssignment.class;
          } else if (typeof firstAssignment.class === 'object' && firstAssignment.class.id) {
            classId = firstAssignment.class.id;
          }
        }
        
        if (classId) {
          payload.class_id = classId;
        }
        
        // Collect all subject IDs from all assignments
        const allSubjectIds = new Set();
        teacherData.assignments.forEach(assignment => {
          if (assignment.subjects && Array.isArray(assignment.subjects)) {
            assignment.subjects.forEach(subjectId => {
              // Handle both string ID and object with id property
              let id = subjectId;
              if (typeof subjectId === 'object' && subjectId !== null && subjectId.id) {
                id = subjectId.id;
              }
              // Ensure subjectId is a valid UUID string
              if (id) {
                allSubjectIds.add(id);
              }
            });
          }
        });
        
        // Always include subject_ids as an array, even if empty
        payload.subject_ids = Array.from(allSubjectIds);
      } else if (teacherData.class_id || teacherData.classId) {
        // Handle direct class_id and subject_ids if provided
        payload.class_id = teacherData.class_id || teacherData.classId;
        if (teacherData.subject_ids || teacherData.subjectIds) {
          payload.subject_ids = Array.isArray(teacherData.subject_ids || teacherData.subjectIds) 
            ? (teacherData.subject_ids || teacherData.subjectIds)
            : [];
        }
      }
      
      console.log('TeachersService: Transformed update payload:', payload);
      
      // Use /users/{id}/ endpoint for updating
      return await apiService.put(`/users/${teacherId}/`, payload);
    } catch (error) {
      throw new Error(`Failed to update teacher: ${error.message}`);
    }
  }

  // Delete teacher
  async deleteTeacher(teacherId) {
    try {
      return await apiService.delete(`/users/${teacherId}/`);
    } catch (error) {
      throw new Error(`Failed to delete teacher: ${error.message}`);
    }
  }

  // Get teacher's classes
  async getTeacherClasses(teacherId) {
    try {
      return await apiService.get(`/classes?teacher_id=${teacherId}`);
    } catch (error) {
      throw new Error(`Failed to fetch teacher classes: ${error.message}`);
    }
  }

  // Assign teacher to class
  async assignTeacherToClass(teacherId, classData) {
    try {
      return await apiService.get(`/teachers/${teacherId}/classes`, {
        method: 'POST',
        body: classData,
      });
    } catch (error) {
      throw new Error(`Failed to assign teacher to class: ${error.message}`);
    }
  }

  // Get teacher performance metrics
  async getTeacherPerformance(teacherId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.classId) queryParams.append('classId', filters.classId);

      const endpoint = `/teachers/${teacherId}/performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch teacher performance: ${error.message}`);
    }
  }

  // Get teacher dashboard usage
  async getTeacherDashboardUsage(teacherId) {
    try {
      return await apiService.get(`/teachers/${teacherId}/dashboard-usage`);
    } catch (error) {
      throw new Error(`Failed to fetch teacher dashboard usage: ${error.message}`);
    }
  }

  // Get teacher statistics
  async getTeacherStats() {
    try {
      return await apiService.get('/users/teachers/stats');
    } catch (error) {
      throw new Error(`Failed to fetch teacher statistics: ${error.message}`);
    }
  }

}

export default new TeachersService();
