import TimeStampUUID from '../base/TimeStampUUID.js';

export default class Class extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.name = data.name || '';
    this.school = data.school || null; // School ID or School object
    this.description = data.description || '';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
  }

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

  activate() {
    this.is_active = true;
    this.touch();
  }

  deactivate() {
    this.is_active = false;
    this.touch();
  }

  getSchoolId() {
    return typeof this.school === 'object' ? this.school.id : this.school;
  }

  setSchool(school) {
    this.school = school;
    this.touch();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      school: this.getSchoolId(),
      description: this.description,
      is_active: this.is_active
    };
  }

  toString() {
    return this.name;
  }
}
