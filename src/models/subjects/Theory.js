import SoftDeleteModel from '../base/SoftDeleteModel.js';

/**
 * Model for managing theoretical content with soft delete functionality.
 */
export default class Theory extends SoftDeleteModel {
  constructor(data = {}) {
    super(data);
    this.title = data.title || '';
    this.description = data.description || '';
    this.created_by = data.created_by || null; // User ID or User object
  }

  /**
   * Validate theory data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.title || this.title.trim().length === 0) {
      errors.title = 'Theory title is required';
    } else if (this.title.length > 200) {
      errors.title = 'Theory title must be 200 characters or less';
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.description = 'Theory description is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get description preview (first 100 characters)
   * @returns {string} Description preview
   */
  get description_preview() {
    return this.description.length > 100 ? 
      this.description.substring(0, 100) + '...' : 
      this.description;
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
      title: this.title,
      description: this.description,
      created_by: this.getCreatedById()
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    return this.title;
  }
}
