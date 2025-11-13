// Mock AI insights data
export default {
  '/ai/insights': {
    subjectMastery: [
      {
        subject: 'Algebra',
        masteryLevel: 85,
        strugglingPercentage: 15,
        color: 'bg-green-500'
      },
      {
        subject: 'Trigonometry',
        masteryLevel: 60,
        strugglingPercentage: 40,
        color: 'bg-yellow-500'
      },
      {
        subject: 'Calculus',
        masteryLevel: 45,
        strugglingPercentage: 55,
        color: 'bg-red-500'
      },
      {
        subject: 'Geometry',
        masteryLevel: 75,
        strugglingPercentage: 25,
        color: 'bg-blue-500'
      },
      {
        subject: 'Statistics',
        masteryLevel: 80,
        strugglingPercentage: 20,
        color: 'bg-purple-500'
      }
    ],
    
    remedialActivities: [
      {
        title: 'Algebraic Equations Practice',
        icon: 'Calculator',
        description: 'Focuses on solving linear and quadratic equations with real-world applications.',
        color: 'bg-blue-500',
        link: 'View Activity →',
        difficulty: 'Easy',
        estimatedTime: '30 minutes',
        studentsRecommended: 15
      },
      {
        title: 'Trigonometry Basics Review',
        icon: 'Globe',
        description: 'Covers sine, cosine, and tangent functions with interactive practice problems.',
        color: 'bg-green-500',
        link: 'View Activity →',
        difficulty: 'Medium',
        estimatedTime: '45 minutes',
        studentsRecommended: 20
      },
      {
        title: 'Calculus Fundamentals Guide',
        icon: 'TrendingUp',
        description: 'Introduces limits, derivatives, and integrals with clear examples and visualizations.',
        color: 'bg-purple-500',
        link: 'View Activity →',
        difficulty: 'Hard',
        estimatedTime: '60 minutes',
        studentsRecommended: 10
      },
      {
        title: 'Geometry Theorems Exploration',
        icon: 'Target',
        description: 'Explores key theorems and their proofs with interactive exercises.',
        color: 'bg-yellow-500',
        link: 'View Activity →',
        difficulty: 'Medium',
        estimatedTime: '40 minutes',
        studentsRecommended: 18
      },
      {
        title: 'Statistics & Probability Exercises',
        icon: 'BookOpen',
        description: 'Includes data analysis and probability calculations with engaging simulations.',
        color: 'bg-red-500',
        link: 'View Activity →',
        difficulty: 'Easy',
        estimatedTime: '35 minutes',
        studentsRecommended: 22
      }
    ],
    
    heatmapData: [
      { name: 'Rohan Sharma', algebra: 1, trigonometry: 2, calculus: 3, geometry: 4, statistics: 5 },
      { name: 'Priya Singh', algebra: 1, trigonometry: 1, calculus: 3, geometry: 2, statistics: 4 },
      { name: 'Arjun Kumar', algebra: 1, trigonometry: 2, calculus: 1, geometry: 2, statistics: 5 },
      { name: 'Anjali Gupta', algebra: 4, trigonometry: 1, calculus: 2, geometry: 1, statistics: 4 },
      { name: 'Vikram Mehra', algebra: 3, trigonometry: 1, calculus: 1, geometry: 1, statistics: 3 },
      { name: 'Neha Reddy', algebra: 5, trigonometry: 4, calculus: 1, geometry: 4, statistics: 3 }
    ],
    
    learningPatterns: [
      {
        pattern: 'Visual Learners',
        percentage: 35,
        recommendation: 'Use more diagrams, charts, and visual aids in teaching materials.',
        color: 'bg-blue-100 text-blue-800'
      },
      {
        pattern: 'Kinesthetic Learners',
        percentage: 25,
        recommendation: 'Incorporate hands-on activities and interactive exercises.',
        color: 'bg-green-100 text-green-800'
      },
      {
        pattern: 'Auditory Learners',
        percentage: 20,
        recommendation: 'Include audio explanations and group discussions.',
        color: 'bg-yellow-100 text-yellow-800'
      },
      {
        pattern: 'Reading/Writing Learners',
        percentage: 20,
        recommendation: 'Provide comprehensive written materials and note-taking opportunities.',
        color: 'bg-purple-100 text-purple-800'
      }
    ],
    
    performanceInsights: [
      {
        insight: 'Students perform 25% better on interactive quizzes compared to traditional tests.',
        confidence: 0.92,
        impact: 'High',
        action: 'Implement more interactive assessment methods.'
      },
      {
        insight: 'Morning classes show 15% higher engagement than afternoon sessions.',
        confidence: 0.85,
        impact: 'Medium',
        action: 'Consider scheduling challenging subjects in the morning.'
      },
      {
        insight: 'Group activities improve concept retention by 30%.',
        confidence: 0.88,
        impact: 'High',
        action: 'Increase collaborative learning opportunities.'
      }
    ],
    
    predictiveAnalytics: [
      {
        metric: 'At-Risk Students',
        count: 8,
        trend: 'decreasing',
        change: '-2 from last month',
        recommendation: 'Continue current intervention strategies.'
      },
      {
        metric: 'High Performers',
        count: 45,
        trend: 'increasing',
        change: '+5 from last month',
        recommendation: 'Provide advanced challenges and enrichment activities.'
      },
      {
        metric: 'Average Performers',
        count: 120,
        trend: 'stable',
        change: 'No change',
        recommendation: 'Maintain current teaching methods with minor adjustments.'
      }
    ]
  }
};
