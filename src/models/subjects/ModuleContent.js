import SoftDeleteModel from '../base/SoftDeleteModel.js';

/**
 * Model for managing content within module chapters (questions and theories).
 */
export default class ModuleContent extends SoftDeleteModel {
  constructor(data = {}) {
    super(data);
    this.chapter = data.chapter || null; // ModuleChapter ID or ModuleChapter object
    this.content_type = data.content_type || 'question';
    this.order = data.order || 1;
    this.question = data.question || null; // Question ID or Question object
    this.theory = data.theory || null; // Theory ID or Theory object
    this.created_by = data.created_by || null; // User ID or User object
  }

  /**
   * Content type choices
   */
  static CONTENT_TYPE_CHOICES = [
    ['question', 'Question'],
    ['theory', 'Theory']
  ];

  /**
   * Validate module content data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.chapter) {
      errors.chapter = 'Chapter is required';
    }

    if (!this.content_type) {
      errors.content_type = 'Content type is required';
    } else if (!ModuleContent.CONTENT_TYPE_CHOICES.some(([value]) => value === this.content_type)) {
      errors.content_type = 'Invalid content type';
    }

    if (this.order < 1) {
      errors.order = 'Order must be a positive integer';
    }

    // Validate content-specific fields
    if (this.content_type === 'question' && !this.question) {
      errors.question = 'Question must be set when content type is "question"';
    }

    if (this.content_type === 'theory' && !this.theory) {
      errors.theory = 'Theory must be set when content type is "theory"';
    }

    if (this.content_type === 'question' && this.theory) {
      errors.theory = 'Theory should not be set when content type is "question"';
    }

    if (this.content_type === 'theory' && this.question) {
      errors.question = 'Question should not be set when content type is "theory"';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get content title
   * @returns {string} Content title
   */
  get content_title() {
    if (this.content_type === 'question' && this.question) {
      const questionText = typeof this.question === 'object' ? 
        this.question.question_text : 'Unknown Question';
      return questionText.length > 100 ? 
        questionText.substring(0, 100) + '...' : 
        questionText;
    } else if (this.content_type === 'theory' && this.theory) {
      return typeof this.theory === 'object' ? this.theory.title : 'Unknown Theory';
    }
    return 'Unknown Content';
  }

  /**
   * Get content preview
   * @returns {string} Content preview
   */
  get content_preview() {
    if (this.content_type === 'question' && this.question) {
      const questionText = typeof this.question === 'object' ? 
        this.question.question_text : 'Unknown Question';
      return questionText.length > 100 ? 
        questionText.substring(0, 100) + '...' : 
        questionText;
    } else if (this.content_type === 'theory' && this.theory) {
      if (typeof this.theory === 'object') {
        return this.theory.description_preview;
      }
      return 'Unknown Theory';
    }
    return 'No content available';
  }

  /**
   * Get chapter ID
   * @returns {string|null} Chapter ID
   */
  getChapterId() {
    return typeof this.chapter === 'object' ? this.chapter.id : this.chapter;
  }

  /**
   * Get question ID
   * @returns {string|null} Question ID
   */
  getQuestionId() {
    return typeof this.question === 'object' ? this.question.id : this.question;
  }

  /**
   * Get theory ID
   * @returns {string|null} Theory ID
   */
  getTheoryId() {
    return typeof this.theory === 'object' ? this.theory.id : this.theory;
  }

  /**
   * Get created by user ID
   * @returns {string|null} User ID
   */
  getCreatedById() {
    return typeof this.created_by === 'object' ? this.created_by.id : this.created_by;
  }

  /**
   * Set chapter
   * @param {string|Object} chapter - Chapter ID or Chapter object
   */
  setChapter(chapter) {
    this.chapter = chapter;
    this.touch();
  }

  /**
   * Set question (clears theory)
   * @param {string|Object} question - Question ID or Question object
   */
  setQuestion(question) {
    this.question = question;
    this.theory = null;
    this.content_type = 'question';
    this.touch();
  }

  /**
   * Set theory (clears question)
   * @param {string|Object} theory - Theory ID or Theory object
   */
  setTheory(theory) {
    this.theory = theory;
    this.question = null;
    this.content_type = 'theory';
    this.touch();
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      ...super.toJSON(),
      chapter: this.getChapterId(),
      content_type: this.content_type,
      order: this.order,
      question: this.getQuestionId(),
      theory: this.getTheoryId(),
      created_by: this.getCreatedById()
    };
  }

  /**
   * String representation
   * @returns {string} String representation
   */
  toString() {
    const chapterName = typeof this.chapter === 'object' ? 
      this.chapter.module?.name || 'Unknown Module' : 'Unknown Module';
    return `${this.get_content_type_display()}: ${this.content_title} - ${chapterName}`;
  }

  /**
   * Get content type display name
   * @returns {string} Content type display name
   */
  get_content_type_display() {
    const choice = ModuleContent.CONTENT_TYPE_CHOICES.find(([value]) => value === this.content_type);
    return choice ? choice[1] : this.content_type;
  }
}
