// Base API configuration and service layer
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.timeout = 10000; // 10 seconds
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  // Create headers for API requests
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: this.getHeaders(),
      ...options,
    };

    // Add body for POST/PUT/PATCH requests
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // HTTP Methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: data });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Mock data methods (for development)
  async getMockData(endpoint) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Remove query parameters to match mock data keys
    const baseEndpoint = endpoint.split('?')[0];
    
    // Import mock data based on endpoint
    const mockDataMap = {
      // Auth endpoints
      '/auth/login': () => import('../data/mockAuth'),
      '/auth/logout': () => import('../data/mockAuth'),
      '/auth/me': () => import('../data/mockAuth'),
      '/auth/profile': () => import('../data/mockAuth'),
      '/auth/change-password': () => import('../data/mockAuth'),
      
      // Students endpoints
      '/students': () => import('../data/mockStudents'),
      '/students/stats': () => import('../data/mockStudents'),
      
      // Teachers endpoints
      '/teachers': () => import('../data/mockTeachers'),
      '/teachers/stats': () => import('../data/mockTeachers'),
      
      // Questions endpoints
      '/questions': () => import('../data/mockQuestions'),
      '/questions/stats': () => import('../data/mockQuestions'),
      '/questions/ai/generate': () => import('../data/mockQuestions'),
      '/questions/ai/generated': () => import('../data/mockQuestions'),
      '/questions/ai/save': () => import('../data/mockQuestions'),
      
      // Dashboard endpoints
      '/dashboard': () => import('../data/mockDashboard'),
      '/dashboard/metrics': () => import('../data/mockDashboard'),
      '/dashboard/progress-trends': () => import('../data/mockDashboard'),
      '/dashboard/subject-performance': () => import('../data/mockDashboard'),
      '/dashboard/class-distribution': () => import('../data/mockDashboard'),
      '/dashboard/alerts': () => import('../data/mockDashboard'),
      '/dashboard/quick-summary': () => import('../data/mockDashboard'),
      '/dashboard/recent-activities': () => import('../data/mockDashboard'),
      
      // Reports endpoints
      '/reports': () => import('../data/mockReports'),
      '/reports/student-performance': () => import('../data/mockReports'),
      '/reports/progress-over-time': () => import('../data/mockReports'),
      '/reports/quiz-assignment-summaries': () => import('../data/mockReports'),
      '/reports/ai-insights': () => import('../data/mockReports'),
      '/reports/analytics': () => import('../data/mockReports'),
      '/reports/generate': () => import('../data/mockReports'),
      '/reports/templates': () => import('../data/mockReports'),
      '/reports/configurations': () => import('../data/mockReports'),
      
      // AI endpoints
      '/ai/suggestions': () => import('../data/mockAISuggestions'),
      '/ai/insights': () => import('../data/mockAIInsights'),
      '/ai/generate': () => import('../data/mockAIInsights'),
      '/ai/questions/generate': () => import('../data/mockQuestions'),
      '/ai/analyze': () => import('../data/mockAIInsights'),
      '/ai/recommendations': () => import('../data/mockAISuggestions'),
      '/ai/heatmap': () => import('../data/mockAIInsights'),
      '/ai/remedial-activities': () => import('../data/mockAISuggestions'),
    };

    const mockDataLoader = mockDataMap[baseEndpoint];
    if (mockDataLoader) {
      const mockModule = await mockDataLoader();
      const mockData = mockModule.default || mockModule;
      
      // For dashboard endpoints, return the specific data for that endpoint
      if (baseEndpoint.startsWith('/dashboard/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }
      
      // For students endpoints, return the specific data for that endpoint
      if (baseEndpoint.startsWith('/students/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }
      
      // For teachers endpoints, return the specific data for that endpoint
      if (baseEndpoint.startsWith('/teachers/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }
      
      // For questions endpoints, return the specific data for that endpoint
      if (baseEndpoint.startsWith('/questions/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }
      
      // For reports endpoints, return the specific data for that endpoint
      if (baseEndpoint.startsWith('/reports/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }
      
      // For AI endpoints, return the specific data for that endpoint
      if (baseEndpoint.startsWith('/ai/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }
      
      return mockData;
    }

    throw new Error(`No mock data found for endpoint: ${baseEndpoint}`);
  }

  // Check if we're in development mode and should use mock data
  shouldUseMockData() {
    return import.meta.env.DEV; // Always use mock data in development
  }

  // Enhanced request method that can use mock data
  async requestWithMock(endpoint, options = {}) {
    if (this.shouldUseMockData()) {
      console.log(`Using mock data for: ${endpoint}`);
      return this.getMockData(endpoint);
    }
    return this.request(endpoint, options);
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
