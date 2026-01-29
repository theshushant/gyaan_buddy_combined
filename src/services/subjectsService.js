// Subjects API service
import apiService from './api';

class SubjectsService {
  // Get all subjects with optional filters
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

  // Get subject by ID
  async getSubjectById(subjectId) {
    try {
      return await apiService.get(`/subjects/${subjectId}`);
    } catch (error) {
      throw new Error(`Failed to fetch subject: ${error.message}`);
    }
  }

  // Create a new subject
  async createSubject(subjectData, logoFile = null) {
    try {
      console.log('SubjectsService: Creating subject with data:', subjectData);
      
      // Check if logo is a File object (for file upload)
      const hasFile = logoFile instanceof File;
      
      // Prepare FormData if logo file is provided, otherwise use JSON
      let payload
      
      if (hasFile) {
        // Use FormData for file upload
        payload = new FormData()
        // Only append non-empty values
        if (subjectData.name) {
          payload.append('name', String(subjectData.name))
        }
        if (subjectData.code) {
          payload.append('code', String(subjectData.code))
        }
        if (subjectData.description) {
          payload.append('description', String(subjectData.description))
        }
        // Convert boolean to Django-compatible string format
        const isActive = subjectData.is_active !== undefined ? subjectData.is_active : true
        payload.append('is_active', isActive ? 'True' : 'False')
        
        // Add logo file - only if it's actually a File object
        if (logoFile instanceof File) {
          payload.append('logo', logoFile)
        }
        
        // Add classes if provided
        if (subjectData.classes && Array.isArray(subjectData.classes) && subjectData.classes.length > 0) {
          subjectData.classes.forEach(classId => {
            payload.append('classes', String(classId))
          })
        }
      } else {
        // Use JSON for regular data
        payload = {
          name: subjectData.name,
          code: subjectData.code,
          description: subjectData.description || '',
          is_active: subjectData.is_active !== undefined ? subjectData.is_active : true
        }
        
        // Add classes if provided
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

  // Update an existing subject
  async updateSubject(subjectId, subjectData, logoFile = null) {
    try {
      console.log('SubjectsService: Updating subject with data:', subjectData)
      
      // Check if logo is a File object (for file upload)
      const hasFile = logoFile instanceof File;
      
      // Prepare FormData if logo file is provided, otherwise use JSON
      let payload
      
      if (hasFile) {
        // Use FormData for file upload
        payload = new FormData()
        // Only append non-empty values
        if (subjectData.name) {
          payload.append('name', String(subjectData.name))
        }
        if (subjectData.code) {
          payload.append('code', String(subjectData.code))
        }
        if (subjectData.description) {
          payload.append('description', String(subjectData.description))
        }
        // Convert boolean to Django-compatible string format
        const isActive = subjectData.is_active !== undefined ? subjectData.is_active : true
        payload.append('is_active', isActive ? 'True' : 'False')
        
        // Add logo file - only if it's actually a File object
        if (logoFile instanceof File) {
          payload.append('logo', logoFile)
        }
        
        // Add classes if provided
        if (subjectData.classes && Array.isArray(subjectData.classes) && subjectData.classes.length > 0) {
          subjectData.classes.forEach(classId => {
            payload.append('classes', String(classId))
          })
        }
      } else {
        // Use JSON for regular data
        payload = {
          name: subjectData.name,
          code: subjectData.code,
          description: subjectData.description || '',
          is_active: subjectData.is_active !== undefined ? subjectData.is_active : true
        }
        
        // Add classes if provided
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

  // Delete a subject
  async deleteSubject(subjectId) {
    try {
      return await apiService.delete(`/subjects/${subjectId}/`)
    } catch (error) {
      throw new Error(`Failed to delete subject: ${error.message}`)
    }
  }

  // Get modules for a subject
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

  // Get all modules (with optional subject filter)
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

  // Get chapters for a module
  async getChapters(moduleId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      // Use the module_chapters action endpoint
      const endpoint = `/modules/${moduleId}/module_chapters${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch chapters: ${error.message}`);
    }
  }

  // Get all chapters (with optional module filter)
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

