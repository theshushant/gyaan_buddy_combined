import SoftDeleteModel from '../base/SoftDeleteModel.js';

/**
 * Model for managing chapters within modules.
 */
export default class ModuleChapter extends SoftDeleteModel {
  constructor(data = {}) {
    super(data);
    this.module = data.module || null; // Module ID or Module object
    this.title = data.title || '';
    this.description = data.description || '';
    this.order = data.order || 1;
    this.is_enabled = data.is_enabled !== undefined ? data.is_enabled : true;
    this.is_important = data.is_important !== undefined ? data.is_important : false;
    this.logo = data.logo || '';
    this.created_by = data.created_by || null; // User ID or User object
  }

  /**
   * Validate chapter data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.title || this.title.trim().length === 0) {
      errors.title = 'Chapter title is required';
    } else if (this.title.length > 200) {
      errors.title = 'Chapter title must be 200 characters or less';
    }

    if (!this.module) {
      errors.module = 'Module is required';
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
   * Enable the chapter
   */
  enable() {
    this.is_enabled = true;
    this.touch();
  }

  /**
   * Disable the chapter
   */
  disable() {
    this.is_enabled = false;
    this.touch();
  }

  /**
   * Mark chapter as important
   */
  markImportant() {
    this.is_important = true;
    this.touch();
  }

  /**
   * Unmark chapter as important
   */
  unmarkImportant() {
    this.is_important = false;
    this.touch();
  }

  /**
   * Get module ID
   * @returns {string|null} Module ID
   */
  getModuleId() {
    return typeof this.module === 'object' ? this.module.id : this.module;
  }

  /**
   * Get created by user ID
   * @returns {string|null} User ID
   */
  getCreatedById() {
    return typeof this.created_by === 'object' ? this.created_by.id : this.created_by;
  }

  /**
   * Set module
   * @param {string|Object} module - Module ID or Module object
   */
  setModule(module) {
    this.module = module;
    this.touch();
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      ...super.toJSON(),
      module: this.getModuleId(),
      title: this.title,
      description: this.description,
      order: this.order,
      is_enabled: this.is_enabled,
      is_important: this.is_important,
      logo: this.logo,
      created_by: this.getCreatedById()
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    const moduleName = typeof this.module === 'object' ? this.module.name : 'Unknown Module';
    return `${this.title} - ${moduleName}`;
  }
}
