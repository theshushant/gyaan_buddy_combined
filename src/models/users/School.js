import SoftDeleteModel from '../base/SoftDeleteModel.js';

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

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  activate() {
    this.is_active = true;
    this.touch();
  }

  deactivate() {
    this.is_active = false;
    this.touch();
  }

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

  toString() {
    return this.name;
  }
}
