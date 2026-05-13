import TimeStampUUID from '../base/TimeStampUUID.js';

export default class UserMissionProgress extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.user = data.user || null; // User ID or User object
    this.mission = data.mission || null; // Mission ID or Mission object
    this.status = data.status || 'not_started';
    this.started_at = data.started_at || null;
    this.completed_at = data.completed_at || null;
    this.exp_earned = data.exp_earned || 0;
    this.current_question = data.current_question || null; // Question ID or Question object
  }

  static STATUS_CHOICES = [
    ['not_started', 'Not Started'],
    ['in_progress', 'In Progress'],
    ['completed', 'Completed']
  ];

  validate() {
    const errors = {};

    if (!this.user) {
      errors.user = 'User is required';
    }

    if (!this.mission) {
      errors.mission = 'Mission is required';
    }

    if (!this.status) {
      errors.status = 'Status is required';
    } else if (!UserMissionProgress.STATUS_CHOICES.some(([value]) => value === this.status)) {
      errors.status = 'Invalid status';
    }

    if (this.exp_earned < 0) {
      errors.exp_earned = 'Experience earned must be non-negative';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  start() {
    this.status = 'in_progress';
    this.started_at = new Date();
    this.touch();
  }

  complete(expEarned = 0) {
    this.status = 'completed';
    this.completed_at = new Date();
    this.exp_earned = expEarned;
    this.touch();
  }

  addExpEarned(exp) {
    if (exp > 0) {
      this.exp_earned += exp;
      this.touch();
    }
  }

  setCurrentQuestion(question) {
    this.current_question = question;
    this.touch();
  }

  getUserId() {
    return typeof this.user === 'object' ? this.user.id : this.user;
  }

  getMissionId() {
    return typeof this.mission === 'object' ? this.mission.id : this.mission;
  }

  getCurrentQuestionId() {
    return typeof this.current_question === 'object' ? this.current_question.id : this.current_question;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      user: this.getUserId(),
      mission: this.getMissionId(),
      status: this.status,
      started_at: this.started_at,
      completed_at: this.completed_at,
      exp_earned: this.exp_earned,
      current_question: this.getCurrentQuestionId()
    };
  }

  toString() {
    const username = typeof this.user === 'object' ? this.user.username : 'Unknown User';
    const missionTitle = typeof this.mission === 'object' ? this.mission.title : 'Unknown Mission';
    return `${username} - ${missionTitle} (${this.status})`;
  }
}
