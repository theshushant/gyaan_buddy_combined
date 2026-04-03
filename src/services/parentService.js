import apiService from './api'

class ParentService {
  async getMyProgress() {
    const response = await apiService.get('/analytics/student/my-progress/', { disableMockFallback: true })
    return response.data || response
  }

  async getWeakAreas() {
    const response = await apiService.get('/analytics/student/weak-areas/', { disableMockFallback: true })
    return response.data || response
  }

  async getLeaderboard() {
    const response = await apiService.get('/analytics/student/leaderboard/', { disableMockFallback: true })
    return response.data || response
  }

  async getMyTests() {
    const response = await apiService.get('/tests/my-tests/', { disableMockFallback: true })
    return response.data || response
  }

  async getAnswerTrends(days = 7) {
    const response = await apiService.get(`/analytics/answer-trends/?days=${days}`, { disableMockFallback: true })
    return response.data || response
  }

  async getMyTestReport(testId) {
    const response = await apiService.get(`/tests/${testId}/my-report/`, { disableMockFallback: true })
    return response.data || response
  }

  async getSubjectPerformance(subjectId) {
    const response = await apiService.get(`/analytics/student/subject/${subjectId}/`, { disableMockFallback: true })
    return response.data || response
  }
}

export default new ParentService()
