import apiService from './api';

class ModulesService {
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

  async getModuleById(moduleId) {
    try {
      return await apiService.get(`/modules/${moduleId}`);
    } catch (error) {
      throw new Error(`Failed to fetch module: ${error.message}`);
    }
  }

  async getModuleChapters(moduleId) {
    try {
      return await apiService.get(`/modules/${moduleId}/module_chapters/`, { timeout: 120000 });
    } catch (error) {
      throw new Error(`Failed to fetch module chapters: ${error.message}`);
    }
  }

  async getSubjectModules(subjectId) {
    try {
      return await apiService.get(`/subjects/${subjectId}/modules/`);
    } catch (error) {
      throw new Error(`Failed to fetch subject modules: ${error.message}`);
    }
  }

  async createModule(moduleData) {
    try {
      const hasFile = moduleData.logo instanceof File;
      
      let payload;
      if (hasFile) {
        payload = new FormData();
        payload.append('name', moduleData.name);
        payload.append('subject', moduleData.subject);
        
        if (moduleData.description) payload.append('description', moduleData.description);
        if (moduleData.order !== undefined) payload.append('order', moduleData.order);
        if (moduleData.logo) payload.append('logo', moduleData.logo);
        if (moduleData.is_active !== undefined) payload.append('is_active', moduleData.is_active);
        if (moduleData.is_enabled !== undefined) payload.append('is_enabled', moduleData.is_enabled);
      } else {
        payload = {
          name: moduleData.name,
          subject: moduleData.subject,
        };
        
        if (moduleData.description) payload.description = moduleData.description;
        if (moduleData.order !== undefined) payload.order = moduleData.order;
        if (moduleData.logo) payload.logo = moduleData.logo;
        if (moduleData.is_active !== undefined) payload.is_active = moduleData.is_active;
        if (moduleData.is_enabled !== undefined) payload.is_enabled = moduleData.is_enabled;
      }
      
      return await apiService.post('/modules/', payload, { isFormData: hasFile });
    } catch (error) {
      const newError = new Error(`Failed to create module: ${error.message}`);
      if (error.responseData) {
        newError.responseData = error.responseData;
      }
      if (error.status) {
        newError.status = error.status;
      }
      throw newError;
    }
  }

  async setModuleDue(moduleId, isDue) {
    try {
      return await apiService.patch(`/modules/${moduleId}/`, { is_due: isDue });
    } catch (error) {
      throw new Error(error.message || 'Failed to update module due status.');
    }
  }

  async setChapterDue(chapterId, isDue) {
    try {
      return await apiService.patch(`/module_chapters/${chapterId}/`, { is_due: isDue });
    } catch (error) {
      throw new Error(error.message || 'Failed to update assignment due status.');
    }
  }

  async updateModule(moduleId, moduleData) {
    try {
      const hasFile = moduleData.logo instanceof File;
      
      let payload;
      if (hasFile) {
        payload = new FormData();
        
        if (moduleData.name) payload.append('name', moduleData.name);
        if (moduleData.subject) payload.append('subject', moduleData.subject);
        if (moduleData.description !== undefined) payload.append('description', moduleData.description);
        if (moduleData.order !== undefined) payload.append('order', moduleData.order);
        if (moduleData.logo) payload.append('logo', moduleData.logo);
        if (moduleData.is_active !== undefined) payload.append('is_active', moduleData.is_active);
        if (moduleData.is_enabled !== undefined) payload.append('is_enabled', moduleData.is_enabled);
        if (moduleData.is_due !== undefined) payload.append('is_due', moduleData.is_due);
      } else {
        payload = {};
        
        if (moduleData.name) payload.name = moduleData.name;
        if (moduleData.subject) payload.subject = moduleData.subject;
        if (moduleData.description !== undefined) payload.description = moduleData.description;
        if (moduleData.order !== undefined) payload.order = moduleData.order;
        if (moduleData.logo !== undefined) payload.logo = moduleData.logo;
        if (moduleData.is_active !== undefined) payload.is_active = moduleData.is_active;
        if (moduleData.is_enabled !== undefined) payload.is_enabled = moduleData.is_enabled;
        if (moduleData.is_due !== undefined) payload.is_due = moduleData.is_due;
      }
      
      return await apiService.put(`/modules/${moduleId}/`, payload, { isFormData: hasFile });
    } catch (error) {
      const newError = new Error(`Failed to update module: ${error.message}`);
      if (error.responseData) {
        newError.responseData = error.responseData;
      }
      if (error.status) {
        newError.status = error.status;
      }
      throw newError;
    }
  }

  async deleteModule(moduleId) {
    try {
      return await apiService.delete(`/modules/${moduleId}/`);
    } catch (error) {
      throw new Error(`Failed to delete module: ${error.message}`);
    }
  }

  async createChapter(moduleId, chapterData) {
    try {
      const hasFile = chapterData.logo instanceof File;
      
      let payload;
      if (hasFile) {
        payload = new FormData();
        payload.append('module', moduleId);
        payload.append('title', chapterData.title);
        
        if (chapterData.description) payload.append('description', chapterData.description);
        if (chapterData.order !== undefined) payload.append('order', chapterData.order);
        if (chapterData.logo) payload.append('logo', chapterData.logo);
        if (chapterData.is_enabled !== undefined) payload.append('is_enabled', chapterData.is_enabled);
        if (chapterData.is_important !== undefined) payload.append('is_important', chapterData.is_important);
      } else {
        payload = {
          module: moduleId,
          title: chapterData.title,
        };
        
        if (chapterData.description) payload.description = chapterData.description;
        if (chapterData.order !== undefined) payload.order = chapterData.order;
        if (chapterData.logo) payload.logo = chapterData.logo;
        if (chapterData.is_enabled !== undefined) payload.is_enabled = chapterData.is_enabled;
        if (chapterData.is_important !== undefined) payload.is_important = chapterData.is_important;
      }
      
      const response = await apiService.post('/module_chapters/', payload, { isFormData: hasFile, timeout: 120000 });
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create chapter. Please try again.');
    }
  }

  async updateChapter(chapterId, chapterData) {
    try {
      const hasFile = chapterData.logo instanceof File;
      
      let payload;
      if (hasFile) {
        payload = new FormData();
        
        if (chapterData.title) payload.append('title', chapterData.title);
        if (chapterData.module) payload.append('module', chapterData.module);
        if (chapterData.description !== undefined) payload.append('description', chapterData.description);
        if (chapterData.order !== undefined) payload.append('order', chapterData.order);
        if (chapterData.logo) payload.append('logo', chapterData.logo);
        if (chapterData.is_enabled !== undefined) payload.append('is_enabled', chapterData.is_enabled);
        if (chapterData.is_important !== undefined) payload.append('is_important', chapterData.is_important);
        if (chapterData.is_due !== undefined) payload.append('is_due', chapterData.is_due);
      } else {
        payload = {};
        
        if (chapterData.title) payload.title = chapterData.title;
        if (chapterData.module) payload.module = chapterData.module;
        if (chapterData.description !== undefined) payload.description = chapterData.description;
        if (chapterData.order !== undefined) payload.order = chapterData.order;
        if (chapterData.logo !== undefined) payload.logo = chapterData.logo;
        if (chapterData.is_enabled !== undefined) payload.is_enabled = chapterData.is_enabled;
        if (chapterData.is_important !== undefined) payload.is_important = chapterData.is_important;
        if (chapterData.is_due !== undefined) payload.is_due = chapterData.is_due;
      }
      
      return await apiService.put(`/module_chapters/${chapterId}/`, payload, { isFormData: hasFile, timeout: 120000 });
    } catch (error) {
      throw new Error(`Failed to update chapter: ${error.message}`);
    }
  }

  async deleteChapter(chapterId) {
    try {
      return await apiService.delete(`/module_chapters/${chapterId}/`, { timeout: 120000 });
    } catch (error) {
      throw new Error(`Failed to delete chapter: ${error.message}`);
    }
  }

  async getChapterQuestions(chapterId) {
    try {
      return await apiService.get(`/module_chapters/${chapterId}/module_questions/`, { timeout: 120000 });
    } catch (error) {
      throw new Error(`Failed to fetch chapter questions: ${error.message}`);
    }
  }

  async getChapterModuleContent(chapterId) {
    try {
      return await apiService.get(`/module_chapters/${chapterId}/module_content/`, { timeout: 120000 });
    } catch (error) {
      throw new Error(`Failed to fetch chapter module content: ${error.message}`);
    }
  }

  async createChapterModuleContent(chapterId, contentData) {
    try {
      const payload = {
        type: contentData.type || contentData.content_type || 'question',
      };
      
      if (payload.type === 'question' && contentData.question) {
        payload.question = contentData.question;
      } else if (payload.type === 'theory' && contentData.theory) {
        payload.theory = contentData.theory;
      }
      
      const response = await apiService.post(`/module_chapters/${chapterId}/module_content/`, payload, { timeout: 120000 });
      return response;
    } catch (error) {
      throw new Error(`Failed to create module content: ${error.message}`);
    }
  }

  async getMissionQuestions(missionId) {
    try {
      return await apiService.get(`/missions/${missionId}/questions/`);
    } catch (error) {
      throw new Error(`Failed to fetch mission questions: ${error.message}`);
    }
  }
}

export default new ModulesService();

