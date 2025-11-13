import TimeStampUUID from '../base/TimeStampUUID.js';

/**
 * Model for managing classes in the educational system.
 */
export default class Class extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.name = data.name || '';
    this.school = data.school || null; // School ID or School object
    this.description = data.description || '';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
  }

  /**
   * Validate class data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.name || this.name.trim().length === 0) {
      errors.name = 'Class name is required';
    } else if (this.name.length > 100) {
      errors.name = 'Class name must be 100 characters or less';
    }

    if (!this.school) {
      errors.school = 'School is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Activate the class
   */
  activate() {
    this.is_active = true;
    this.touch();
  }

  /**
   * Deactivate the class
   */
  deactivate() {
    this.is_active = false;
    this.touch();
  }

  /**
   * Get school ID
   * @returns {string|null} School ID
   */
  getSchoolId() {
    return typeof this.school === 'object' ? this.school.id : this.school;
  }

  /**
   * Set school
   * @param {string|Object} school - School ID or School object
   */
  setSchool(school) {
    this.school = school;
    this.touch();
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      school: this.getSchoolId(),
      description: this.description,
      is_active: this.is_active
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    return this.name;
  }
}
