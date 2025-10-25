// Mock teachers data
export default {
  '/teachers': {
    teachers: [
      {
        id: '1',
        firstName: 'Anjali',
        lastName: 'Sharma',
        email: 'anjali.sharma@teacher.com',
        phone: '+91-9876543220',
        subject: 'Mathematics',
        qualification: 'M.Sc Mathematics, B.Ed',
        experience: '8 years',
        classes: ['9A', '10B'],
        subjects: ['Mathematics', 'Statistics'],
        dashboardUsage: 75,
        overallMastery: 82,
        studentsCount: 58,
        averageClassScore: 85,
        lastLogin: '2024-01-15T08:30:00Z',
        status: 'active',
        avatar: null,
        bio: 'Passionate mathematics teacher with expertise in algebra and calculus.',
        achievements: ['Best Teacher Award 2023', 'Student Excellence Award']
      },
      {
        id: '2',
        firstName: 'Priya',
        lastName: 'Verma',
        email: 'priya.verma@teacher.com',
        phone: '+91-9876543221',
        subject: 'Science',
        qualification: 'M.Sc Physics, B.Ed',
        experience: '6 years',
        classes: ['11C', '12A'],
        subjects: ['Physics', 'Chemistry'],
        dashboardUsage: 90,
        overallMastery: 78,
        studentsCount: 45,
        averageClassScore: 82,
        lastLogin: '2024-01-15T09:15:00Z',
        status: 'active',
        avatar: null,
        bio: 'Science educator focused on practical learning and experimentation.',
        achievements: ['Innovation in Teaching Award']
      },
      {
        id: '3',
        firstName: 'Kiran',
        lastName: 'Patel',
        email: 'kiran.patel@teacher.com',
        phone: '+91-9876543222',
        subject: 'English',
        qualification: 'M.A English Literature, B.Ed',
        experience: '10 years',
        classes: ['10A', '11B'],
        subjects: ['English Literature', 'Grammar'],
        dashboardUsage: 60,
        overallMastery: 85,
        studentsCount: 52,
        averageClassScore: 88,
        lastLogin: '2024-01-14T16:20:00Z',
        status: 'active',
        avatar: null,
        bio: 'Literature enthusiast with a passion for creative writing and communication.',
        achievements: ['Literary Excellence Award', 'Communication Skills Award']
      },
      {
        id: '4',
        firstName: 'Deepika',
        lastName: 'Singh',
        email: 'deepika.singh@teacher.com',
        phone: '+91-9876543223',
        subject: 'History',
        qualification: 'M.A History, B.Ed',
        experience: '7 years',
        classes: ['9B', '12C'],
        subjects: ['Indian History', 'World History'],
        dashboardUsage: 85,
        overallMastery: 70,
        studentsCount: 48,
        averageClassScore: 78,
        lastLogin: '2024-01-15T10:45:00Z',
        status: 'active',
        avatar: null,
        bio: 'History teacher dedicated to making the past come alive for students.',
        achievements: ['Historical Research Award']
      },
      {
        id: '5',
        firstName: 'Meera',
        lastName: 'Kapoor',
        email: 'meera.kapoor@teacher.com',
        phone: '+91-9876543224',
        subject: 'Geography',
        qualification: 'M.Sc Geography, B.Ed',
        experience: '5 years',
        classes: ['11A', '10C'],
        subjects: ['Physical Geography', 'Human Geography'],
        dashboardUsage: 70,
        overallMastery: 92,
        studentsCount: 40,
        averageClassScore: 90,
        lastLogin: '2024-01-15T07:30:00Z',
        status: 'active',
        avatar: null,
        bio: 'Geography teacher with expertise in environmental studies and mapping.',
        achievements: ['Environmental Education Award']
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 2,
      totalItems: 25,
      itemsPerPage: 5
    },
    summary: {
      totalTeachers: 25,
      activeTeachers: 24,
      averageMastery: 81,
      averageUsage: 76
    }
  },
  
  '/teachers/stats': {
    totalTeachers: 25,
    activeTeachers: 24,
    averageMastery: 81,
    averageDashboardUsage: 76,
    subjectDistribution: {
      mathematics: 5,
      science: 6,
      english: 4,
      history: 3,
      geography: 3,
      others: 4
    },
    experienceDistribution: {
      '0-2 years': 3,
      '3-5 years': 8,
      '6-10 years': 10,
      '10+ years': 4
    }
  }
};
