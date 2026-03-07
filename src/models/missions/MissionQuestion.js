import TimeStampUUID from '../base/TimeStampUUID.js';

export default class MissionQuestion extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.mission = data.mission || null; // Mission ID or Mission object
    this.question = data.question || null; // Question ID or Question object
    this.order = data.order || 1;
  }

  validate() {
    const errors = {};

    if (!this.mission) {
      errors.mission = 'Mission is required';
    }

    if (!this.question) {
      errors.question = 'Question is required';
    }

    if (this.order < 1) {
      errors.order = 'Order must be a positive integer';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  getMissionId() {
    return typeof this.mission === 'object' ? this.mission.id : this.mission;
  }

  getQuestionId() {
    return typeof this.question === 'object' ? this.question.id : this.question;
  }

  setMission(mission) {
    this.mission = mission;
    this.touch();
  }

  setQuestion(question) {
    this.question = question;
    this.touch();
  }

  updateOrder(order) {
    if (order >= 1) {
      this.order = order;
      this.touch();
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      mission: this.getMissionId(),
      question: this.getQuestionId(),
      order: this.order
    };
  }

  toString() {
    const missionTitle = typeof this.mission === 'object' ? 
      this.mission.title : 'Unknown Mission';
    const questionText = typeof this.question === 'object' ? 
      this.question.question_text.substring(0, 50) : 'Unknown Question';
    return `${missionTitle} - Q${this.order}: ${questionText}...`;
  }
}
