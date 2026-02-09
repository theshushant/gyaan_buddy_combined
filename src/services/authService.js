import apiService from './api';

class AuthService {
  async login(credentials) {
    try {
      console.log('AuthService: Calling login API with credentials:', credentials);
      console.log('AuthService: About to call apiService.post...');
      
      apiService.removeAuthToken();
      
      const response = await apiService.post('/auth/login/', credentials);
      console.log('AuthService: Login API response:', response);

      if (response.success || response.data) {
        const userData = response.data?.user || response.user;
        const tokenData = response.data?.tokens || response.tokens || response.data?.token || response.token;
        
        if (tokenData) {
          const accessToken = tokenData.access || tokenData;
          if (accessToken) {
            apiService.setAuthToken(accessToken);
          }
        }
        
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

  async logout() {
    try {
      await apiService.post('/auth/logout/');
    } catch (error) {
      console.warn('Logout request failed:', error.message);
    } finally {
      apiService.removeAuthToken();
    }
  }

  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/me/');
      
      const userData = response.data?.user || response.user || response.data || response;
      
      return userData;
    } catch (error) {
      console.error('AuthService: getCurrentUser error:', error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  async updateProfile(profileData) {
    try {
      return await apiService.put('/auth/profile', profileData);
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  async changePassword(passwordData) {
    try {
      return await apiService.post('/auth/change-password', passwordData);
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  isAuthenticated() {
    return !!apiService.getAuthToken();
  }

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
