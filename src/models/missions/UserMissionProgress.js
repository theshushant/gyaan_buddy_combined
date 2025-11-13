import TimeStampUUID from '../base/TimeStampUUID.js';

/**
 * Model for tracking individual user progress on missions.
 */
export default class UserMissionProgress extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.user = data.user || null; // User ID or User object
    this.mission = data.mission || null; // Mission ID or Mission object
    this.status = data.status || 'not_started';
    this.started_at = data.started_at || null;
    this.completed_at = data.completed_at || null;
    this.exp_earned = data.exp_earned || 0;
    this.current_question = data.current_question || null; // Question ID or Question object
  }

  /**
   * Status choices
   */
  static STATUS_CHOICES = [
    ['not_started', 'Not Started'],
    ['in_progress', 'In Progress'],
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

    if (!this.mission) {
      errors.mission = 'Mission is required';
    }

    if (!this.status) {
      errors.status = 'Status is required';
    } else if (!UserMissionProgress.STATUS_CHOICES.some(([value]) => value === this.status)) {
      errors.status = 'Invalid status';
    }

    if (this.exp_earned < 0) {
      errors.exp_earned = 'Experience earned must be non-negative';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Start the mission
   */
  start() {
    this.status = 'in_progress';
    this.started_at = new Date();
    this.touch();
  }

  /**
   * Complete the mission
   * @param {number} expEarned - Experience points earned
   */
  complete(expEarned = 0) {
    this.status = 'completed';
    this.completed_at = new Date();
    this.exp_earned = expEarned;
    this.touch();
  }

  /**
   * Add experience earned
   * @param {number} exp - Experience points to add
   */
  addExpEarned(exp) {
    if (exp > 0) {
      this.exp_earned += exp;
      this.touch();
    }
  }

  /**
   * Set current question
   * @param {string|Object} question - Question ID or Question object
   */
  setCurrentQuestion(question) {
    this.current_question = question;
    this.touch();
  }

  /**
   * Get user ID
   * @returns {string|null} User ID
   */
  getUserId() {
    return typeof this.user === 'object' ? this.user.id : this.user;
  }

  /**
   * Get mission ID
   * @returns {string|null} Mission ID
   */
  getMissionId() {
    return typeof this.mission === 'object' ? this.mission.id : this.mission;
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
      mission: this.getMissionId(),
      status: this.status,
      started_at: this.started_at,
      completed_at: this.completed_at,
      exp_earned: this.exp_earned,
      current_question: this.getCurrentQuestionId()
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    const username = typeof this.user === 'object' ? this.user.username : 'Unknown User';
    const missionTitle = typeof this.mission === 'object' ? this.mission.title : 'Unknown Mission';
    return `${username} - ${missionTitle} (${this.status})`;
  }
}
