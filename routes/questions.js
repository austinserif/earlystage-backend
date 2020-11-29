const express = require('express');
const Question = require('../models/question');
const router = express.Router();

router.get('/:questionId', async function(request, response, next) {
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
router.post('/:email', async function(request, response, next) {
    try {
        //get email from params
        const { email } = request.params;

        //get question and category strings from request body
        const { question, category } = request.body;

        //get new question object 
        const result = await Question.new(question, category, email);

        //return new object
        return response.json(result);

    } catch(err) {
        return next(err);
    }
});

module.exports = router;