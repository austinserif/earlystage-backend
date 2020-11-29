const express = require('express');
const ExpressError = require('../helpers/expressError');

const User = require('../models/user');
const Component = require('../models/component');
const jsonschema = require('jsonschema');
const { validateNewUser, validateUpdatedUser } = require('../middleware/schema-validation');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const { authorizeCertainUser, authorizeAdmin } = require('../middleware/route-protection');
const router = express.Router();


/**
 * POST /users/workspaces/components/:email/:workspaceId
 * 
 * create a new component
 */
router.post('/:email/:workspaceId', authorizeCertainUser, async function(request, response, next) {
    try {
        //get email and workspaceId from params object
        const { workspaceId } = request.params;
        const { questionId, answer } = request.body;

        //call `new` method on components model, passing in key data
        const result = await Component.new(questionId, workspaceId, answer);

        //return the result
        return response.json(result);

    } catch(err) {
        return next(err);
    }
});

module.exports = router;