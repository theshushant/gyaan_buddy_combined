/**
 * Model for managing user levels based on experience points.
 */
export default class Level {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || 1;
    this.min_exp = data.min_exp || 0;
    this.max_exp = data.max_exp || 100;
  }

  /**
   * Validate level data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.name || this.name < 1) {
      errors.name = 'Level name must be a positive integer';
    }

    if (this.min_exp < 0) {
      errors.min_exp = 'Minimum experience must be non-negative';
    }

    if (this.max_exp < 0) {
      errors.max_exp = 'Maximum experience must be non-negative';
    }

    if (this.min_exp > this.max_exp) {
      errors.min_exp = 'Minimum experience cannot be greater than maximum experience';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Check if given experience points fall within this level
   * @param {number} expPoints - Experience points to check
   * @returns {boolean} True if experience falls within this level
   */
  containsExp(expPoints) {
    return expPoints >= this.min_exp && expPoints <= this.max_exp;
  }

  /**
   * Get experience points needed to reach this level
   * @param {number} currentExp - Current experience points
   * @returns {number} Experience points needed
   */
  getExpNeeded(currentExp) {
    return Math.max(0, this.min_exp - currentExp);
  }

  /**
   * Get experience points needed to reach next level
   * @param {number} currentExp - Current experience points
   * @param {Level} nextLevel - Next level
   * @returns {number} Experience points needed
   */
  getExpToNextLevel(currentExp, nextLevel) {
    if (!nextLevel) return 0;
    return Math.max(0, nextLevel.min_exp - currentExp);
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      min_exp: this.min_exp,
      max_exp: this.max_exp
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    return `Level ${this.name} (${this.min_exp}-${this.max_exp} exp)`;
  }
}
