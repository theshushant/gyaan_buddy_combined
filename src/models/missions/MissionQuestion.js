import TimeStampUUID from '../base/TimeStampUUID.js';

/**
 * Intermediate model for Mission-Question relationship with ordering.
 */
export default class MissionQuestion extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.mission = data.mission || null; // Mission ID or Mission object
    this.question = data.question || null; // Question ID or Question object
    this.order = data.order || 1;
  }

  /**
   * Validate mission question data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.mission) {
      errors.mission = 'Mission is required';
    }

    if (!this.question) {
      errors.question = 'Question is required';
    }

    if (this.order < 1) {
      errors.order = 'Order must be a positive integer';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get mission ID
   * @returns {string|null} Mission ID
   */
  getMissionId() {
    return typeof this.mission === 'object' ? this.mission.id : this.mission;
  }

  /**
   * Get question ID
   * @returns {string|null} Question ID
   */
  getQuestionId() {
    return typeof this.question === 'object' ? this.question.id : this.question;
  }

  /**
   * Set mission
   * @param {string|Object} mission - Mission ID or Mission object
   */
  setMission(mission) {
    this.mission = mission;
    this.touch();
  }

  /**
   * Set question
   * @param {string|Object} question - Question ID or Question object
   */
  setQuestion(question) {
    this.question = question;
    this.touch();
  }

  /**
   * Update order
   * @param {number} order - New order
   */
  updateOrder(order) {
    if (order >= 1) {
      this.order = order;
      this.touch();
    }
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      ...super.toJSON(),
      mission: this.getMissionId(),
      question: this.getQuestionId(),
      order: this.order
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    const missionTitle = typeof this.mission === 'object' ? 
      this.mission.title : 'Unknown Mission';
    const questionText = typeof this.question === 'object' ? 
      this.question.question_text.substring(0, 50) : 'Unknown Question';
    return `${missionTitle} - Q${this.order}: ${questionText}...`;
  }
}
