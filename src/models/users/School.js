import SoftDeleteModel from '../base/SoftDeleteModel.js';

/**
 * Model for managing schools in the educational system.
 */
export default class School extends SoftDeleteModel {
  constructor(data = {}) {
    super(data);
    this.name = data.name || '';
    this.address = data.address || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.website = data.website || '';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
  }

  /**
   * Validate school data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.name || this.name.trim().length === 0) {
      errors.name = 'School name is required';
    } else if (this.name.length > 200) {
      errors.name = 'School name must be 200 characters or less';
    }

    if (this.email && !this.isValidEmail(this.email)) {
      errors.email = 'Invalid email format';
    }

    if (this.website && !this.isValidUrl(this.website)) {
      errors.website = 'Invalid website URL format';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Check if email is valid
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if URL is valid
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Activate the school
   */
  activate() {
    this.is_active = true;
    this.touch();
  }

  /**
   * Deactivate the school
   */
  deactivate() {
    this.is_active = false;
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
      address: this.address,
      phone: this.phone,
      email: this.email,
      website: this.website,
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
