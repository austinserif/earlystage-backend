const express = require('express');
const ExpressError = require('../helpers/ExpressError');

const Workspace = require('../models/workspace')
const User = require('../models/user');
const Component = require('../models/component');
const jsonschema = require('jsonschema');
const { validateNewUser, validateUpdatedUser } = require('../middleware/schema-validation');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const { authorizeCertainUser, authorizeAdmin } = require('../middleware/route-protection');
const router = express.Router();


/**
 * POST /users/:email/workspaces/:workspaceId/components
 * 
 * Takes workspaceId and email in the url params object, and a questionId + answer arguments in 
 * the request body, and creates a new object. The generated objectId for the new component will also 
 * be added to the components array on the workspace object corresponding to the input workspaceId.
 * 
 * The newly created object is returned if successful
 */
router.post('/:email/workspaces/:workspaceId/components', authorizeCertainUser, async function(request, response, next) {
    try {
        //get email and workspaceId from params object
        const { workspaceId, email } = request.params;
        const { questionId, answer } = request.body;

        //call `new` method on components model, passing in key data
        const result = await Component.new(email, questionId, workspaceId, answer);

        //return the result
        return response.json(result);

    } catch(err) {
        return next(err);
    }
});

router.get('/:email/workspaces/:workspaceId/components', async function(request, response, next) {
    try {
        const { workspaceId, email } = request.params; // gets params from request object
        const result = await Workspace.getAllWorkspaceData(workspaceId, email);
        return response.json(result); 
    } catch(err) {
        return next(err);
    }
});

router.get('/:email/workspaces/:workspaceId/components/:componentId', async function(request, response, next) {
    try {
        const { workspaceId, componentId } = request.params;

        const result = await Component.getById(workspaceId, componentId);

        return response.json(result);
    } catch(err) {
        return next(err);
    }
});

router.patch('/:email/workspaces/:workspaceId/components/:componentId', async function(request, response, next) {
    try {
        const { workspaceId, componentId, email } = request.params;

        const { updates } = request.body;

        await Component.update(workspaceId, componentId, email, updates);

        return response.json({message: "Resource successfully updated"});
    } catch(err) {
        return next(err);
    }
})

router.delete('/:email/workspaces/:workspaceId/components/:componentId', async function(request, response, next) {
    try {
        const { workspaceId, componentId, email } = request.params;

        await Component.delete(email, workspaceId, componentId);

        return response.json({message: "Resource deleted"});
    } catch {
        return next(err);
    }
});

module.exports = router;