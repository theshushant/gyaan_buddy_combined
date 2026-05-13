export default class TimeStampUUID {
  constructor(data = {}) {
    this.id = data.id || '';
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  get created_date() {
    return this.created_at ? new Date(this.created_at.toDateString()) : null;
  }

  get updated_date() {
    return this.updated_at ? new Date(this.updated_at.toDateString()) : null;
  }

  touch() {
    this.updated_at = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  toString() {
    return `${this.constructor.name} - ${this.id}`;
  }
}
