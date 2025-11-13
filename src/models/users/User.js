import SoftDeleteModel from '../base/SoftDeleteModel.js';

/**
 * Custom User model for Gyaan Buddy application.
 */
export default class User extends SoftDeleteModel {
  constructor(data = {}) {
    super(data);
    
    // Basic user information
    this.username = data.username || '';
    this.email = data.email || '';
    this.first_name = data.first_name || '';
    this.last_name = data.last_name || '';
    this.password = data.password || '';
    
    // User type and school
    this.user_type = data.user_type || 'student';
    this.school = data.school || null; // School ID or School object
    
    // Student specific fields
    this.admission_number = data.admission_number || null;
    this.roll_number = data.roll_number || null;
    this.class_instance = data.class_instance || null; // Class ID or Class object
    
    // Experience and rewards
    this.total_exp = data.total_exp || 0;
    this.rewards = data.rewards || 0;
    this.level = data.level || null; // Level ID or Level object
    
    // Additional fields
    this.phone_number = data.phone_number || '';
    this.date_of_birth = data.date_of_birth || null;
    this.profile_picture = data.profile_picture || '';
    this.bio = data.bio || '';
    this.fcm_token = data.fcm_token || '';
    
    // Status fields
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.logged_in_once = data.logged_in_once || false;
  }

  /**
   * User type choices
   */
  static USER_TYPE_CHOICES = [
    ['student', 'Student'],
    ['teacher', 'Teacher'],
    ['admin', 'Administrator']
  ];

  /**
   * Validate user data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    // Required fields
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

    // User type specific validation
    if (this.user_type === 'student') {
      if (!this.roll_number) {
        errors.roll_number = 'Roll number is required for students';
      }
    } else if (this.roll_number) {
      errors.roll_number = 'Roll number should only be set for students';
    }

    // Experience validation
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
   * Get user's full name
   * @returns {string} Full name
   */
  get full_name() {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  /**
   * Add experience points to the user
   * @param {number} points - Points to add
   */
  addExp(points) {
    if (points > 0) {
      this.total_exp += points;
      this.touch();
    }
  }

  /**
   * Add rewards to the user
   * @param {number} points - Points to add
   */
  addRewards(points) {
    if (points > 0) {
      this.rewards += points;
      this.touch();
    }
  }

  /**
   * Get current level number
   * @returns {number} Current level
   */
  getLevel() {
    return this.level ? this.level.name : 1;
  }

  /**
   * Check if user is enrolled in a class
   * @returns {boolean} True if enrolled
   */
  isEnrolledInClass() {
    return this.class_instance !== null;
  }

  /**
   * Get the name of the class the user is enrolled in
   * @returns {string|null} Class name
   */
  getClassName() {
    return this.class_instance ? 
      (typeof this.class_instance === 'object' ? this.class_instance.name : 'Unknown') : 
      null;
  }

  /**
   * Get school ID
   * @returns {string|null} School ID
   */
  getSchoolId() {
    return typeof this.school === 'object' ? this.school.id : this.school;
  }

  /**
   * Get class ID
   * @returns {string|null} Class ID
   */
  getClassId() {
    return typeof this.class_instance === 'object' ? this.class_instance.id : this.class_instance;
  }

  /**
   * Get level ID
   * @returns {string|null} Level ID
   */
  getLevelId() {
    return typeof this.level === 'object' ? this.level.id : this.level;
  }

  /**
   * Activate the user
   */
  activate() {
    this.is_active = true;
    this.touch();
  }

  /**
   * Deactivate the user
   */
  deactivate() {
    this.is_active = false;
    this.touch();
  }

  /**
   * Mark user as logged in
   */
  markLoggedIn() {
    this.logged_in_once = true;
    this.touch();
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
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

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    return `${this.username} (${this.getUserTypeDisplay()})`;
  }

  /**
   * Get user type display name
   * @returns {string} User type display name
   */
  getUserTypeDisplay() {
    const choice = User.USER_TYPE_CHOICES.find(([value]) => value === this.user_type);
    return choice ? choice[1] : this.user_type;
  }
}
