// Base API configuration and service layer
import { store } from '../store/store';
import { logoutUser } from '../features/auth/authSlice';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    this.timeout = import.meta.env.VITE_API_TIMEOUT || import.meta.env.REACT_APP_API_TIMEOUT || 15000; // Increased to 15 seconds for slower connections
    this.isLoggingOut = false; // Flag to prevent multiple logout attempts
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

  // Handle API failure by logging out user and redirecting to login
  async handleApiFailure(error, endpoint) {
    // Don't logout for public endpoints
    const publicEndpoints = ['/auth/login/', '/auth/login', '/auth/register/', '/auth/register', '/auth/logout/'];
    const isPublicEndpoint = publicEndpoints.some(publicPath => endpoint.includes(publicPath));
    
    // Don't logout if already logging out or if it's a public endpoint
    if (this.isLoggingOut || isPublicEndpoint) {
      return;
    }

    // Don't logout if already on login page
    const currentPath = window.location.pathname;
    if (currentPath === '/login') {
      return;
    }

    // Set flag to prevent multiple logout attempts
    this.isLoggingOut = true;

    try {
      // Clear auth token
      this.removeAuthToken();
      
      // Dispatch logout action to clear Redux state
      store.dispatch(logoutUser());
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (logoutError) {
      console.error('Error during logout:', logoutError);
      // Even if logout fails, still redirect to login
      window.location.href = '/login';
    } finally {
      // Reset flag after a delay to allow for future logouts if needed
      setTimeout(() => {
        this.isLoggingOut = false;
      }, 1000);
    }
  }

  // Create headers for API requests
  getHeaders(includeAuth = true, endpoint = '', isFormData = false) {
    const headers = {};

    // Only set Content-Type for non-FormData requests
    // For FormData, let the browser set it with the boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Don't include auth for public endpoints
    const publicEndpoints = ['/auth/login/', '/auth/login', '/auth/register/', '/auth/register'];
    const isPublicEndpoint = publicEndpoints.some(publicPath => endpoint.includes(publicPath));
    
    // Only include auth if explicitly requested AND not a public endpoint
    if (includeAuth && !isPublicEndpoint) {
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
    
    // Check if body is FormData
    const isFormData = options.body instanceof FormData || options.isFormData === true;
    
    // Build config object with explicit method handling
    const config = {
      method: options.method || 'GET',
      headers: this.getHeaders(true, endpoint, isFormData),
    };

    // Add other options (excluding method and isFormData to avoid conflicts)
    const { method, body, isFormData: _, ...otherOptions } = options;
    Object.assign(config, otherOptions);

    // Add body for POST/PUT/PATCH requests
    if (body) {
      if (isFormData || body instanceof FormData) {
        // For FormData, send as-is (browser will set Content-Type with boundary)
        config.body = body;
      } else if (typeof body === 'object') {
        // For regular objects, stringify as JSON
        config.body = JSON.stringify(body);
      } else {
        // For other types, send as-is
        config.body = body;
      }
    }

    // Debug logging
    console.log(`API Request: ${config.method} ${url}`, {
      method: config.method,
      headers: config.headers,
      body: config.body
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle API failures - logout user and redirect to login to prevent infinite retries
        // Don't handle errors for public endpoints (login, register)
        const publicEndpoints = ['/auth/login/', '/auth/login', '/auth/register/', '/auth/register'];
        const isPublicEndpoint = publicEndpoints.some(publicPath => endpoint.includes(publicPath));
        
        // Don't logout on validation errors (400, 404, 422) - these are user input errors
        const validationErrorCodes = [400, 404, 422];
        const isValidationError = validationErrorCodes.includes(response.status);
        
        // For non-public endpoints, logout on any error except validation errors
        if (!isPublicEndpoint && !isValidationError) {
          // Handle the logout asynchronously to avoid blocking error throwing
          this.handleApiFailure(new Error(`HTTP error! status: ${response.status}`), endpoint);
        }
        
        // Get error message from response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.detail || `HTTP error! status: ${response.status}`;
        
        throw new Error(errorMessage);
      }

      // Handle responses that may have no content (e.g., 204 No Content for DELETE)
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // Check if response has content
      if (response.status === 204 || contentLength === '0' || !contentType?.includes('application/json')) {
        // For successful DELETE requests with no content, return a success object
        return { success: true, message: 'Operation completed successfully' };
      }

      // Try to parse JSON, but handle empty responses gracefully
      const text = await response.text();
      if (!text || text.trim().length === 0) {
        return { success: true, message: 'Operation completed successfully' };
      }

      try {
        const data = JSON.parse(text);
        return data;
      } catch (parseError) {
        // If JSON parsing fails, return the text as a message
        return { success: true, message: text || 'Operation completed successfully' };
      }
    } catch (error) {
      // Don't logout for public endpoints or if already logging out
      const publicEndpoints = ['/auth/login/', '/auth/login', '/auth/register/', '/auth/register'];
      const isPublicEndpoint = publicEndpoints.some(publicPath => endpoint.includes(publicPath));
      
      if (error.name === 'AbortError') {
        // Timeout errors - logout user if not a public endpoint
        if (!isPublicEndpoint && !this.isLoggingOut) {
          this.handleApiFailure(error, endpoint);
        }
        throw new Error('Request timeout');
      }
      
      // Handle connection errors - logout user if not a public endpoint
      if (
        error.message.includes('Failed to fetch') || 
        error.message.includes('ERR_CONNECTION_REFUSED') ||
        error.message.includes('ERR_CONNECTION_RESET') ||
        error.message.includes('NetworkError') ||
        error.name === 'TypeError'
      ) {
        console.warn(`Backend not available at ${url}. Make sure the backend server is running.`);
        
        // Logout user on connection errors (except for public endpoints)
        if (!isPublicEndpoint && !this.isLoggingOut) {
          this.handleApiFailure(error, endpoint);
        }
        
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      
      // For any other errors, logout if not a public endpoint
      if (!isPublicEndpoint && !this.isLoggingOut && !error.message.includes('Session expired')) {
        this.handleApiFailure(error, endpoint);
      }
      
      throw error;
    }
  }

  // Test method to verify POST requests work correctly
  async testPost(endpoint, data) {
    console.log('Testing POST method...');
    return this.post(endpoint, data);
  }

  // HTTP Methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    // Check if data is FormData
    const isFormData = data instanceof FormData || options.isFormData === true;
    return this.request(endpoint, { ...options, method: 'POST', body: data, isFormData });
  }

  async put(endpoint, data, options = {}) {
    // Check if data is FormData
    const isFormData = data instanceof FormData || options.isFormData === true;
    return this.request(endpoint, { ...options, method: 'PUT', body: data, isFormData });
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
    
    // Remove query parameters and trailing slash to match mock data keys
    const baseEndpoint = endpoint.split('?')[0].replace(/\/$/, '');
    
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
      
      // Return endpoint-specific data if it exists
      if (mockData[baseEndpoint]) {
        return mockData[baseEndpoint];
      }
      
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
    const useMockData = import.meta.env.VITE_USE_MOCK_DATA || import.meta.env.REACT_APP_USE_MOCK_DATA;
    return useMockData === 'true'; // Only use mock data if explicitly set to true
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
