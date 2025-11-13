import TimeStampUUID from '../base/TimeStampUUID.js';

/**
 * Model for tracking individual user progress in competitions.
 */
export default class UserCompetitionProgress extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.user = data.user || null; // User ID or User object
    this.competition = data.competition || null; // Competition ID or Competition object
    this.status = data.status || 'not_started';
    this.score = data.score || 0;
    this.time_taken = data.time_taken || 0; // in seconds
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

    if (!this.competition) {
      errors.competition = 'Competition is required';
    }

    if (!this.status) {
      errors.status = 'Status is required';
    } else if (!UserCompetitionProgress.STATUS_CHOICES.some(([value]) => value === this.status)) {
      errors.status = 'Invalid status';
    }

    if (this.score < 0) {
      errors.score = 'Score must be non-negative';
    }

    if (this.time_taken < 0) {
      errors.time_taken = 'Time taken must be non-negative';
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
   * Start the competition
   */
  start() {
    this.status = 'in_progress';
    this.started_at = new Date();
    this.touch();
  }

  /**
   * Complete the competition
   * @param {number} score - Final score
   * @param {number} timeTaken - Time taken in seconds
   * @param {number} expEarned - Experience points earned
   */
  complete(score = 0, timeTaken = 0, expEarned = 0) {
    this.status = 'completed';
    this.completed_at = new Date();
    this.score = score;
    this.time_taken = timeTaken;
    this.exp_earned = expEarned;
    this.touch();
  }

  /**
   * Update score
   * @param {number} score - New score
   */
  updateScore(score) {
    if (score >= 0) {
      this.score = score;
      this.touch();
    }
  }

  /**
   * Update time taken
   * @param {number} timeTaken - Time taken in seconds
   */
  updateTimeTaken(timeTaken) {
    if (timeTaken >= 0) {
      this.time_taken = timeTaken;
      this.touch();
    }
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
   * Get time taken in minutes
   * @returns {number} Time taken in minutes
   */
  getTimeTakenInMinutes() {
    return Math.round(this.time_taken / 60 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get user ID
   * @returns {string|null} User ID
   */
  getUserId() {
    return typeof this.user === 'object' ? this.user.id : this.user;
  }

  /**
   * Get competition ID
   * @returns {string|null} Competition ID
   */
  getCompetitionId() {
    return typeof this.competition === 'object' ? this.competition.id : this.competition;
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
      competition: this.getCompetitionId(),
      status: this.status,
      score: this.score,
      time_taken: this.time_taken,
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
    const competitionTitle = typeof this.competition === 'object' ? this.competition.title : 'Unknown Competition';
    return `${username} - ${competitionTitle} (${this.status})`;
  }
}
