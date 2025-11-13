import TimeStampUUID from '../base/TimeStampUUID.js';

/**
 * Model for managing question options.
 */
export default class Option extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.question = data.question || null; // Question ID or Question object
    this.option_text = data.option_text || '';
    this.is_correct = data.is_correct !== undefined ? data.is_correct : false;
    this.order = data.order || 1;
  }

  /**
   * Validate option data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.option_text || this.option_text.trim().length === 0) {
      errors.option_text = 'Option text is required';
    } else if (this.option_text.length > 500) {
      errors.option_text = 'Option text must be 500 characters or less';
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
   * Mark option as correct
   */
  markCorrect() {
    this.is_correct = true;
    this.touch();
  }

  /**
   * Mark option as incorrect
   */
  markIncorrect() {
    this.is_correct = false;
    this.touch();
  }

  /**
   * Toggle correct status
   */
  toggleCorrect() {
    this.is_correct = !this.is_correct;
    this.touch();
  }

  /**
   * Get question ID
   * @returns {string|null} Question ID
   */
  getQuestionId() {
    return typeof this.question === 'object' ? this.question.id : this.question;
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
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      ...super.toJSON(),
      question: this.getQuestionId(),
      option_text: this.option_text,
      is_correct: this.is_correct,
      order: this.order
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    const questionText = typeof this.question === 'object' ? 
      this.question.question_text.substring(0, 30) : 'Unknown Question';
    return `${this.option_text.substring(0, 30)}... - ${questionText}...`;
  }
}
