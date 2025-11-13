import SoftDeleteModel from '../base/SoftDeleteModel.js';

/**
 * Model for managing questions with soft delete functionality.
 */
export default class Question extends SoftDeleteModel {
  constructor(data = {}) {
    super(data);
    this.question_text = data.question_text || '';
    this.image = data.image || '';
    this.question_type = data.question_type || 'mcq_single';
    this.exp_points = data.exp_points || 10;
    this.difficulty_level = data.difficulty_level || 'medium';
    this.explanation = data.explanation || '';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_by = data.created_by || null; // User ID or User object
    this.options = data.options || []; // Array of Option objects
  }

  /**
   * Question type choices
   */
  static QUESTION_TYPE_CHOICES = [
    ['mcq_single', 'MCQ - Single Correct Answer'],
    ['mcq_multiple', 'MCQ - Multiple Correct Answers'],
    ['short_answer', 'Short Answer Question']
  ];

  /**
   * Difficulty level choices
   */
  static DIFFICULTY_LEVEL_CHOICES = [
    ['easy', 'Easy'],
    ['medium', 'Medium'],
    ['hard', 'Hard']
  ];

  /**
   * Validate question data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.question_text || this.question_text.trim().length === 0) {
      errors.question_text = 'Question text is required';
    }

    if (!this.question_type) {
      errors.question_type = 'Question type is required';
    } else if (!Question.QUESTION_TYPE_CHOICES.some(([value]) => value === this.question_type)) {
      errors.question_type = 'Invalid question type';
    }

    if (this.exp_points < 0) {
      errors.exp_points = 'Experience points must be non-negative';
    }

    if (!this.difficulty_level) {
      errors.difficulty_level = 'Difficulty level is required';
    } else if (!Question.DIFFICULTY_LEVEL_CHOICES.some(([value]) => value === this.difficulty_level)) {
      errors.difficulty_level = 'Invalid difficulty level';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Activate the question
   */
  activate() {
    this.is_active = true;
    this.touch();
  }

  /**
   * Deactivate the question
   */
  deactivate() {
    this.is_active = false;
    this.touch();
  }

  /**
   * Add an option to this question
   * @param {Object} option - Option object
   */
  addOption(option) {
    this.options.push(option);
    this.touch();
  }

  /**
   * Remove an option from this question
   * @param {string} optionId - Option ID to remove
   */
  removeOption(optionId) {
    this.options = this.options.filter(option => option.id !== optionId);
    this.touch();
  }

  /**
   * Get correct answers count
   * @returns {number} Number of correct answers
   */
  get correct_answers_count() {
    return this.options.filter(option => option.is_correct).length;
  }

  /**
   * Get options count
   * @returns {number} Number of options
   */
  get options_count() {
    return this.options.length;
  }

  /**
   * Get correct options
   * @returns {Array} Array of correct options
   */
  getCorrectOptions() {
    return this.options.filter(option => option.is_correct);
  }

  /**
   * Get created by user ID
   * @returns {string|null} User ID
   */
  getCreatedById() {
    return typeof this.created_by === 'object' ? this.created_by.id : this.created_by;
  }

  /**
   * Set created by user
   * @param {string|Object} user - User ID or User object
   */
  setCreatedBy(user) {
    this.created_by = user;
    this.touch();
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      ...super.toJSON(),
      question_text: this.question_text,
      image: this.image,
      question_type: this.question_type,
      exp_points: this.exp_points,
      difficulty_level: this.difficulty_level,
      explanation: this.explanation,
      is_active: this.is_active,
      created_by: this.getCreatedById(),
      options: this.options
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    return `${this.question_text.substring(0, 50)}...`;
  }
}
