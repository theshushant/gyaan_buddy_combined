// Mock authentication data
export default {
  '/auth/login': {
    success: true,
    token: 'mock-jwt-token-12345',
    user: {
      id: '1',
      email: 'principal@school.com',
      firstName: 'Dr. Rajesh',
      lastName: 'Kumar',
      role: 'principal',
      avatar: null,
      school: {
        id: '1',
        name: 'Delhi Public School',
        address: 'New Delhi, India'
      }
    },
    message: 'Login successful'
  },
  
  '/auth/logout': {
    success: true,
    message: 'Logout successful'
  },
  
  '/auth/me': {
    id: '1',
    email: 'principal@school.com',
    firstName: 'Dr. Rajesh',
    lastName: 'Kumar',
    role: 'principal',
    avatar: null,
    school: {
      id: '1',
      name: 'Delhi Public School',
      address: 'New Delhi, India'
    },
    permissions: ['view_all', 'manage_teachers', 'manage_students', 'view_reports', 'manage_system']
  },
  
  '/auth/profile': {
    success: true,
    message: 'Profile updated successfully'
  },
  
  '/auth/change-password': {
    success: true,
    message: 'Password changed successfully'
  }
};
