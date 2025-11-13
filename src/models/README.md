# Frontend Models

This directory contains JavaScript model classes that mirror the backend Django models for the Gyaan Buddy application. These models provide a consistent data structure and validation layer for the frontend.

## Structure

```
src/models/
├── index.js                     # Main export file
├── base/                        # Base model classes
│   ├── TimeStampUUID.js         # Base class with UUID and timestamps
│   └── SoftDeleteModel.js       # Base class with soft delete functionality
├── users/                       # User-related models
│   ├── School.js               # School management
│   ├── Level.js                # User level system
│   ├── User.js                 # User accounts
│   └── Class.js                # Class management
├── subjects/                    # Subject and content models
│   ├── Subject.js              # Subject management
│   ├── Module.js               # Module within subjects
│   ├── ModuleChapter.js        # Chapters within modules
│   ├── Question.js             # Questions
│   ├── Theory.js               # Theoretical content
│   ├── Option.js               # Question options
│   └── ModuleContent.js        # Content within chapters
├── progress/                    # Progress tracking models
│   ├── UserModuleProgress.js   # User progress on modules
│   └── UserChapterProgress.js  # User progress on chapters
├── missions/                    # Mission-related models
│   ├── Mission.js              # Daily missions
│   ├── MissionQuestion.js      # Mission-question relationship
│   └── UserMissionProgress.js  # User mission progress
└── competitions/                # Competition models
    ├── Competition.js           # Competitions
    ├── CompetitionQuestion.js   # Competition-question relationship
    └── UserCompetitionProgress.js # User competition progress
```

## Base Classes

### TimeStampUUID
- Provides string ID as primary key
- Automatic `created_at` and `updated_at` timestamps
- Methods: `touch()`, `toJSON()`, `toString()`

### SoftDeleteModel
- Extends TimeStampUUID
- Adds soft delete functionality with `is_deleted` and `deleted_at` fields
- Methods: `softDelete()`, `restore()`, `isSoftDeleted()`, `isActive()`

## Usage

```javascript
import { User, School, Question } from './models';

// Create a new user
const user = new User({
  id: 'user-123',
  username: 'john_doe',
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  user_type: 'student',
  school: 'school-123'
});

// Validate the user
const validation = user.validate();
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}

// Convert to JSON for API calls
const userData = user.toJSON();

// Create a question with options
const question = new Question({
  id: 'question-123',
  question_text: 'What is 2 + 2?',
  question_type: 'mcq_single',
  difficulty_level: 'easy',
  exp_points: 10
});

question.addOption({
  id: 'option-1',
  option_text: '3',
  is_correct: false,
  order: 1
});

question.addOption({
  id: 'option-2',
  option_text: '4',
  is_correct: true,
  order: 2
});
```

## Features

- **Validation**: Each model includes validation methods that return detailed error information
- **Relationships**: Models handle both ID references and object references
- **Type Safety**: Consistent data types and validation across all models
- **Soft Delete**: Support for soft deletion where appropriate
- **Timestamps**: Automatic timestamp management
- **JSON Serialization**: Easy conversion to/from JSON for API communication

## Model Relationships

- **User** belongs to **School** and **Class**
- **User** has many **UserModuleProgress** and **UserChapterProgress**
- **Subject** has many **Modules**
- **Module** has many **ModuleChapters**
- **ModuleChapter** has many **ModuleContents** (Questions/Theories)
- **Question** has many **Options**
- **Mission** belongs to **Class** and has many **Questions**
- **Competition** belongs to **Subject** and optionally **ModuleChapter**

## Dependencies

- No external dependencies required

## Notes

- All models mirror the backend Django models exactly
- Validation rules match backend constraints
- Field names use snake_case to match backend API
- Models use string IDs instead of UUIDs for simplicity
- Models are designed to work seamlessly with Redux state management
- Each model includes comprehensive documentation and examples
