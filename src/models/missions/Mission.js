import SoftDeleteModel from '../base/SoftDeleteModel.js';

/**
 * Model for managing missions in the educational system.
 */
export default class Mission extends SoftDeleteModel {
  constructor(data = {}) {
    super(data);
    this.title = data.title || '';
    this.description = data.description || '';
    this.mission_date = data.mission_date || new Date();
    this.exp_multiplier = data.exp_multiplier || 1.00;
    this.base_exp = data.base_exp || 10;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_by = data.created_by || null; // User ID or User object
    this.questions = data.questions || []; // Array of Question IDs or Question objects
    this.class_group = data.class_group || null; // Class ID or Class object
  }

  /**
   * Validate mission data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.title || this.title.trim().length === 0) {
      errors.title = 'Mission title is required';
    } else if (this.title.length > 200) {
      errors.title = 'Mission title must be 200 characters or less';
    }

    if (!this.mission_date) {
      errors.mission_date = 'Mission date is required';
    }

    if (this.exp_multiplier < 0) {
      errors.exp_multiplier = 'Experience multiplier must be non-negative';
    }

    if (this.base_exp < 0) {
      errors.base_exp = 'Base experience must be non-negative';
    }

    if (!this.class_group) {
      errors.class_group = 'Class group is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Activate the mission
   */
  activate() {
    this.is_active = true;
    this.touch();
  }

  /**
   * Deactivate the mission
   */
  deactivate() {
    this.is_active = false;
    this.touch();
  }

  /**
   * Add a question to this mission
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
   * Remove a question from this mission
   * @param {string|Object} question - Question ID or Question object
   */
  removeQuestion(question) {
    const questionId = typeof question === 'object' ? question.id : question;
    this.questions = this.questions.filter(id => id !== questionId);
    this.touch();
  }

  /**
   * Check if mission has a specific question
   * @param {string|Object} question - Question ID or Question object
   * @returns {boolean} True if mission has the question
   */
  hasQuestion(question) {
    const questionId = typeof question === 'object' ? question.id : question;
    return this.questions.includes(questionId);
  }

  /**
   * Get total experience points for this mission
   * @returns {number} Total experience points
   */
  get total_exp() {
    return this.base_exp * this.exp_multiplier;
  }

  /**
   * Get question count
   * @returns {number} Number of questions
   */
  get question_count() {
    return this.questions.length;
  }

  /**
   * Get created by user ID
   * @returns {string|null} User ID
   */
  getCreatedById() {
    return typeof this.created_by === 'object' ? this.created_by.id : this.created_by;
  }

  /**
   * Get class group ID
   * @returns {string|null} Class ID
   */
  getClassGroupId() {
    return typeof this.class_group === 'object' ? this.class_group.id : this.class_group;
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
   * Set created by user
   * @param {string|Object} user - User ID or User object
   */
  setCreatedBy(user) {
    this.created_by = user;
    this.touch();
  }

  /**
   * Set class group
   * @param {string|Object} classGroup - Class ID or Class object
   */
  setClassGroup(classGroup) {
    this.class_group = classGroup;
    this.touch();
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
      mission_date: this.mission_date,
      exp_multiplier: this.exp_multiplier,
      base_exp: this.base_exp,
      is_active: this.is_active,
      created_by: this.getCreatedById(),
      questions: this.getQuestionIds(),
      class_group: this.getClassGroupId()
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    const className = typeof this.class_group === 'object' ? 
      this.class_group.name : 'Unknown Class';
    return `${this.title} - ${className} - ${this.mission_date}`;
  }
}
