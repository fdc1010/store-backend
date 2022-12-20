const express = require('express');
const router = express.Router();
const FAQHandler = require('../../handlers/v1/faq');

router.get('/questions', FAQHandler.getAllQuestions);
router.post('/answer', FAQHandler.getAnswers);

module.exports = router;
