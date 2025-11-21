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
      const isClassTeacher = teacherData.isClassTeacher !== undefined 
        ? teacherData.isClassTeacher 
        : (teacherData.is_class_teacher !== undefined ? teacherData.is_class_teacher : false);
      
      if (isClassTeacher !== undefined) {
        payload.is_class_teacher = isClassTeacher;
      }
      
      // Handle class and subject assignments
      // Send assignments array with class and subject IDs to backend
      if (teacherData.assignments && teacherData.assignments.length > 0) {
        // Format assignments array with class_id and subject_ids for each assignment
        payload.assignments = teacherData.assignments.map(assignment => {
          let classId = null;
          
          // Extract class_id - handle both string ID and object with id property
          if (assignment.class) {
            if (typeof assignment.class === 'string' || typeof assignment.class === 'number') {
              classId = assignment.class;
            } else if (typeof assignment.class === 'object' && assignment.class.id) {
              classId = assignment.class.id;
            }
          }
          
          // Extract subject_ids array
          const subjectIds = [];
          if (assignment.subjects && Array.isArray(assignment.subjects)) {
            assignment.subjects.forEach(subjectId => {
              // Handle both string ID and object with id property
              let id = subjectId;
              if (typeof subjectId === 'object' && subjectId !== null && subjectId.id) {
                id = subjectId.id;
              }
              // Ensure subjectId is a valid UUID string
              if (id) {
                subjectIds.push(id);
              }
            });
          }
          
          return {
            class_id: classId,
            subject_ids: subjectIds
          };
        }).filter(assignment => assignment.class_id && assignment.subject_ids.length > 0);
        
        // Also include first assignment's class_id for backward compatibility (if needed)
        const firstAssignment = teacherData.assignments[0];
        if (firstAssignment && firstAssignment.class) {
          let classId = null;
          if (typeof firstAssignment.class === 'string' || typeof firstAssignment.class === 'number') {
            classId = firstAssignment.class;
          } else if (typeof firstAssignment.class === 'object' && firstAssignment.class.id) {
            classId = firstAssignment.class.id;
          }
          if (classId) {
            payload.class_id = classId;
          }
        }
      } else if (teacherData.class_id || teacherData.classId) {
        // Handle direct class_id and subject_ids if provided (backward compatibility)
        payload.class_id = teacherData.class_id || teacherData.classId;
        if (teacherData.subject_ids || teacherData.subjectIds) {
          payload.subject_ids = Array.isArray(teacherData.subject_ids || teacherData.subjectIds) 
            ? (teacherData.subject_ids || teacherData.subjectIds)
            : [];
        } else {
          payload.subject_ids = [];
        }
      } else {
        // Ensure assignments is always an array, even if empty
        payload.assignments = [];
      }
      
      // Ensure class_id is provided when is_class_teacher is true
      if (isClassTeacher && !payload.class_id) {
        console.warn('TeachersService: is_class_teacher is true but no class_id provided');
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
      console.log('TeachersService: updateTeacher called with teacherData:', teacherData);
      
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
      const isClassTeacher = teacherData.isClassTeacher !== undefined 
        ? teacherData.isClassTeacher 
        : (teacherData.is_class_teacher !== undefined ? teacherData.is_class_teacher : false);
      
      if (isClassTeacher !== undefined) {
        payload.is_class_teacher = isClassTeacher;
      }
      
      // Handle class and subject assignments
      // Send assignments array with class and subject IDs to backend
      // First, try to get assignments from teacherData.assignments
      let assignments = teacherData.assignments;
      
      // If no assignments, try to extract from teacher_assignments (backend format)
      if ((!assignments || assignments.length === 0) && teacherData.teacher_assignments && teacherData.teacher_assignments.length > 0) {
        // Convert teacher_assignments format to assignments format
        const classSubjectMap = {};
        teacherData.teacher_assignments.forEach(ta => {
          const classId = ta.class?.id || ta.class_id || ta.class;
          const subjectId = ta.subject?.id || ta.subject_id || ta.subject;
          
          if (classId && subjectId) {
            const key = classId;
            if (!classSubjectMap[key]) {
              classSubjectMap[key] = {
                class: classId,
                subjects: []
              };
            }
            if (!classSubjectMap[key].subjects.includes(subjectId)) {
              classSubjectMap[key].subjects.push(subjectId);
            }
          }
        });
        assignments = Object.values(classSubjectMap);
      }
      
      // Process assignments if they exist
      if (assignments && assignments.length > 0) {
        console.log('TeachersService: Processing assignments:', assignments);
        
        // Format assignments array with class_id and subject_ids for each assignment
        payload.assignments = assignments.map(assignment => {
          let classId = null;
          
          // Extract class_id - handle both string ID and object with id property
          if (assignment.class) {
            if (typeof assignment.class === 'string' || typeof assignment.class === 'number') {
              classId = assignment.class;
            } else if (typeof assignment.class === 'object' && assignment.class.id) {
              classId = assignment.class.id;
            }
          }
          
          // Extract subject_ids array
          const subjectIds = [];
          if (assignment.subjects && Array.isArray(assignment.subjects)) {
            assignment.subjects.forEach(subjectId => {
              // Handle both string ID and object with id property
              let id = subjectId;
              if (typeof subjectId === 'object' && subjectId !== null && subjectId.id) {
                id = subjectId.id;
              }
              // Ensure subjectId is a valid UUID string
              if (id) {
                subjectIds.push(id);
              }
            });
          }
          
          return {
            class_id: classId,
            subject_ids: subjectIds
          };
        }).filter(assignment => assignment.class_id && assignment.subject_ids.length > 0);
        
        console.log('TeachersService: Formatted assignments for payload:', payload.assignments);
        
        // Also include first assignment's class_id for backward compatibility (if needed)
        const firstAssignment = assignments[0];
        if (firstAssignment && firstAssignment.class) {
          let classId = null;
          if (typeof firstAssignment.class === 'string' || typeof firstAssignment.class === 'number') {
            classId = firstAssignment.class;
          } else if (typeof firstAssignment.class === 'object' && firstAssignment.class.id) {
            classId = firstAssignment.class.id;
          }
          if (classId) {
            payload.class_id = classId;
            console.log('TeachersService: Extracted class_id for backward compatibility:', classId);
          }
        }
      } else if (teacherData.class_id || teacherData.classId) {
        // Handle direct class_id and subject_ids if provided (backward compatibility)
        payload.class_id = teacherData.class_id || teacherData.classId;
        if (teacherData.subject_ids || teacherData.subjectIds) {
          payload.subject_ids = Array.isArray(teacherData.subject_ids || teacherData.subjectIds) 
            ? (teacherData.subject_ids || teacherData.subjectIds)
            : [];
        } else {
          payload.subject_ids = [];
        }
        console.log('TeachersService: Using direct class_id and subject_ids:', payload.class_id, payload.subject_ids);
      } else {
        // Ensure assignments is always an array, even if empty
        payload.assignments = [];
        console.log('TeachersService: No assignments found, setting empty array');
      }
      
      // Ensure class_id is provided when is_class_teacher is true
      if (isClassTeacher && !payload.class_id) {
        console.warn('TeachersService: is_class_teacher is true but no class_id provided');
      }
      
      console.log('TeachersService: Final update payload:', payload);
      
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
