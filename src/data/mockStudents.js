// Mock students data
export default {
  '/students': {
    students: [
      {
        id: '1',
        firstName: 'Arjun',
        lastName: 'Verma',
        email: 'arjun.verma@student.com',
        class: '10A',
        grade: '10',
        rollNumber: 'STU001',
        dateOfBirth: '2007-05-15',
        phone: '+91-9876543210',
        address: '123, Sector 5, Delhi',
        parentName: 'Mr. Raj Verma',
        parentPhone: '+91-9876543211',
        averageScore: 85,
        attendance: 92,
        assignmentsCompleted: 10,
        totalAssignments: 12,
        subjects: ['Mathematics', 'Science', 'English', 'History'],
        performance: {
          mathematics: 88,
          science: 82,
          english: 85,
          history: 85
        },
        lastLogin: '2024-01-15T10:30:00Z',
        status: 'active'
      },
      {
        id: '2',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@student.com',
        class: '9B',
        grade: '9',
        rollNumber: 'STU002',
        dateOfBirth: '2008-03-22',
        phone: '+91-9876543212',
        address: '456, Sector 8, Delhi',
        parentName: 'Mrs. Sunita Sharma',
        parentPhone: '+91-9876543213',
        averageScore: 92,
        attendance: 98,
        assignmentsCompleted: 12,
        totalAssignments: 12,
        subjects: ['Mathematics', 'Science', 'English', 'Geography'],
        performance: {
          mathematics: 95,
          science: 90,
          english: 92,
          geography: 91
        },
        lastLogin: '2024-01-15T09:15:00Z',
        status: 'active'
      },
      {
        id: '3',
        firstName: 'Rohan',
        lastName: 'Kapoor',
        email: 'rohan.kapoor@student.com',
        class: '10A',
        grade: '10',
        rollNumber: 'STU003',
        dateOfBirth: '2007-08-10',
        phone: '+91-9876543214',
        address: '789, Sector 12, Delhi',
        parentName: 'Mr. Amit Kapoor',
        parentPhone: '+91-9876543215',
        averageScore: 76,
        attendance: 88,
        assignmentsCompleted: 9,
        totalAssignments: 12,
        subjects: ['Mathematics', 'Science', 'English', 'History'],
        performance: {
          mathematics: 70,
          science: 78,
          english: 80,
          history: 76
        },
        lastLogin: '2024-01-14T16:45:00Z',
        status: 'active'
      },
      {
        id: '4',
        firstName: 'Anika',
        lastName: 'Patel',
        email: 'anika.patel@student.com',
        class: '9C',
        grade: '9',
        rollNumber: 'STU004',
        dateOfBirth: '2008-11-05',
        phone: '+91-9876543216',
        address: '321, Sector 15, Delhi',
        parentName: 'Mrs. Kavita Patel',
        parentPhone: '+91-9876543217',
        averageScore: 88,
        attendance: 95,
        assignmentsCompleted: 11,
        totalAssignments: 12,
        subjects: ['Mathematics', 'Science', 'English', 'Geography'],
        performance: {
          mathematics: 90,
          science: 85,
          english: 88,
          geography: 89
        },
        lastLogin: '2024-01-15T11:20:00Z',
        status: 'active'
      },
      {
        id: '5',
        firstName: 'Vikram',
        lastName: 'Singh',
        email: 'vikram.singh@student.com',
        class: '10B',
        grade: '10',
        rollNumber: 'STU005',
        dateOfBirth: '2007-12-18',
        phone: '+91-9876543218',
        address: '654, Sector 20, Delhi',
        parentName: 'Mr. Harpreet Singh',
        parentPhone: '+91-9876543219',
        averageScore: 65,
        attendance: 85,
        assignmentsCompleted: 8,
        totalAssignments: 12,
        subjects: ['Mathematics', 'Science', 'English', 'History'],
        performance: {
          mathematics: 60,
          science: 65,
          english: 70,
          history: 65
        },
        lastLogin: '2024-01-13T14:30:00Z',
        status: 'active'
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 3,
      totalItems: 120,
      itemsPerPage: 5
    },
    summary: {
      totalStudents: 120,
      averageScore: 78,
      topPerformer: 'Priya Sharma',
      attendanceRate: 92
    }
  },
  
  '/students/stats': {
    totalStudents: 120,
    activeStudents: 115,
    averageScore: 78,
    averageAttendance: 92,
    classDistribution: {
      '9A': 30,
      '9B': 28,
      '9C': 32,
      '10A': 30
    },
    subjectPerformance: {
      mathematics: 82,
      science: 78,
      english: 85,
      history: 80,
      geography: 75
    }
  }
};
