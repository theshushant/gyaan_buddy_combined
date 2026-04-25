import apiService from './api';

class SubjectsService {
  async getSubjects(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/subjects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch subjects: ${error.message}`);
    }
  }

  async getSubjectById(subjectId) {
    try {
      return await apiService.get(`/subjects/${subjectId}`);
    } catch (error) {
      throw new Error(`Failed to fetch subject: ${error.message}`);
    }
  }

  async createSubject(subjectData, logoFile = null) {
    try {
      console.log('SubjectsService: Creating subject with data:', subjectData);
      
      const hasFile = logoFile instanceof File;
      
      let payload
      
      if (hasFile) {
        payload = new FormData()
        if (subjectData.name) {
          payload.append('name', String(subjectData.name))
        }
        if (subjectData.code) {
          payload.append('code', String(subjectData.code))
        }
        if (subjectData.description) {
          payload.append('description', String(subjectData.description))
        }
        const isActive = subjectData.is_active !== undefined ? subjectData.is_active : true
        payload.append('is_active', isActive ? 'True' : 'False')
        
        if (logoFile instanceof File) {
          payload.append('logo', logoFile)
        }
        
        if (subjectData.classes && Array.isArray(subjectData.classes) && subjectData.classes.length > 0) {
          subjectData.classes.forEach(classId => {
            payload.append('classes', String(classId))
          })
        }
      } else {
        payload = {
          name: subjectData.name,
          code: subjectData.code,
          description: subjectData.description || '',
          is_active: subjectData.is_active !== undefined ? subjectData.is_active : true
        }
        
        if (subjectData.classes && Array.isArray(subjectData.classes) && subjectData.classes.length > 0) {
          payload.classes = subjectData.classes
        }
      }
      
      const response = await apiService.post('/subjects/', payload, {
        isFormData: hasFile
      })
      console.log('SubjectsService: Subject created successfully:', response)
      return response
    } catch (error) {
      console.error('SubjectsService: Failed to create subject:', error)
      throw error
    }
  }

  async updateSubject(subjectId, subjectData, logoFile = null) {
    try {
      console.log('SubjectsService: Updating subject with data:', subjectData)
      
      const hasFile = logoFile instanceof File;
      
      let payload
      
      if (hasFile) {
        payload = new FormData()
        if (subjectData.name) {
          payload.append('name', String(subjectData.name))
        }
        if (subjectData.code) {
          payload.append('code', String(subjectData.code))
        }
        if (subjectData.description) {
          payload.append('description', String(subjectData.description))
        }
        const isActive = subjectData.is_active !== undefined ? subjectData.is_active : true
        payload.append('is_active', isActive ? 'True' : 'False')
        
        if (logoFile instanceof File) {
          payload.append('logo', logoFile)
        }
        
        if (subjectData.classes && Array.isArray(subjectData.classes) && subjectData.classes.length > 0) {
          subjectData.classes.forEach(classId => {
            payload.append('classes', String(classId))
          })
        }
      } else {
        payload = {
          name: subjectData.name,
          code: subjectData.code,
          description: subjectData.description || '',
          is_active: subjectData.is_active !== undefined ? subjectData.is_active : true
        }
        
        if (subjectData.classes && Array.isArray(subjectData.classes) && subjectData.classes.length > 0) {
          payload.classes = subjectData.classes
        }
      }
      
      const response = await apiService.put(`/subjects/${subjectId}/`, payload, {
        isFormData: hasFile
      })
      console.log('SubjectsService: Subject updated successfully:', response)
      return response
    } catch (error) {
      console.error('SubjectsService: Failed to update subject:', error)
      throw error
    }
  }

  async deleteSubject(subjectId) {
    try {
      return await apiService.delete(`/subjects/${subjectId}/`)
    } catch (error) {
      throw new Error(`Failed to delete subject: ${error.message}`)
    }
  }

  async importFromExcel({ classId, excelUrl, dryRun = false }) {
    try {
      const payload = { class_id: classId, dry_run: dryRun };
      if (excelUrl) payload.excel_url = excelUrl;
      return await apiService.post('/subjects/import_from_excel/', payload);
    } catch (error) {
      throw error;
    }
  }

  async getModules(subjectId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/subjects/${subjectId}/modules${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch modules: ${error.message}`);
    }
  }

  async getAllModules(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/modules${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch modules: ${error.message}`);
    }
  }

  async getChapters(moduleId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/modules/${moduleId}/module_chapters${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch chapters: ${error.message}`);
    }
  }

  async getAllChapters(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.module) queryParams.append('module', filters.module);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/module_chapters${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch chapters: ${error.message}`);
    }
  }
}

export default new SubjectsService();

