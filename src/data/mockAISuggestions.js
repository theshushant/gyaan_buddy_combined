// Mock AI suggestions data
export default {
  '/ai/suggestions': {
    suggestions: [
      {
        id: 1,
        category: 'content',
        title: 'Create Interactive Quiz for Algebra Basics',
        description: 'Based on student performance data, create an interactive quiz focusing on quadratic equations and factoring techniques.',
        priority: 'high',
        impact: 'High engagement expected',
        timeEstimate: '30 minutes',
        studentsAffected: 25,
        confidence: 0.92,
        createdAt: '2024-01-15T10:00:00Z',
        status: 'pending'
      },
      {
        id: 2,
        category: 'assessment',
        title: 'Adaptive Test for Weak Areas',
        description: 'Generate personalized assessments targeting individual student weaknesses in trigonometry and geometry.',
        priority: 'medium',
        impact: 'Improved learning outcomes',
        timeEstimate: '45 minutes',
        studentsAffected: 15,
        confidence: 0.85,
        createdAt: '2024-01-15T09:30:00Z',
        status: 'pending'
      },
      {
        id: 3,
        category: 'engagement',
        title: 'Gamified Learning Module',
        description: 'Transform the current physics module into a game-based learning experience with points, badges, and leaderboards.',
        priority: 'high',
        impact: 'Increased student motivation',
        timeEstimate: '2 hours',
        studentsAffected: 40,
        confidence: 0.88,
        createdAt: '2024-01-15T09:00:00Z',
        status: 'pending'
      },
      {
        id: 4,
        category: 'content',
        title: 'Multimedia Resources for Chemistry',
        description: 'Add video explanations and 3D models to help students visualize molecular structures and chemical reactions.',
        priority: 'medium',
        impact: 'Better concept understanding',
        timeEstimate: '1 hour',
        studentsAffected: 30,
        confidence: 0.80,
        createdAt: '2024-01-14T16:00:00Z',
        status: 'pending'
      },
      {
        id: 5,
        category: 'assessment',
        title: 'Peer Review Assignment',
        description: 'Implement peer review system for essay assignments to improve writing skills and critical thinking.',
        priority: 'low',
        impact: 'Enhanced collaboration',
        timeEstimate: '20 minutes',
        studentsAffected: 20,
        confidence: 0.75,
        createdAt: '2024-01-14T15:30:00Z',
        status: 'pending'
      },
      {
        id: 6,
        category: 'engagement',
        title: 'Virtual Lab Simulation',
        description: 'Create virtual laboratory simulations for physics experiments to enhance hands-on learning experience.',
        priority: 'medium',
        impact: 'Improved practical understanding',
        timeEstimate: '1.5 hours',
        studentsAffected: 35,
        confidence: 0.82,
        createdAt: '2024-01-14T14:00:00Z',
        status: 'pending'
      }
    ],
    categories: [
      { id: 'content', name: 'Content Creation', count: 2 },
      { id: 'assessment', name: 'Assessment', count: 2 },
      { id: 'engagement', name: 'Student Engagement', count: 2 }
    ],
    priorities: [
      { id: 'high', name: 'High Priority', count: 2 },
      { id: 'medium', name: 'Medium Priority', count: 3 },
      { id: 'low', name: 'Low Priority', count: 1 }
    ]
  }
};
