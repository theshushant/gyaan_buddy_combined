import TimeStampUUID from './TimeStampUUID.js';

/**
 * Abstract base class that provides:
 * - String ID as primary key
 * - Automatic timestamps
 * - Soft delete functionality with is_deleted and deleted_at fields
 * - Methods: softDelete(), restore(), hardDelete()
 */
export default class SoftDeleteModel extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.is_deleted = data.is_deleted || false;
    this.deleted_at = data.deleted_at || null;
  }

  /**
   * Get the date part of deleted_at
   * @returns {Date|null} The deleted date
   */
  get deleted_date() {
    return this.deleted_at ? new Date(this.deleted_at.toDateString()) : null;
  }

  /**
   * Soft delete the record
   */
  softDelete() {
    this.is_deleted = true;
    this.deleted_at = new Date();
    this.touch();
  }

  /**
   * Restore a soft deleted record
   */
  restore() {
    this.is_deleted = false;
    this.deleted_at = null;
    this.touch();
  }

  /**
   * Check if the record is soft deleted
   * @returns {boolean} True if soft deleted
   */
  isSoftDeleted() {
    return this.is_deleted;
  }

  /**
   * Check if the record is active (not soft deleted)
   * @returns {boolean} True if active
   */
  isActive() {
    return !this.is_deleted;
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      ...super.toJSON(),
      is_deleted: this.is_deleted,
      deleted_at: this.deleted_at
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
