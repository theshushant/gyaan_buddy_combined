import TimeStampUUID from './TimeStampUUID.js';

export default class SoftDeleteModel extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.is_deleted = data.is_deleted || false;
    this.deleted_at = data.deleted_at || null;
  }

  get deleted_date() {
    return this.deleted_at ? new Date(this.deleted_at.toDateString()) : null;
  }

  softDelete() {
    this.is_deleted = true;
    this.deleted_at = new Date();
    this.touch();
  }

  restore() {
    this.is_deleted = false;
    this.deleted_at = null;
    this.touch();
  }

  isSoftDeleted() {
    return this.is_deleted;
  }

  isActive() {
    return !this.is_deleted;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      is_deleted: this.is_deleted,
      deleted_at: this.deleted_at
    };
  }

  toString() {
    return `${this.constructor.name} - ${this.id}`;
  }
}
