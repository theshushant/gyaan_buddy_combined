// Leaderboard API service
import apiService from './api';

class LeaderboardService {
  // Get leaderboard with optional filters
  async getLeaderboard(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add user_type=student to filter for students only
      queryParams.append('user_type', 'student');
      
      // Add filters
      if (filters.class_id) queryParams.append('class_id', filters.class_id);
      if (filters.subject_id) queryParams.append('subject_id', filters.subject_id);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.min_xp !== undefined) queryParams.append('min_xp', filters.min_xp);
      if (filters.max_xp !== undefined) queryParams.append('max_xp', filters.max_xp);
      if (filters.min_score !== undefined) queryParams.append('min_score', filters.min_score);
      if (filters.max_score !== undefined) queryParams.append('max_score', filters.max_score);
      if (filters.sort_by) queryParams.append('sort_by', filters.sort_by); // 'xp' or 'score'
      if (filters.school_id) queryParams.append('school_id', filters.school_id);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/users/leaderboard/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }
  }
}

export default new LeaderboardService();

