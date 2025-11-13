import TimeStampUUID from '../base/TimeStampUUID.js';

/**
 * Model for managing modules within subjects.
 */
export default class Module extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.name = data.name || '';
    this.subject = data.subject || null; // Subject ID or Subject object
    this.description = data.description || '';
    this.order = data.order || 1;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.logo = data.logo || '';
    this.is_enabled = data.is_enabled !== undefined ? data.is_enabled : false;
    this.created_by = data.created_by || null; // User ID or User object
  }

  /**
   * Validate module data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.name || this.name.trim().length === 0) {
      errors.name = 'Module name is required';
    } else if (this.name.length > 100) {
      errors.name = 'Module name must be 100 characters or less';
    }

    if (!this.subject) {
      errors.subject = 'Subject is required';
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
   * Activate the module
   */
  activate() {
    this.is_active = true;
    this.touch();
  }

  /**
   * Deactivate the module
   */
  deactivate() {
    this.is_active = false;
    this.touch();
  }

  /**
   * Enable the module
   */
  enable() {
    this.is_enabled = true;
    this.touch();
  }

  /**
   * Disable the module
   */
  disable() {
    this.is_enabled = false;
    this.touch();
  }

  /**
   * Get subject ID
   * @returns {string|null} Subject ID
   */
  getSubjectId() {
    return typeof this.subject === 'object' ? this.subject.id : this.subject;
  }

  /**
   * Get created by user ID
   * @returns {string|null} User ID
   */
  getCreatedById() {
    return typeof this.created_by === 'object' ? this.created_by.id : this.created_by;
  }

  /**
   * Set subject
   * @param {string|Object} subject - Subject ID or Subject object
   */
  setSubject(subject) {
    this.subject = subject;
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
      subject: this.getSubjectId(),
      description: this.description,
      order: this.order,
      is_active: this.is_active,
      logo: this.logo,
      is_enabled: this.is_enabled,
      created_by: this.getCreatedById()
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    const subjectName = typeof this.subject === 'object' ? this.subject.name : 'Unknown Subject';
    return `${this.name} - ${subjectName}`;
  }
}
