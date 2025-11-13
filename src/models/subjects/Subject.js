import TimeStampUUID from '../base/TimeStampUUID.js';

/**
 * Model for managing subjects in the educational system.
 */
export default class Subject extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.name = data.name || '';
    this.code = data.code || '';
    this.description = data.description || '';
    this.logo = data.logo || '';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_by = data.created_by || null; // User ID or User object
    this.classes = data.classes || []; // Array of Class IDs or Class objects
  }

  /**
   * Validate subject data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.name || this.name.trim().length === 0) {
      errors.name = 'Subject name is required';
    } else if (this.name.length > 100) {
      errors.name = 'Subject name must be 100 characters or less';
    }

    if (!this.code || this.code.trim().length === 0) {
      errors.code = 'Subject code is required';
    } else if (this.code.length > 10) {
      errors.code = 'Subject code must be 10 characters or less';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Activate the subject
   */
  activate() {
    this.is_active = true;
    this.touch();
  }

  /**
   * Deactivate the subject
   */
  deactivate() {
    this.is_active = false;
    this.touch();
  }

  /**
   * Add a class to this subject
   * @param {string|Object} classItem - Class ID or Class object
   */
  addClass(classItem) {
    const classId = typeof classItem === 'object' ? classItem.id : classItem;
    if (!this.classes.includes(classId)) {
      this.classes.push(classId);
      this.touch();
    }
  }

  /**
   * Remove a class from this subject
   * @param {string|Object} classItem - Class ID or Class object
   */
  removeClass(classItem) {
    const classId = typeof classItem === 'object' ? classItem.id : classItem;
    this.classes = this.classes.filter(id => id !== classId);
    this.touch();
  }

  /**
   * Check if subject has a specific class
   * @param {string|Object} classItem - Class ID or Class object
   * @returns {boolean} True if subject has the class
   */
  hasClass(classItem) {
    const classId = typeof classItem === 'object' ? classItem.id : classItem;
    return this.classes.includes(classId);
  }

  /**
   * Get created by user ID
   * @returns {string|null} User ID
   */
  getCreatedById() {
    return typeof this.created_by === 'object' ? this.created_by.id : this.created_by;
  }

  /**
   * Get class IDs
   * @returns {Array<string>} Array of class IDs
   */
  getClassIds() {
    return this.classes.map(classItem => 
      typeof classItem === 'object' ? classItem.id : classItem
    );
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      code: this.code,
      description: this.description,
      logo: this.logo,
      is_active: this.is_active,
      created_by: this.getCreatedById(),
      classes: this.getClassIds()
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    return `${this.name} (${this.code})`;
  }
}
