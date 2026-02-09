import apiService from './api';

class TeachersService {
  async getTeachers(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/teachers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch teachers: ${error.message}`);
    }
  }

  async getTeacherById(teacherId, options = {}) {
    try {
      return await apiService.get(`/users/${teacherId}`, options);
    } catch (error) {
      throw new Error(`Failed to fetch teacher: ${error.message}`);
    }
  }

  async createTeacher(teacherData) {
    try {
      const payload = {
        first_name: teacherData.firstName || teacherData.first_name,
        last_name: teacherData.lastName || teacherData.last_name,
        email: teacherData.email || null,
        user_type: 'teacher'
      };
      
      if (teacherData.password) {
        payload.password = teacherData.password;
      }
      if (teacherData.confirmPassword || teacherData.confirm_password) {
        payload.confirm_password = teacherData.confirmPassword || teacherData.confirm_password;
      }
      
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
      
      const isClassTeacher = teacherData.isClassTeacher !== undefined 
        ? teacherData.isClassTeacher 
        : (teacherData.is_class_teacher !== undefined ? teacherData.is_class_teacher : false);
      
      if (isClassTeacher !== undefined) {
        payload.is_class_teacher = isClassTeacher;
      }
      
      if (teacherData.assignments && teacherData.assignments.length > 0) {
        payload.assignments = teacherData.assignments.map(assignment => {
          let classId = null;
          
          if (assignment.class) {
            if (typeof assignment.class === 'string' || typeof assignment.class === 'number') {
              classId = assignment.class;
            } else if (typeof assignment.class === 'object' && assignment.class.id) {
              classId = assignment.class.id;
            }
          }
          
          const subjectIds = [];
          if (assignment.subjects && Array.isArray(assignment.subjects)) {
            assignment.subjects.forEach(subjectId => {
              let id = subjectId;
              if (typeof subjectId === 'object' && subjectId !== null && subjectId.id) {
                id = subjectId.id;
              }
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
          
          const subjectIds = [];
          if (firstAssignment.subjects && Array.isArray(firstAssignment.subjects)) {
            firstAssignment.subjects.forEach(subjectId => {
              let id = subjectId;
              if (typeof subjectId === 'object' && subjectId !== null && subjectId.id) {
                id = subjectId.id;
              }
              if (id) {
                subjectIds.push(id);
              }
            });
          }
          payload.subject_ids = subjectIds;
        }
      } else if (teacherData.class_id || teacherData.classId) {
        payload.class_id = teacherData.class_id || teacherData.classId;
        if (teacherData.subject_ids || teacherData.subjectIds) {
          payload.subject_ids = Array.isArray(teacherData.subject_ids || teacherData.subjectIds) 
            ? (teacherData.subject_ids || teacherData.subjectIds)
            : [];
        } else {
          payload.subject_ids = [];
        }
      } else {
        payload.assignments = [];
        payload.subject_ids = [];
      }
      
      if (isClassTeacher && !payload.class_id) {
        console.warn('TeachersService: is_class_teacher is true but no class_id provided');
      }
      
      console.log('TeachersService: Transformed payload:', payload);
      
      return await apiService.post('/users/', payload);
    } catch (error) {
      throw new Error(`Failed to create teacher: ${error.message}`);
    }
  }

  async updateTeacher(teacherId, teacherData) {
    try {
      console.log('TeachersService: updateTeacher called with teacherData:', teacherData);
      
      const payload = {
        first_name: teacherData.firstName || teacherData.first_name,
        last_name: teacherData.lastName || teacherData.last_name,
        email: teacherData.email || null,
      };
      
      if (teacherData.password) {
        payload.password = teacherData.password;
      }
      if (teacherData.confirmPassword || teacherData.confirm_password) {
        payload.confirm_password = teacherData.confirmPassword || teacherData.confirm_password;
      }
      
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
      
      const isClassTeacher = teacherData.isClassTeacher !== undefined 
        ? teacherData.isClassTeacher 
        : (teacherData.is_class_teacher !== undefined ? teacherData.is_class_teacher : false);
      
      if (isClassTeacher !== undefined) {
        payload.is_class_teacher = isClassTeacher;
      }
      
      const hasExplicitAssignments = teacherData.assignments !== undefined;
      const hasExplicitClassId = teacherData.class_id !== undefined || teacherData.classId !== undefined;
      const hasExplicitSubjectIds = teacherData.subject_ids !== undefined || teacherData.subjectIds !== undefined;
      
      if (hasExplicitAssignments && teacherData.assignments && teacherData.assignments.length > 0) {
        console.log('TeachersService: Processing explicit assignments:', teacherData.assignments);
        
        payload.assignments = teacherData.assignments.map(assignment => {
          let classId = null;
          
          if (assignment.class) {
            if (typeof assignment.class === 'string' || typeof assignment.class === 'number') {
              classId = assignment.class;
            } else if (typeof assignment.class === 'object' && assignment.class.id) {
              classId = assignment.class.id;
            }
          }
          
          const subjectIds = [];
          if (assignment.subjects && Array.isArray(assignment.subjects)) {
            assignment.subjects.forEach(subjectId => {
              let id = subjectId;
              if (typeof subjectId === 'object' && subjectId !== null && subjectId.id) {
                id = subjectId.id;
              }
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
            console.log('TeachersService: Extracted class_id from first assignment:', classId);
          }
          
          const subjectIds = [];
          if (firstAssignment.subjects && Array.isArray(firstAssignment.subjects)) {
            firstAssignment.subjects.forEach(subjectId => {
              let id = subjectId;
              if (typeof subjectId === 'object' && subjectId !== null && subjectId.id) {
                id = subjectId.id;
              }
              if (id) {
                subjectIds.push(id);
              }
            });
          }
          payload.subject_ids = subjectIds;
          console.log('TeachersService: Extracted subject_ids from first assignment:', subjectIds);
        }
      } else if (hasExplicitClassId || hasExplicitSubjectIds) {
        if (hasExplicitClassId) {
          payload.class_id = teacherData.class_id || teacherData.classId;
        }
        if (hasExplicitSubjectIds) {
          payload.subject_ids = Array.isArray(teacherData.subject_ids || teacherData.subjectIds) 
            ? (teacherData.subject_ids || teacherData.subjectIds)
            : [];
        } else if (hasExplicitClassId) {
          payload.subject_ids = [];
        }
        console.log('TeachersService: Using explicit class_id and subject_ids:', payload.class_id, payload.subject_ids);
      } else {
        console.log('TeachersService: No assignments provided - ignoring assignments to preserve existing ones');
      }
      
      if (isClassTeacher && !payload.class_id) {
        console.warn('TeachersService: is_class_teacher is true but no class_id provided');
      }
      
      console.log('TeachersService: Final update payload:', payload);
      
      return await apiService.put(`/users/${teacherId}/`, payload);
    } catch (error) {
      throw new Error(`Failed to update teacher: ${error.message}`);
    }
  }

  async deleteTeacher(teacherId) {
    try {
      return await apiService.delete(`/users/${teacherId}/`);
    } catch (error) {
      throw new Error(`Failed to delete teacher: ${error.message}`);
    }
  }

  async getTeacherClasses(teacherId) {
    try {
      return await apiService.get(`/classes?teacher_id=${teacherId}`);
    } catch (error) {
      throw new Error(`Failed to fetch teacher classes: ${error.message}`);
    }
  }

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

  async getTeacherDashboardUsage(teacherId) {
    try {
      return await apiService.get(`/teachers/${teacherId}/dashboard-usage`);
    } catch (error) {
      throw new Error(`Failed to fetch teacher dashboard usage: ${error.message}`);
    }
  }

  async getTeacherStats() {
    try {
      return await apiService.get('/teachers/stats');
    } catch (error) {
      throw new Error(`Failed to fetch teacher statistics: ${error.message}`);
    }
  }

}

export default new TeachersService();
