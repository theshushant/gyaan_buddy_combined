// Modules API service
import apiService from './api';

class ModulesService {
  // Get all modules with optional filters
  async getModules(filters = {}) {
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

  // Get module by ID
  async getModuleById(moduleId) {
    try {
      return await apiService.get(`/modules/${moduleId}`);
    } catch (error) {
      throw new Error(`Failed to fetch module: ${error.message}`);
    }
  }

  // Get chapters for a specific module
  async getModuleChapters(moduleId) {
    try {
      return await apiService.get(`/modules/${moduleId}/module_chapters/`);
    } catch (error) {
      throw new Error(`Failed to fetch module chapters: ${error.message}`);
    }
  }

  // Get modules for a specific subject
  async getSubjectModules(subjectId) {
    try {
      return await apiService.get(`/subjects/${subjectId}/modules/`);
    } catch (error) {
      throw new Error(`Failed to fetch subject modules: ${error.message}`);
    }
  }

  // Create a new module
  async createModule(moduleData) {
    try {
      // Check if logo is a File object (for file upload)
      const hasFile = moduleData.logo instanceof File;
      
      let payload;
      if (hasFile) {
        // Use FormData for file uploads
        payload = new FormData();
        payload.append('name', moduleData.name);
        payload.append('subject', moduleData.subject);
        
        // Add optional fields if they exist
        if (moduleData.description) payload.append('description', moduleData.description);
        if (moduleData.order !== undefined) payload.append('order', moduleData.order);
        if (moduleData.logo) payload.append('logo', moduleData.logo);
        if (moduleData.is_active !== undefined) payload.append('is_active', moduleData.is_active);
        if (moduleData.is_enabled !== undefined) payload.append('is_enabled', moduleData.is_enabled);
      } else {
        // Use regular JSON payload
        payload = {
          name: moduleData.name,
          subject: moduleData.subject,
        };
        
        // Add optional fields if they exist
        if (moduleData.description) payload.description = moduleData.description;
        if (moduleData.order !== undefined) payload.order = moduleData.order;
        if (moduleData.logo) payload.logo = moduleData.logo;
        if (moduleData.is_active !== undefined) payload.is_active = moduleData.is_active;
        if (moduleData.is_enabled !== undefined) payload.is_enabled = moduleData.is_enabled;
      }
      
      return await apiService.post('/modules/', payload, { isFormData: hasFile });
    } catch (error) {
      throw new Error(`Failed to create module: ${error.message}`);
    }
  }

  // Update a module
  async updateModule(moduleId, moduleData) {
    try {
      // Check if logo is a File object (for file upload)
      const hasFile = moduleData.logo instanceof File;
      
      let payload;
      if (hasFile) {
        // Use FormData for file uploads
        payload = new FormData();
        
        if (moduleData.name) payload.append('name', moduleData.name);
        if (moduleData.subject) payload.append('subject', moduleData.subject);
        if (moduleData.description !== undefined) payload.append('description', moduleData.description);
        if (moduleData.order !== undefined) payload.append('order', moduleData.order);
        if (moduleData.logo) payload.append('logo', moduleData.logo);
        if (moduleData.is_active !== undefined) payload.append('is_active', moduleData.is_active);
        if (moduleData.is_enabled !== undefined) payload.append('is_enabled', moduleData.is_enabled);
      } else {
        // Use regular JSON payload
        payload = {};
        
        if (moduleData.name) payload.name = moduleData.name;
        if (moduleData.subject) payload.subject = moduleData.subject;
        if (moduleData.description !== undefined) payload.description = moduleData.description;
        if (moduleData.order !== undefined) payload.order = moduleData.order;
        if (moduleData.logo !== undefined) payload.logo = moduleData.logo;
        if (moduleData.is_active !== undefined) payload.is_active = moduleData.is_active;
        if (moduleData.is_enabled !== undefined) payload.is_enabled = moduleData.is_enabled;
      }
      
      return await apiService.put(`/modules/${moduleId}/`, payload, { isFormData: hasFile });
    } catch (error) {
      throw new Error(`Failed to update module: ${error.message}`);
    }
  }

  // Delete a module
  async deleteModule(moduleId) {
    try {
      return await apiService.delete(`/modules/${moduleId}/`);
    } catch (error) {
      throw new Error(`Failed to delete module: ${error.message}`);
    }
  }

  // Create a new chapter for a module
  async createChapter(moduleId, chapterData) {
    try {
      const payload = {
        module: moduleId,
        title: chapterData.title,
      };
      
      // Add optional fields if they exist
      if (chapterData.description) payload.description = chapterData.description;
      if (chapterData.order !== undefined) payload.order = chapterData.order;
      if (chapterData.logo) payload.logo = chapterData.logo;
      if (chapterData.is_enabled !== undefined) payload.is_enabled = chapterData.is_enabled;
      if (chapterData.is_important !== undefined) payload.is_important = chapterData.is_important;
      
      const response = await apiService.post('/module_chapters/', payload);
      
      // Handle response structure: { success: true, data: {...}, message: "..." }
      // The backend returns: { success: true, data: {...}, message: "..." }
      return response;
    } catch (error) {
      // The API service already extracts the error message from the backend response
      // Backend returns: { success: false, message: "...", errors: {...} }
      // API service extracts errorData.message and throws it as Error
      throw new Error(error.message || 'Failed to create chapter. Please try again.');
    }
  }

  // Update a chapter
  async updateChapter(chapterId, chapterData) {
    try {
      const payload = {};
      
      if (chapterData.title) payload.title = chapterData.title;
      if (chapterData.module) payload.module = chapterData.module;
      if (chapterData.description !== undefined) payload.description = chapterData.description;
      if (chapterData.order !== undefined) payload.order = chapterData.order;
      if (chapterData.logo !== undefined) payload.logo = chapterData.logo;
      if (chapterData.is_enabled !== undefined) payload.is_enabled = chapterData.is_enabled;
      if (chapterData.is_important !== undefined) payload.is_important = chapterData.is_important;
      
      return await apiService.put(`/module_chapters/${chapterId}/`, payload);
    } catch (error) {
      throw new Error(`Failed to update chapter: ${error.message}`);
    }
  }

  // Delete a chapter
  async deleteChapter(chapterId) {
    try {
      return await apiService.delete(`/module_chapters/${chapterId}/`);
    } catch (error) {
      throw new Error(`Failed to delete chapter: ${error.message}`);
    }
  }

  // Get module content (questions) for a chapter
  async getChapterQuestions(chapterId) {
    try {
      return await apiService.get(`/module_chapters/${chapterId}/module_questions/`);
    } catch (error) {
      throw new Error(`Failed to fetch chapter questions: ${error.message}`);
    }
  }

  // Get module content for a chapter (questions and theories)
  async getChapterModuleContent(chapterId) {
    try {
      return await apiService.get(`/module_chapters/${chapterId}/module_content/`);
    } catch (error) {
      throw new Error(`Failed to fetch chapter module content: ${error.message}`);
    }
  }

  // Create module content for a chapter (question or theory)
  async createChapterModuleContent(chapterId, contentData) {
    try {
      const payload = {
        type: contentData.type || contentData.content_type || 'question',
      };
      
      // Add question or theory based on type
      if (payload.type === 'question' && contentData.question) {
        payload.question = contentData.question;
      } else if (payload.type === 'theory' && contentData.theory) {
        payload.theory = contentData.theory;
      }
      
      const response = await apiService.post(`/module_chapters/${chapterId}/module_content/`, payload);
      return response;
    } catch (error) {
      throw new Error(`Failed to create module content: ${error.message}`);
    }
  }

  // Get questions for a mission
  async getMissionQuestions(missionId) {
    try {
      return await apiService.get(`/missions/${missionId}/questions/`);
    } catch (error) {
      throw new Error(`Failed to fetch mission questions: ${error.message}`);
    }
  }
}

export default new ModulesService();

