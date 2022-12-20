const db = require('../../configs/sequelize');

class FAQHandler {
  async getAllQuestions(req, res) {
    const questions = await db.models.faqs
      .findAll({
        attributes: ['id', 'question', 'category']
      });
    
    const results = {};
    for (const question of questions) {
      if (!results[question.category]) results[question.category] = [];
      results[question.category].push(question);
    }
    
    return BaseResponse.Success(res, 'Question successfully retrieved', {
      questions: results
    })
  }

  async getAnswers(req, res) {
    const questionId = req.body.question_id;
    const question = await db.models.faqs.findOne({
      where: {
        id: questionId
      }
    })

    if (!question) return BaseResponse.BadResponse(res, 'Question not found');
    
    return BaseResponse.Success(res, 'Answers successfully retrieved', {
      question
    })
  }
}

module.exports = new FAQHandler;
