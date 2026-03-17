import apiService from './api'

class ParentService {
  async getMyProgress() {
    const response = await apiService.get('/analytics/student/my-progress/')
    return response.data || response
  }

  async getWeakAreas() {
    const response = await apiService.get('/analytics/student/weak-areas/')
    return response.data || response
  }

  async getLeaderboard() {
    const response = await apiService.get('/analytics/student/leaderboard/')
    return response.data || response
  }

  async getMyTests() {
    const response = await apiService.get('/tests/my-tests/')
    return response.data || response
  }

  async getAnswerTrends(days = 7) {
    const response = await apiService.get(`/analytics/answer-trends/?days=${days}`)
    return response.data || response
  }

  async getMyTestReport(testId) {
    const response = await apiService.get(`/tests/${testId}/my-report/`)
    return response.data || response
  }
}

export default new ParentService()
