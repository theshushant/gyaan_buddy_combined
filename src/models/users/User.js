import SoftDeleteModel from '../base/SoftDeleteModel.js';

export default class User extends SoftDeleteModel {
  constructor(data = {}) {
    super(data);
    
    this.username = data.username || '';
    this.email = data.email || '';
    this.first_name = data.first_name || '';
    this.last_name = data.last_name || '';
    this.password = data.password || '';
    
    this.user_type = data.user_type || 'student';
    this.school = data.school || null; // School ID or School object
    
    this.admission_number = data.admission_number || null;
    this.roll_number = data.roll_number || null;
    this.class_instance = data.class_instance || null; // Class ID or Class object
    
    this.total_exp = data.total_exp || 0;
    this.rewards = data.rewards || 0;
    this.level = data.level || null; // Level ID or Level object
    
    this.phone_number = data.phone_number || '';
    this.date_of_birth = data.date_of_birth || null;
    this.profile_picture = data.profile_picture || '';
    this.bio = data.bio || '';
    this.fcm_token = data.fcm_token || '';
    
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.logged_in_once = data.logged_in_once || false;
  }

  static USER_TYPE_CHOICES = [
    ['student', 'Student'],
    ['teacher', 'Teacher'],
    ['admin', 'Administrator']
  ];

  validate() {
    const errors = {};

    if (!this.username || this.username.trim().length === 0) {
      errors.username = 'Username is required';
    }

    if (!this.email || this.email.trim().length === 0) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(this.email)) {
      errors.email = 'Invalid email format';
    }

    if (!this.first_name || this.first_name.trim().length === 0) {
      errors.first_name = 'First name is required';
    }

    if (!this.school) {
      errors.school = 'School is required';
    }

    if (this.user_type === 'student') {
      if (!this.roll_number) {
        errors.roll_number = 'Roll number is required for students';
      }
    } else if (this.roll_number) {
      errors.roll_number = 'Roll number should only be set for students';
    }

    if (this.total_exp < 0) {
      errors.total_exp = 'Total experience must be non-negative';
    }

    if (this.rewards < 0) {
      errors.rewards = 'Rewards must be non-negative';
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

  get full_name() {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  addExp(points) {
    if (points > 0) {
      this.total_exp += points;
      this.touch();
    }
  }

  addRewards(points) {
    if (points > 0) {
      this.rewards += points;
      this.touch();
    }
  }

  getLevel() {
    return this.level ? this.level.name : 1;
  }

  isEnrolledInClass() {
    return this.class_instance !== null;
  }

  getClassName() {
    return this.class_instance ? 
      (typeof this.class_instance === 'object' ? this.class_instance.name : 'Unknown') : 
      null;
  }

  getSchoolId() {
    return typeof this.school === 'object' ? this.school.id : this.school;
  }

  getClassId() {
    return typeof this.class_instance === 'object' ? this.class_instance.id : this.class_instance;
  }

  getLevelId() {
    return typeof this.level === 'object' ? this.level.id : this.level;
  }

  activate() {
    this.is_active = true;
    this.touch();
  }

  deactivate() {
    this.is_active = false;
    this.touch();
  }

  markLoggedIn() {
    this.logged_in_once = true;
    this.touch();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      username: this.username,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      user_type: this.user_type,
      school: this.getSchoolId(),
      admission_number: this.admission_number,
      roll_number: this.roll_number,
      class_instance: this.getClassId(),
      total_exp: this.total_exp,
      rewards: this.rewards,
      level: this.getLevelId(),
      phone_number: this.phone_number,
      date_of_birth: this.date_of_birth,
      profile_picture: this.profile_picture,
      bio: this.bio,
      fcm_token: this.fcm_token,
      is_active: this.is_active,
      logged_in_once: this.logged_in_once
    };
  }

  toString() {
    return `${this.username} (${this.getUserTypeDisplay()})`;
  }

  getUserTypeDisplay() {
    const choice = User.USER_TYPE_CHOICES.find(([value]) => value === this.user_type);
    return choice ? choice[1] : this.user_type;
  }
}
