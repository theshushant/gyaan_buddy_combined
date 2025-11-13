import SoftDeleteModel from '../base/SoftDeleteModel.js';

/**
 * Model for managing competitions in the educational system.
 */
export default class Competition extends SoftDeleteModel {
  constructor(data = {}) {
    super(data);
    this.title = data.title || '';
    this.description = data.description || '';
    this.code = data.code || '';
    this.competition_type = data.competition_type || 'subject';
    this.subject = data.subject || null; // Subject ID or Subject object
    this.chapter = data.chapter || null; // ModuleChapter ID or ModuleChapter object
    this.total_time = data.total_time || 60; // in minutes
    this.status = data.status || 'not_started';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_by = data.created_by || null; // User ID or User object
    this.questions = data.questions || []; // Array of Question IDs or Question objects
    this.participants = data.participants || []; // Array of User IDs or User objects
  }

  /**
   * Competition type choices
   */
  static COMPETITION_TYPE_CHOICES = [
    ['subject', 'Subject Only'],
    ['subject_with_chapter', 'Subject with Chapter'],
    ['random', 'Random Questions']
  ];

  /**
   * Status choices
   */
  static STATUS_CHOICES = [
    ['not_started', 'Not Started'],
    ['in_progress', 'In Progress'],
    ['completed', 'Completed']
  ];

  /**
   * Validate competition data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.title || this.title.trim().length === 0) {
      errors.title = 'Competition title is required';
    } else if (this.title.length > 200) {
      errors.title = 'Competition title must be 200 characters or less';
    }

    if (!this.code || this.code.trim().length === 0) {
      errors.code = 'Competition code is required';
    } else if (this.code.length > 10) {
      errors.code = 'Competition code must be 10 characters or less';
    }

    if (!this.competition_type) {
      errors.competition_type = 'Competition type is required';
    } else if (!Competition.COMPETITION_TYPE_CHOICES.some(([value]) => value === this.competition_type)) {
      errors.competition_type = 'Invalid competition type';
    }

    if (!this.subject) {
      errors.subject = 'Subject is required';
    }

    if (this.competition_type === 'subject_with_chapter' && !this.chapter) {
      errors.chapter = 'Chapter is required for subject with chapter competition';
    }

    if (this.total_time < 1) {
      errors.total_time = 'Total time must be at least 1 minute';
    }

    if (!this.status) {
      errors.status = 'Status is required';
    } else if (!Competition.STATUS_CHOICES.some(([value]) => value === this.status)) {
      errors.status = 'Invalid status';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Generate unique code if not provided
   */
  generateCode() {
    if (!this.code) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.code = code;
    }
  }

  /**
   * Start the competition
   */
  start() {
    this.status = 'in_progress';
    this.touch();
  }

  /**
   * Complete the competition
   */
  complete() {
    this.status = 'completed';
    this.touch();
  }

  /**
   * Activate the competition
   */
  activate() {
    this.is_active = true;
    this.touch();
  }

  /**
   * Deactivate the competition
   */
  deactivate() {
    this.is_active = false;
    this.touch();
  }

  /**
   * Add a question to this competition
   * @param {string|Object} question - Question ID or Question object
   */
  addQuestion(question) {
    const questionId = typeof question === 'object' ? question.id : question;
    if (!this.questions.includes(questionId)) {
      this.questions.push(questionId);
      this.touch();
    }
  }

  /**
   * Remove a question from this competition
   * @param {string|Object} question - Question ID or Question object
   */
  removeQuestion(question) {
    const questionId = typeof question === 'object' ? question.id : question;
    this.questions = this.questions.filter(id => id !== questionId);
    this.touch();
  }

  /**
   * Add a participant to this competition
   * @param {string|Object} user - User ID or User object
   */
  addParticipant(user) {
    const userId = typeof user === 'object' ? user.id : user;
    if (!this.participants.includes(userId)) {
      this.participants.push(userId);
      this.touch();
    }
  }

  /**
   * Remove a participant from this competition
   * @param {string|Object} user - User ID or User object
   */
  removeParticipant(user) {
    const userId = typeof user === 'object' ? user.id : user;
    this.participants = this.participants.filter(id => id !== userId);
    this.touch();
  }

  /**
   * Check if competition has a specific question
   * @param {string|Object} question - Question ID or Question object
   * @returns {boolean} True if competition has the question
   */
  hasQuestion(question) {
    const questionId = typeof question === 'object' ? question.id : question;
    return this.questions.includes(questionId);
  }

  /**
   * Check if user is a participant
   * @param {string|Object} user - User ID or User object
   * @returns {boolean} True if user is a participant
   */
  hasParticipant(user) {
    const userId = typeof user === 'object' ? user.id : user;
    return this.participants.includes(userId);
  }

  /**
   * Get question count
   * @returns {number} Number of questions
   */
  get question_count() {
    return this.questions.length;
  }

  /**
   * Get participant count
   * @returns {number} Number of participants
   */
  get participant_count() {
    return this.participants.length;
  }

  /**
   * Get subject ID
   * @returns {string|null} Subject ID
   */
  getSubjectId() {
    return typeof this.subject === 'object' ? this.subject.id : this.subject;
  }

  /**
   * Get chapter ID
   * @returns {string|null} Chapter ID
   */
  getChapterId() {
    return typeof this.chapter === 'object' ? this.chapter.id : this.chapter;
  }

  /**
   * Get created by user ID
   * @returns {string|null} User ID
   */
  getCreatedById() {
    return typeof this.created_by === 'object' ? this.created_by.id : this.created_by;
  }

  /**
   * Get question IDs
   * @returns {Array<string>} Array of question IDs
   */
  getQuestionIds() {
    return this.questions.map(question => 
      typeof question === 'object' ? question.id : question
    );
  }

  /**
   * Get participant IDs
   * @returns {Array<string>} Array of participant IDs
   */
  getParticipantIds() {
    return this.participants.map(user => 
      typeof user === 'object' ? user.id : user
    );
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      ...super.toJSON(),
      title: this.title,
      description: this.description,
      code: this.code,
      competition_type: this.competition_type,
      subject: this.getSubjectId(),
      chapter: this.getChapterId(),
      total_time: this.total_time,
      status: this.status,
      is_active: this.is_active,
      created_by: this.getCreatedById(),
      questions: this.getQuestionIds(),
      participants: this.getParticipantIds()
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    return `${this.title} (${this.code})`;
  }
}
