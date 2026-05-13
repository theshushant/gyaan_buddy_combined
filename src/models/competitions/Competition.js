import SoftDeleteModel from '../base/SoftDeleteModel.js';

export default class Competition extends SoftDeleteModel {
  constructor(data = {}) {
    super(data);
    this.title = data.title || '';
    this.description = data.description || '';
    this.code = data.code || '';
    this.competition_type = data.competition_type || 'subject';
    this.subject = data.subject || null; // Subject ID or Subject object
    this.chapter = data.chapter || null; // ModuleChapter ID or ModuleChapter object
    this.total_time = data.total_time || 60; // in minutes
    this.status = data.status || 'not_started';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_by = data.created_by || null; // User ID or User object
    this.questions = data.questions || []; // Array of Question IDs or Question objects
    this.participants = data.participants || []; // Array of User IDs or User objects
  }

  static COMPETITION_TYPE_CHOICES = [
    ['subject', 'Subject Only'],
    ['subject_with_chapter', 'Subject with Chapter'],
    ['random', 'Random Questions']
  ];

  static STATUS_CHOICES = [
    ['not_started', 'Not Started'],
    ['in_progress', 'In Progress'],
    ['completed', 'Completed']
  ];

  validate() {
    const errors = {};

    if (!this.title || this.title.trim().length === 0) {
      errors.title = 'Competition title is required';
    } else if (this.title.length > 200) {
      errors.title = 'Competition title must be 200 characters or less';
    }

    if (!this.code || this.code.trim().length === 0) {
      errors.code = 'Competition code is required';
    } else if (this.code.length > 10) {
      errors.code = 'Competition code must be 10 characters or less';
    }

    if (!this.competition_type) {
      errors.competition_type = 'Competition type is required';
    } else if (!Competition.COMPETITION_TYPE_CHOICES.some(([value]) => value === this.competition_type)) {
      errors.competition_type = 'Invalid competition type';
    }

    if (!this.subject) {
      errors.subject = 'Subject is required';
    }

    if (this.competition_type === 'subject_with_chapter' && !this.chapter) {
      errors.chapter = 'Chapter is required for subject with chapter competition';
    }

    if (this.total_time < 1) {
      errors.total_time = 'Total time must be at least 1 minute';
    }

    if (!this.status) {
      errors.status = 'Status is required';
    } else if (!Competition.STATUS_CHOICES.some(([value]) => value === this.status)) {
      errors.status = 'Invalid status';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  generateCode() {
    if (!this.code) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.code = code;
    }
  }

  start() {
    this.status = 'in_progress';
    this.touch();
  }

  complete() {
    this.status = 'completed';
    this.touch();
  }

  activate() {
    this.is_active = true;
    this.touch();
  }

  deactivate() {
    this.is_active = false;
    this.touch();
  }

  addQuestion(question) {
    const questionId = typeof question === 'object' ? question.id : question;
    if (!this.questions.includes(questionId)) {
      this.questions.push(questionId);
      this.touch();
    }
  }

  removeQuestion(question) {
    const questionId = typeof question === 'object' ? question.id : question;
    this.questions = this.questions.filter(id => id !== questionId);
    this.touch();
  }

  addParticipant(user) {
    const userId = typeof user === 'object' ? user.id : user;
    if (!this.participants.includes(userId)) {
      this.participants.push(userId);
      this.touch();
    }
  }

  removeParticipant(user) {
    const userId = typeof user === 'object' ? user.id : user;
    this.participants = this.participants.filter(id => id !== userId);
    this.touch();
  }

  hasQuestion(question) {
    const questionId = typeof question === 'object' ? question.id : question;
    return this.questions.includes(questionId);
  }

  hasParticipant(user) {
    const userId = typeof user === 'object' ? user.id : user;
    return this.participants.includes(userId);
  }

  get question_count() {
    return this.questions.length;
  }

  get participant_count() {
    return this.participants.length;
  }

  getSubjectId() {
    return typeof this.subject === 'object' ? this.subject.id : this.subject;
  }

  getChapterId() {
    return typeof this.chapter === 'object' ? this.chapter.id : this.chapter;
  }

  getCreatedById() {
    return typeof this.created_by === 'object' ? this.created_by.id : this.created_by;
  }

  getQuestionIds() {
    return this.questions.map(question => 
      typeof question === 'object' ? question.id : question
    );
  }

  getParticipantIds() {
    return this.participants.map(user => 
      typeof user === 'object' ? user.id : user
    );
  }

  toJSON() {
    return {
      ...super.toJSON(),
      title: this.title,
      description: this.description,
      code: this.code,
      competition_type: this.competition_type,
      subject: this.getSubjectId(),
      chapter: this.getChapterId(),
      total_time: this.total_time,
      status: this.status,
      is_active: this.is_active,
      created_by: this.getCreatedById(),
      questions: this.getQuestionIds(),
      participants: this.getParticipantIds()
    };
  }

  toString() {
    return `${this.title} (${this.code})`;
  }
}
