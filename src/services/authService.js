// Authentication API service
import apiService from './api';

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const response = await apiService.requestWithMock('/auth/login', {
        method: 'POST',
        body: credentials,
      });

      if (response.token) {
        apiService.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Logout user
  async logout() {
    try {
      await apiService.requestWithMock('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout request failed:', error.message);
    } finally {
      apiService.removeAuthToken();
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      return await apiService.requestWithMock('/auth/me');
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      return await apiService.requestWithMock('/auth/profile', {
        method: 'PUT',
        body: profileData,
      });
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      return await apiService.requestWithMock('/auth/change-password', {
        method: 'POST',
        body: passwordData,
      });
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
