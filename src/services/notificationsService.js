// Notifications API service
import apiService from './api';

class NotificationsService {
  // Get all notifications for current user
  async getNotifications(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.is_read !== undefined) queryParams.append('is_read', filters.is_read);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/notifications/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('NotificationsService: Fetching notifications from', endpoint);
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('NotificationsService: Failed to fetch notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }

  // Get student notifications (for teachers)
  async getStudentNotifications(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.class_id) queryParams.append('class_id', filters.class_id);
      if (filters.is_read !== undefined) queryParams.append('is_read', filters.is_read);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/notifications/student_notifications/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('NotificationsService: Fetching student notifications from', endpoint);
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('NotificationsService: Failed to fetch student notifications:', error);
      throw new Error(`Failed to fetch student notifications: ${error.message}`);
    }
  }

  // Mark a notification as read
  async markAsRead(notificationId) {
    try {
      console.log('NotificationsService: Marking notification as read:', notificationId);
      return await apiService.post(`/notifications/${notificationId}/mark_read/`);
    } catch (error) {
      console.error('NotificationsService: Failed to mark notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      console.log('NotificationsService: Marking all notifications as read');
      return await apiService.post('/notifications/mark_all_read/');
    } catch (error) {
      console.error('NotificationsService: Failed to mark all notifications as read:', error);
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  // Create a notification
  async createNotification(notificationData) {
    try {
      console.log('NotificationsService: Creating notification:', notificationData);
      return await apiService.post('/notifications/', notificationData);
    } catch (error) {
      console.error('NotificationsService: Failed to create notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      console.log('NotificationsService: Deleting notification:', notificationId);
      return await apiService.delete(`/notifications/${notificationId}/`);
    } catch (error) {
      console.error('NotificationsService: Failed to delete notification:', error);
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }
}

export default new NotificationsService();

