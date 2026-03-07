import TimeStampUUID from '../base/TimeStampUUID.js';

export default class CompetitionQuestion extends TimeStampUUID {
  constructor(data = {}) {
    super(data);
    this.competition = data.competition || null; // Competition ID or Competition object
    this.question = data.question || null; // Question ID or Question object
    this.order = data.order || 1;
    this.points = data.points || 1;
  }

  validate() {
    const errors = {};

    if (!this.competition) {
      errors.competition = 'Competition is required';
    }

    if (!this.question) {
      errors.question = 'Question is required';
    }

    if (this.order < 1) {
      errors.order = 'Order must be a positive integer';
    }

    if (this.points < 1) {
      errors.points = 'Points must be at least 1';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  getCompetitionId() {
    return typeof this.competition === 'object' ? this.competition.id : this.competition;
  }

  getQuestionId() {
    return typeof this.question === 'object' ? this.question.id : this.question;
  }

  setCompetition(competition) {
    this.competition = competition;
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

  updatePoints(points) {
    if (points >= 1) {
      this.points = points;
      this.touch();
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      competition: this.getCompetitionId(),
      question: this.getQuestionId(),
      order: this.order,
      points: this.points
    };
  }

  toString() {
    const competitionTitle = typeof this.competition === 'object' ? 
      this.competition.title : 'Unknown Competition';
    const questionText = typeof this.question === 'object' ? 
      this.question.question_text.substring(0, 50) : 'Unknown Question';
    return `${competitionTitle} - Q${this.order}: ${questionText}...`;
  }
}
