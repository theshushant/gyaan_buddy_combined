import TimeStampUUID from '../base/TimeStampUUID.js';

/**
 * Model for tracking individual user progress on chapters.
 */
export default class UserChapterProgress extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.user = data.user || null; // User ID or User object
    this.chapter = data.chapter || null; // ModuleChapter ID or ModuleChapter object
    this.status = data.status || 'not_started';
    this.percentage = data.percentage || 0;
    this.started_at = data.started_at || null;
    this.completed_at = data.completed_at || null;
    this.last_accessed = data.last_accessed || new Date();
    this.current_question = data.current_question || null; // Question ID or Question object
  }

  /**
   * Status choices
   */
  static STATUS_CHOICES = [
    ['not_started', 'Not Started'],
    ['in_progress', 'In Progress'],
    ['due', 'Due'],
    ['completed', 'Completed']
  ];

  /**
   * Validate progress data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.user) {
      errors.user = 'User is required';
    }

    if (!this.chapter) {
      errors.chapter = 'Chapter is required';
    }

    if (!this.status) {
      errors.status = 'Status is required';
    } else if (!UserChapterProgress.STATUS_CHOICES.some(([value]) => value === this.status)) {
      errors.status = 'Invalid status';
    }

    if (this.percentage < 0 || this.percentage > 100) {
      errors.percentage = 'Percentage must be between 0 and 100';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Start the chapter
   */
  start() {
    this.status = 'in_progress';
    this.started_at = new Date();
    this.last_accessed = new Date();
    this.touch();
  }

  /**
   * Complete the chapter
   */
  complete() {
    this.status = 'completed';
    this.percentage = 100;
    this.completed_at = new Date();
    this.last_accessed = new Date();
    this.touch();
  }

  /**
   * Mark as due
   */
  markDue() {
    this.status = 'due';
    this.last_accessed = new Date();
    this.touch();
  }

  /**
   * Update progress percentage
   * @param {number} percentage - New percentage (0-100)
   */
  updateProgress(percentage) {
    if (percentage >= 0 && percentage <= 100) {
      this.percentage = percentage;
      this.last_accessed = new Date();
      
      if (percentage === 100) {
        this.complete();
      } else if (this.status === 'not_started') {
        this.start();
      }
      
      this.touch();
    }
  }

  /**
   * Set current question
   * @param {string|Object} question - Question ID or Question object
   */
  setCurrentQuestion(question) {
    this.current_question = question;
    this.last_accessed = new Date();
    this.touch();
  }

  /**
   * Check if the chapter is overdue
   * @returns {boolean} True if overdue
   */
  get is_overdue() {
    return this.status === 'due' && this.percentage < 100;
  }

  /**
   * Get user ID
   * @returns {string|null} User ID
   */
  getUserId() {
    return typeof this.user === 'object' ? this.user.id : this.user;
  }

  /**
   * Get chapter ID
   * @returns {string|null} Chapter ID
   */
  getChapterId() {
    return typeof this.chapter === 'object' ? this.chapter.id : this.chapter;
  }

  /**
   * Get current question ID
   * @returns {string|null} Question ID
   */
  getCurrentQuestionId() {
    return typeof this.current_question === 'object' ? this.current_question.id : this.current_question;
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      ...super.toJSON(),
      user: this.getUserId(),
      chapter: this.getChapterId(),
      status: this.status,
      percentage: this.percentage,
      started_at: this.started_at,
      completed_at: this.completed_at,
      last_accessed: this.last_accessed,
      current_question: this.getCurrentQuestionId()
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    const username = typeof this.user === 'object' ? this.user.username : 'Unknown User';
    const chapterTitle = typeof this.chapter === 'object' ? this.chapter.title : 'Unknown Chapter';
    return `${username} - ${chapterTitle} (${this.status})`;
  }
}
