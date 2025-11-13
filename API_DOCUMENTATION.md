# Gyaan Buddy API Documentation

## Overview
This document outlines the complete API specification for the Gyaan Buddy educational platform. The API follows RESTful principles and uses JSON for data exchange.

## Base Configuration
- **Base URL**: `http://localhost:3001/api` (development)
- **Production URL**: `https://api.gyaanbuddy.com/api`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## Environment Variables
```bash
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_USE_MOCK_DATA=true
NODE_ENV=development
```

---

## Authentication Endpoints

### POST /auth/login
**Description**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "principal@school.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "principal@school.com",
    "firstName": "Dr. Rajesh",
    "lastName": "Kumar",
    "role": "principal",
    "avatar": null,
    "school": {
      "id": "1",
      "name": "Delhi Public School",
      "address": "New Delhi, India"
    }
  },
  "message": "Login successful"
}
```

### POST /auth/logout
**Description**: Logout user and invalidate token

**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET /auth/me
**Description**: Get current user profile

**Response**:
```json
{
  "id": "1",
  "email": "principal@school.com",
  "firstName": "Dr. Rajesh",
  "lastName": "Kumar",
  "role": "principal",
  "avatar": null,
  "school": {
    "id": "1",
    "name": "Delhi Public School",
    "address": "New Delhi, India"
  },
  "permissions": ["view_all", "manage_teachers", "manage_students", "view_reports", "manage_system"]
}
```

---

## Students Endpoints

### GET /students
**Description**: Get all students with optional filters

**Query Parameters**:
- `search` (string): Search by name
- `class` (string): Filter by class
- `grade` (string): Filter by grade
- `subject` (string): Filter by subject
- `page` (number): Page number for pagination
- `limit` (number): Items per page

**Response**:
```json
{
  "students": [
    {
      "id": "1",
      "firstName": "Arjun",
      "lastName": "Verma",
      "email": "arjun.verma@student.com",
      "class": "10A",
      "grade": "10",
      "rollNumber": "STU001",
      "dateOfBirth": "2007-05-15",
      "phone": "+91-9876543210",
      "address": "123, Sector 5, Delhi",
      "parentName": "Mr. Raj Verma",
      "parentPhone": "+91-9876543211",
      "averageScore": 85,
      "attendance": 92,
      "assignmentsCompleted": 10,
      "totalAssignments": 12,
      "subjects": ["Mathematics", "Science", "English", "History"],
      "performance": {
        "mathematics": 88,
        "science": 82,
        "english": 85,
        "history": 85
      },
      "lastLogin": "2024-01-15T10:30:00Z",
      "status": "active"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 120,
    "itemsPerPage": 5
  },
  "summary": {
    "totalStudents": 120,
    "averageScore": 78,
    "topPerformer": "Priya Sharma",
    "attendanceRate": 92
  }
}
```

### POST /students
**Description**: Create new student

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@student.com",
  "class": "10A",
  "grade": "10",
  "dateOfBirth": "2007-06-15",
  "phone": "+91-9876543210",
  "address": "123, Sector 5, Delhi",
  "parentName": "Mr. John Doe Sr.",
  "parentPhone": "+91-9876543211"
}
```

### GET /students/{id}
**Description**: Get student by ID

### PUT /students/{id}
**Description**: Update student

### DELETE /students/{id}
**Description**: Delete student

### GET /students/stats
**Description**: Get student statistics

**Response**:
```json
{
  "totalStudents": 120,
  "activeStudents": 115,
  "averageScore": 78,
  "averageAttendance": 92,
  "classDistribution": {
    "9A": 30,
    "9B": 28,
    "9C": 32,
    "10A": 30
  },
  "subjectPerformance": {
    "mathematics": 82,
    "science": 78,
    "english": 85,
    "history": 80,
    "geography": 75
  }
}
```

---

## Teachers Endpoints

### GET /teachers
**Description**: Get all teachers with optional filters

**Query Parameters**:
- `search` (string): Search by name or subject
- `subject` (string): Filter by subject
- `grade` (string): Filter by grade
- `page` (number): Page number
- `limit` (number): Items per page

**Response**:
```json
{
  "teachers": [
    {
      "id": "1",
      "firstName": "Anjali",
      "lastName": "Sharma",
      "email": "anjali.sharma@teacher.com",
      "phone": "+91-9876543220",
      "subject": "Mathematics",
      "qualification": "M.Sc Mathematics, B.Ed",
      "experience": "8 years",
      "classes": ["9A", "10B"],
      "subjects": ["Mathematics", "Statistics"],
      "dashboardUsage": 75,
      "overallMastery": 82,
      "studentsCount": 58,
      "averageClassScore": 85,
      "lastLogin": "2024-01-15T08:30:00Z",
      "status": "active",
      "avatar": null,
      "bio": "Passionate mathematics teacher with expertise in algebra and calculus.",
      "achievements": ["Best Teacher Award 2023", "Student Excellence Award"]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 25,
    "itemsPerPage": 5
  },
  "summary": {
    "totalTeachers": 25,
    "activeTeachers": 24,
    "averageMastery": 81,
    "averageUsage": 76
  }
}
```

### POST /teachers
**Description**: Create new teacher

### GET /teachers/{id}
**Description**: Get teacher by ID

### PUT /teachers/{id}
**Description**: Update teacher

### DELETE /teachers/{id}
**Description**: Delete teacher

---

## Questions Endpoints

### GET /questions
**Description**: Get all questions with optional filters

**Query Parameters**:
- `type` (string): Question type (Single Choice, Multiple Choice, Short Answer, Long Answer)
- `difficulty` (string): Difficulty level (Easy, Medium, Hard)
- `subject` (string): Subject filter
- `grade` (string): Grade filter
- `page` (number): Page number
- `limit` (number): Items per page

**Response**:
```json
{
  "questions": [
    {
      "id": 1,
      "text": "Kya Bharat ki rajdhani Delhi hai?",
      "englishText": "(Is the capital of India Delhi?)",
      "type": "Single Choice",
      "difficulty": "Easy",
      "subject": "Geography",
      "grade": "10",
      "options": [
        { "id": 1, "text": "Haan", "isCorrect": true },
        { "id": 2, "text": "Nahi", "isCorrect": false },
        { "id": 3, "text": "Pata nahi", "isCorrect": false }
      ],
      "explanation": "Delhi is indeed the capital of India.",
      "successRate": 85,
      "usageCount": 150,
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 8,
    "totalItems": 150,
    "itemsPerPage": 5
  },
  "filters": {
    "types": ["Single Choice", "Multiple Choice", "Short Answer", "Long Answer"],
    "difficulties": ["Easy", "Medium", "Hard"],
    "subjects": ["Mathematics", "Science", "English", "History", "Geography"],
    "grades": ["9", "10", "11", "12"]
  }
}
```

### POST /questions/ai/generate
**Description**: Generate AI questions

**Request Body**:
```json
{
  "subject": "Mathematics",
  "grade": "10",
  "difficulty": "Medium",
  "type": "Multiple Choice",
  "count": 5,
  "topics": ["Algebra", "Geometry"]
}
```

### GET /questions/ai/generated
**Description**: Get AI generated questions

### POST /questions/ai/save
**Description**: Save AI generated questions to question bank

---

## Dashboard Endpoints

### GET /dashboard/metrics?role={role}
**Description**: Get dashboard metrics based on user role

**Response**:
```json
{
  "metrics": [
    {
      "title": "Overall Student Proficiency",
      "value": "78%",
      "change": "+5% vs last month",
      "changeType": "positive",
      "trend": "up"
    }
  ],
  "quickSummary": [
    { "label": "Active Teachers", "value": "25" },
    { "label": "Active Students", "value": "500" },
    { "label": "Classes in Session", "value": "32" }
  ]
}
```

### GET /dashboard/progress-trends
**Description**: Get progress trends data for charts

### GET /dashboard/subject-performance
**Description**: Get subject performance data

### GET /dashboard/class-distribution
**Description**: Get class distribution data

### GET /dashboard/alerts
**Description**: Get alerts and announcements

---

## Reports Endpoints

### GET /reports/student-performance
**Description**: Get student performance reports

**Query Parameters**:
- `class` (string): Filter by class
- `subject` (string): Filter by subject
- `dateRange` (string): Date range filter
- `studentId` (string): Specific student ID

### GET /reports/progress-over-time
**Description**: Get progress over time data

### GET /reports/quiz-assignment-summaries
**Description**: Get quiz and assignment summaries

### GET /reports/ai-insights
**Description**: Get AI insights reports

### GET /reports/analytics
**Description**: Get analytics data

---

## AI Service Endpoints

### GET /ai/suggestions
**Description**: Get AI suggestions

**Query Parameters**:
- `category` (string): Suggestion category
- `priority` (string): Priority level
- `class` (string): Class filter
- `subject` (string): Subject filter

**Response**:
```json
{
  "suggestions": [
    {
      "id": 1,
      "category": "content",
      "title": "Create Interactive Quiz for Algebra Basics",
      "description": "Based on student performance data, create an interactive quiz focusing on quadratic equations and factoring techniques.",
      "priority": "high",
      "impact": "High engagement expected",
      "timeEstimate": "30 minutes",
      "studentsAffected": 25,
      "confidence": 0.92,
      "createdAt": "2024-01-15T10:00:00Z",
      "status": "pending"
    }
  ],
  "categories": [
    { "id": "content", "name": "Content Creation", "count": 2 },
    { "id": "assessment", "name": "Assessment", "count": 2 },
    { "id": "engagement", "name": "Student Engagement", "count": 2 }
  ],
  "priorities": [
    { "id": "high", "name": "High Priority", "count": 2 },
    { "id": "medium", "name": "Medium Priority", "count": 3 },
    { "id": "low", "name": "Low Priority", "count": 1 }
  ]
}
```

### GET /ai/insights
**Description**: Get AI insights

### POST /ai/generate
**Description**: Generate AI content

### GET /ai/recommendations/{type}
**Description**: Get AI recommendations by type

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "details": "Specific error details"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Rate Limit**: 1000 requests per hour per user
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Headers**:
- `X-Total-Count`: Total number of items
- `X-Page-Count`: Total number of pages
- `X-Current-Page`: Current page number
- `X-Per-Page`: Items per page

---

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'principal' | 'teacher' | 'student';
  avatar?: string;
  school: School;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

interface School {
  id: string;
  name: string;
  address: string;
}
```

### Student Model
```typescript
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  class: string;
  grade: string;
  rollNumber: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  parentName: string;
  parentPhone: string;
  averageScore: number;
  attendance: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  subjects: string[];
  performance: Record<string, number>;
  lastLogin: string;
  status: 'active' | 'inactive';
}
```

### Teacher Model
```typescript
interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experience: string;
  classes: string[];
  subjects: string[];
  dashboardUsage: number;
  overallMastery: number;
  studentsCount: number;
  averageClassScore: number;
  lastLogin: string;
  status: 'active' | 'inactive';
  avatar?: string;
  bio: string;
  achievements: string[];
}
```

### Question Model
```typescript
interface Question {
  id: number;
  text: string;
  englishText: string;
  type: 'Single Choice' | 'Multiple Choice' | 'Short Answer' | 'Long Answer';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
  grade: string;
  options?: QuestionOption[];
  expectedAnswer?: string;
  explanation: string;
  successRate: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface QuestionOption {
  id: number;
  text: string;
  isCorrect: boolean;
}
```

---

## Implementation Notes

1. **Mock Data**: Currently using mock data for development. Set `REACT_APP_USE_MOCK_DATA=true` to enable.
2. **Authentication**: JWT tokens are stored in localStorage and sent in Authorization header.
3. **Error Handling**: All API calls include proper error handling with user-friendly messages.
4. **Loading States**: Components show loading indicators during API calls.
5. **Caching**: Consider implementing caching for frequently accessed data.
6. **Real-time Updates**: Consider WebSocket implementation for real-time notifications.

---

## Testing

### Test Environment
- **Base URL**: `http://localhost:3001/api`
- **Mock Data**: Available for all endpoints
- **Test Users**: 
  - Principal: `principal@school.com` / `password123`
  - Teacher: `teacher@school.com` / `password123`

### Sample Test Requests

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"principal@school.com","password":"password123"}'

# Get Students
curl -X GET http://localhost:3001/api/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get Dashboard Metrics
curl -X GET http://localhost:3001/api/dashboard/metrics?role=principal \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
