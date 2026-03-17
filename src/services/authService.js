import apiService from './api';

class AuthService {
  async login(credentials) {
    try {
      console.log('AuthService: Calling login API with credentials:', credentials);
      console.log('AuthService: About to call apiService.post...');
      
      apiService.removeAuthToken();

      let response
      try {
        response = await apiService.post('/auth/login/', credentials)
      } catch (firstError) {
        // Backward compatibility: some backend versions only allow mobile/dashboard types.
        // Parent portal still uses student account auth, so retry with "mobile" type.
        if (credentials?.type === 'parent_dashboard') {
          console.warn('AuthService: parent_dashboard login failed, retrying with mobile type', firstError)
          const retryPayload = { ...credentials, type: 'mobile' }
          response = await apiService.post('/auth/login/', retryPayload)
        } else {
          throw firstError
        }
      }
      console.log('AuthService: Login API response:', response);

      if (response.success || response.data || response.user) {
        const userData = response.data?.user || response.user || response;
        const tokenData = response.data?.tokens || response.tokens || response.data?.token || response.token;
        const portalType = response.data?.portal_type || credentials?.type || null;
        if (portalType) {
          localStorage.setItem('gbPortalMode', portalType);
        }
        
        if (tokenData) {
          const accessToken = typeof tokenData === 'object' ? (tokenData.access || tokenData.token) : tokenData;
          if (accessToken) {
            apiService.setAuthToken(accessToken);
          }
        }
        
        return {
          success: true,
          user: userData,
          tokens: tokenData,
          portal_type: portalType
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
      apiService.setUsedMockData(false);
      localStorage.removeItem('gbPortalMode');
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
