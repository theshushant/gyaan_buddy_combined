// Authentication API service
import apiService from './api';

class AuthService {
  // Login user
  async login(credentials) {
    try {
      console.log('AuthService: Calling login API with credentials:', credentials);
      console.log('AuthService: About to call apiService.post...');
      
      // Clear any existing token before attempting login
      apiService.removeAuthToken();
      
      const response = await apiService.post('/auth/login/', credentials);
      console.log('AuthService: Login API response:', response);

      // Handle different response structures
      if (response.success || response.data) {
        const userData = response.data?.user || response.user;
        const tokenData = response.data?.tokens || response.tokens || response.data?.token || response.token;
        
        // Store the access token
        if (tokenData) {
          const accessToken = tokenData.access || tokenData;
          if (accessToken) {
            apiService.setAuthToken(accessToken);
          }
        }
        
        // Return the user data and tokens
        return {
          success: true,
          user: userData,
          tokens: tokenData
        };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('AuthService: Login error:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Logout user
  async logout() {
    try {
      await apiService.post('/auth/logout/');
    } catch (error) {
      console.warn('Logout request failed:', error.message);
    } finally {
      apiService.removeAuthToken();
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      // Always use the real API endpoint
      const response = await apiService.get('/auth/me/');
      
      // Handle different response structures
      // Backend might return the user object directly, or wrapped in { data: { user } }
      const userData = response.data?.user || response.user || response.data || response;
      
      // If response has user field, return it; otherwise return the whole response
      return userData;
    } catch (error) {
      console.error('AuthService: getCurrentUser error:', error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      return await apiService.put('/auth/profile', profileData);
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      return await apiService.post('/auth/change-password', passwordData);
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!apiService.getAuthToken();
  }

  // Get user role
  async getUserRole() {
    try {
      const user = await this.getCurrentUser();
      return user.role;
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();
