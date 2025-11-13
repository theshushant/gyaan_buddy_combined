/**
 * Abstract base class that provides:
 * - String ID as primary key
 * - Automatic created_at and updated_at timestamps
 */
export default class TimeStampUUID {
  constructor(data = {}) {
    this.id = data.id || '';
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Get the date part of created_at
   * @returns {Date|null} The created date
   */
  get created_date() {
    return this.created_at ? new Date(this.created_at.toDateString()) : null;
  }

  /**
   * Get the date part of updated_at
   * @returns {Date|null} The updated date
   */
  get updated_date() {
    return this.updated_at ? new Date(this.updated_at.toDateString()) : null;
  }

  /**
   * Update the updated_at timestamp
   */
  touch() {
    this.updated_at = new Date();
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    return `${this.constructor.name} - ${this.id}`;
  }
}
