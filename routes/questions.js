const express = require('express');
const Question = require('../models/question');
const { authorizeCertainUser, authorizeAdmin } = require('../middleware/route-protection');
const router = express.Router();

/**
 */
router.get('/:email/questions/:questionId', authorizeCertainUser, async function(request, response, next) {
    try {
        //get questionId from params
        const { questionId } = request.params;

        //retrieve question object given question id
        const result = await Question.getById(questionId);

        //return result
        return response.json(result);

    } catch(err) {
        return next(err);
    }
});

/** 
 * Takes `question` and `category` strings as arguments in the request body, and `email` as 
 * a request param, and returns a new question object containing an _id value IF the input category
 * matches one in the system. The new question will contain a field associating the object 
 * with the user who created it.
 */
router.post('/:email/questions', async function(request, response, next) {
    try {
        //get email from params
        const { email } = request.params;

        //get question and category strings from request body
        const { question, category, answerType } = request.body;

        //get new question object 
        const result = await Question.new(question, category, email, false);

        //return new object
        return response.status(201).json(result);

    } catch(err) {
        return next(err);
    }
});

router.post('/:email/questions/admin', authorizeAdmin, async function(request, response, next) {
    try {
        const email = undefined;

        const { question, category } = request.body;

        const result = await Question.new(question, category, email, true);

        return response.json(result);
    } catch(err) {

    }
})

router.get('/:email/questions', async function(request, response, next) {
    try {
        const { email } = request.params;

        const result = await Question.getAllQuestions(email);

        return response.json(result);
    } catch(err) {
        return next(err);
    }
});

router.delete('/:email/questions/:questionId', authorizeCertainUser, async function(request, response, next) {
    try {

        //get email and questionId
        const { email, questionId } = request.params;

        //delete question, will throw error if match could not be made
        await Question.delete(email, questionId);

        //return
        return response.json({message: "Resource deleted"});

    } catch(err) {
        return next(err);
    }
});

module.exports = router;