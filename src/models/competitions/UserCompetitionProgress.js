import TimeStampUUID from '../base/TimeStampUUID.js';

export default class UserCompetitionProgress extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.user = data.user || null; // User ID or User object
    this.competition = data.competition || null; // Competition ID or Competition object
    this.status = data.status || 'not_started';
    this.score = data.score || 0;
    this.time_taken = data.time_taken || 0; // in seconds
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

    if (!this.competition) {
      errors.competition = 'Competition is required';
    }

    if (!this.status) {
      errors.status = 'Status is required';
    } else if (!UserCompetitionProgress.STATUS_CHOICES.some(([value]) => value === this.status)) {
      errors.status = 'Invalid status';
    }

    if (this.score < 0) {
      errors.score = 'Score must be non-negative';
    }

    if (this.time_taken < 0) {
      errors.time_taken = 'Time taken must be non-negative';
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

  complete(score = 0, timeTaken = 0, expEarned = 0) {
    this.status = 'completed';
    this.completed_at = new Date();
    this.score = score;
    this.time_taken = timeTaken;
    this.exp_earned = expEarned;
    this.touch();
  }

  updateScore(score) {
    if (score >= 0) {
      this.score = score;
      this.touch();
    }
  }

  updateTimeTaken(timeTaken) {
    if (timeTaken >= 0) {
      this.time_taken = timeTaken;
      this.touch();
    }
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

  getTimeTakenInMinutes() {
    return Math.round(this.time_taken / 60 * 100) / 100; // Round to 2 decimal places
  }

  getUserId() {
    return typeof this.user === 'object' ? this.user.id : this.user;
  }

  getCompetitionId() {
    return typeof this.competition === 'object' ? this.competition.id : this.competition;
  }

  getCurrentQuestionId() {
    return typeof this.current_question === 'object' ? this.current_question.id : this.current_question;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      user: this.getUserId(),
      competition: this.getCompetitionId(),
      status: this.status,
      score: this.score,
      time_taken: this.time_taken,
      started_at: this.started_at,
      completed_at: this.completed_at,
      exp_earned: this.exp_earned,
      current_question: this.getCurrentQuestionId()
    };
  }

  toString() {
    const username = typeof this.user === 'object' ? this.user.username : 'Unknown User';
    const competitionTitle = typeof this.competition === 'object' ? this.competition.title : 'Unknown Competition';
    return `${username} - ${competitionTitle} (${this.status})`;
  }
}
