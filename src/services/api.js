import { store } from '../store/store';
import { logoutUser } from '../features/auth/authSlice';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    this.timeout = import.meta.env.VITE_API_TIMEOUT || import.meta.env.REACT_APP_API_TIMEOUT || 60000; // Increased to 60 seconds for slower connections and large requests
    this.isLoggingOut = false; // Flag to prevent multiple logout attempts
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  async handleApiFailure(error, endpoint, status = null) {
    const isMeEndpoint = endpoint.includes('/auth/me') || endpoint.includes('/auth/me/');
    const is401Error = status === 401;

    if (this.isLoggingOut || (!isMeEndpoint && !is401Error)) {
      return;
    }

    const currentPath = window.location.pathname;
    if (currentPath === '/login') {
      return;
    }

    this.isLoggingOut = true;

    try {
      this.removeAuthToken();

      store.dispatch(logoutUser());

      window.location.href = '/login';
    } catch (logoutError) {
      console.error('Error during logout:', logoutError);
      window.location.href = '/login';
    } finally {
      setTimeout(() => {
        this.isLoggingOut = false;
      }, 1000);
    }
  }

  getHeaders(includeAuth = true, endpoint = '', isFormData = false) {
    const headers = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const publicEndpoints = ['/auth/login/', '/auth/login', '/auth/register/', '/auth/register'];
    const isPublicEndpoint = publicEndpoints.some(publicPath => endpoint.includes(publicPath));

    if (includeAuth && !isPublicEndpoint) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    // Intercept ALL requests when mock mode is enabled
    if (this.shouldUseMockData()) {
      console.log(`[MOCK] Intercepting: ${options.method || 'GET'} ${endpoint}`);
      return this.getMockData(endpoint);
    }

    const url = `${this.baseURL}${endpoint}`;

    const isFormData = options.body instanceof FormData || options.isFormData === true;

    const config = {
      method: options.method || 'GET',
      headers: this.getHeaders(true, endpoint, isFormData),
    };

    const { method, body, isFormData: _, ...otherOptions } = options;
    Object.assign(config, otherOptions);

    if (body) {
      if (isFormData || body instanceof FormData) {
        config.body = body;
      } else if (typeof body === 'object') {
        config.body = JSON.stringify(body);
      } else {
        config.body = body;
      }
    }

    console.log(`API Request: ${config.method} ${url}`, {
      method: config.method,
      headers: config.headers,
      body: config.body
    });

    try {
      const controller = new AbortController();
      const requestTimeout = options.timeout || this.timeout;
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const publicEndpoints = ['/auth/login/', '/auth/login', '/auth/register/', '/auth/register'];
        const isPublicEndpoint = publicEndpoints.some(publicPath => endpoint.includes(publicPath));

        const errorData = await response.json().catch(() => ({}));

        const hasValidationErrors = errorData.errors ||
          errorData.non_field_errors ||
          (typeof errorData === 'object' && Object.keys(errorData).some(key =>
            Array.isArray(errorData[key]) || typeof errorData[key] === 'object'
          ));

        const isMeEndpoint = endpoint.includes('/auth/me') || endpoint.includes('/auth/me/');
        const is401Error = response.status === 401 && !isPublicEndpoint;

        if (isMeEndpoint || is401Error) {
          this.handleApiFailure(new Error(`HTTP error! status: ${response.status}`), endpoint, response.status);
        }

        const errorMessage = errorData.message ||
          errorData.detail ||
          (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors.join(', ')
            : null) ||
          (errorData.errors && typeof errorData.errors === 'string'
            ? errorData.errors
            : null) ||
          `HTTP error! status: ${response.status}`;

        const error = new Error(errorMessage);
        error.responseData = errorData; // Attach full error response
        error.status = response.status;
        throw error;
      }

      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');

      if (response.status === 204 || contentLength === '0' || !contentType?.includes('application/json')) {
        return { success: true, message: 'Operation completed successfully' };
      }

      const text = await response.text();
      if (!text || text.trim().length === 0) {
        return { success: true, message: 'Operation completed successfully' };
      }

      try {
        const data = JSON.parse(text);
        return data;
      } catch (parseError) {
        return { success: true, message: text || 'Operation completed successfully' };
      }
    } catch (error) {
      const publicEndpoints = ['/auth/login/', '/auth/login', '/auth/register/', '/auth/register'];
      const isPublicEndpoint = publicEndpoints.some(publicPath => endpoint.includes(publicPath));

      if (error.name === 'AbortError') {
        const isMeEndpoint = endpoint.includes('/auth/me') || endpoint.includes('/auth/me/');
        if (isMeEndpoint && !this.isLoggingOut) {
          this.handleApiFailure(error, endpoint, null);
        }
        throw new Error('Request timeout');
      }

      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('ERR_CONNECTION_REFUSED') ||
        error.message.includes('ERR_CONNECTION_RESET') ||
        error.message.includes('NetworkError') ||
        error.name === 'TypeError'
      ) {
        console.warn(`Backend not available at ${url}. Make sure the backend server is running.`);

        const isMeEndpoint = endpoint.includes('/auth/me') || endpoint.includes('/auth/me/');
        if (isMeEndpoint && !this.isLoggingOut) {
          this.handleApiFailure(error, endpoint, null);
        }

        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }

      const isMeEndpoint = endpoint.includes('/auth/me') || endpoint.includes('/auth/me/');
      if (isMeEndpoint && !this.isLoggingOut && !error.message.includes('Session expired')) {
        this.handleApiFailure(error, endpoint, null);
      }

      throw error;
    }
  }

  async testPost(endpoint, data) {
    console.log('Testing POST method...');
    return this.post(endpoint, data);
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData || options.isFormData === true;
    return this.request(endpoint, { ...options, method: 'POST', body: data, isFormData });
  }

  async put(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData || options.isFormData === true;
    return this.request(endpoint, { ...options, method: 'PUT', body: data, isFormData });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: data });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async getMockData(endpoint) {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const baseEndpoint = endpoint.split('?')[0].replace(/\/$/, '');

    const mockDataMap = {
      '/auth/login': () => import('../data/mockAuth'),
      '/auth/logout': () => import('../data/mockAuth'),
      '/auth/me': () => import('../data/mockAuth'),
      '/auth/profile': () => import('../data/mockAuth'),
      '/auth/change-password': () => import('../data/mockAuth'),

      '/students': () => import('../data/mockStudents'),
      '/students/stats': () => import('../data/mockStudents'),

      '/teachers': () => import('../data/mockTeachers'),
      '/teachers/stats': () => import('../data/mockTeachers'),

      '/questions': () => import('../data/mockQuestions'),
      '/questions/stats': () => import('../data/mockQuestions'),
      '/questions/ai/generate': () => import('../data/mockQuestions'),
      '/questions/ai/generated': () => import('../data/mockQuestions'),
      '/questions/ai/save': () => import('../data/mockQuestions'),

      '/dashboard': () => import('../data/mockDashboard'),
      '/dashboard/metrics': () => import('../data/mockDashboard'),
      '/dashboard/progress-trends': () => import('../data/mockDashboard'),
      '/dashboard/subject-performance': () => import('../data/mockDashboard'),
      '/dashboard/class-distribution': () => import('../data/mockDashboard'),
      '/dashboard/alerts': () => import('../data/mockDashboard'),
      '/dashboard/quick-summary': () => import('../data/mockDashboard'),
      '/dashboard/recent-activities': () => import('../data/mockDashboard'),

      '/reports': () => import('../data/mockReports'),
      '/reports/student-performance': () => import('../data/mockReports'),
      '/reports/progress-over-time': () => import('../data/mockReports'),
      '/reports/quiz-assignment-summaries': () => import('../data/mockReports'),
      '/reports/ai-insights': () => import('../data/mockReports'),
      '/reports/analytics': () => import('../data/mockReports'),
      '/reports/generate': () => import('../data/mockReports'),
      '/reports/templates': () => import('../data/mockReports'),
      '/reports/configurations': () => import('../data/mockReports'),

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

      if (mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }

      if (baseEndpoint.startsWith('/dashboard/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }

      if (baseEndpoint.startsWith('/students/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }

      if (baseEndpoint.startsWith('/teachers/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }

      if (baseEndpoint.startsWith('/questions/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }

      if (baseEndpoint.startsWith('/reports/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }

      if (baseEndpoint.startsWith('/ai/') && mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }

      return mockData;
    }

    throw new Error(`No mock data found for endpoint: ${baseEndpoint}`);
  }

  shouldUseMockData() {
    const useMockData = import.meta.env.VITE_USE_MOCK_DATA || import.meta.env.REACT_APP_USE_MOCK_DATA;
    return useMockData === 'true'; // Only use mock data if explicitly set to true
  }

  async requestWithMock(endpoint, options = {}) {
    if (this.shouldUseMockData()) {
      console.log(`Using mock data for: ${endpoint}`);
      return this.getMockData(endpoint);
    }
    return this.request(endpoint, options);
  }
}

const apiService = new ApiService();

export default apiService;
