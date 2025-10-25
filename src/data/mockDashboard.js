// Mock dashboard data
export default {
  '/dashboard/metrics': {
    metrics: [
      {
        title: 'Overall Student Proficiency',
        value: '78%',
        change: '+5% vs last month',
        changeType: 'positive',
        trend: 'up'
      },
      {
        title: 'Average Class Mastery',
        value: '85%',
        change: '+3% vs last month',
        changeType: 'positive',
        trend: 'up'
      },
      {
        title: 'Teacher Effectiveness',
        value: '92%',
        change: '+2% vs last month',
        changeType: 'positive',
        trend: 'up'
      }
    ],
    quickSummary: [
      { label: 'Active Teachers', value: '25' },
      { label: 'Active Students', value: '500' },
      { label: 'Classes in Session', value: '32' }
    ]
  },
  
  '/dashboard/progress-trends': {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Overall',
        data: [65, 68, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Class 10',
        data: [70, 73, 76, 79, 82, 85, 87, 90, 92, 94, 96, 98],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Class 12',
        data: [60, 63, 67, 70, 73, 76, 78, 81, 84, 87, 89, 92],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ]
  },
  
  '/dashboard/subject-performance': {
    labels: ['Mathematics', 'Science', 'English', 'History', 'Geography'],
    datasets: [
      {
        label: 'Average Score',
        data: [85, 78, 92, 88, 75],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
      },
    ]
  },
  
  '/dashboard/class-distribution': {
    labels: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    datasets: [
      {
        data: [120, 150, 140, 130],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
      },
    ]
  },
  
  '/dashboard/alerts': {
    alerts: [
      {
        id: 1,
        type: 'alert',
        priority: 'high',
        message: 'Low score alert in Class 10-B Mathematics.',
        detail: 'Teacher: Mr. Ramesh Kumar',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        createdAt: '2024-01-15T09:30:00Z'
      },
      {
        id: 2,
        type: 'announcement',
        priority: 'medium',
        message: 'Upcoming Test: Mathematics for Class 12 on July 25th.',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        createdAt: '2024-01-15T08:00:00Z'
      },
      {
        id: 3,
        type: 'achievement',
        priority: 'low',
        message: 'Class 10-B passed with good results.',
        detail: 'Congratulations to all students and teachers.',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        createdAt: '2024-01-14T16:45:00Z'
      }
    ]
  },
  
  '/dashboard/recent-activities': {
    activities: [
      {
        id: 1,
        type: 'test_completed',
        message: 'Mathematics test completed by Class 10A',
        timestamp: '2024-01-15T10:30:00Z',
        details: 'Average score: 85%'
      },
      {
        id: 2,
        type: 'assignment_submitted',
        message: 'Science assignment submitted by Priya Sharma',
        timestamp: '2024-01-15T09:45:00Z',
        details: 'Score: 92/100'
      },
      {
        id: 3,
        type: 'teacher_login',
        message: 'Anjali Sharma logged in',
        timestamp: '2024-01-15T08:30:00Z',
        details: 'Mathematics teacher'
      }
    ]
  }
};
