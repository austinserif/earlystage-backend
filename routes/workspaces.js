/** user.js file contains logic for  */

const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const router = express.Router();
const User = require('../models/user');
const Workspace = require('../models/workspace');
const { validateUpdatedWorkspace } = require('../middleware/schema-validation');
const { authorizeCertainUser } = require('../middleware/route-protection');

/**
 *  GET /users/:email/workspaces
*/
router.get('/:email/workspaces', authorizeCertainUser, async function(request, response, next) {
    try {
        const { email } = request.params;
        const res = await User.getUserByEmail(email);
        const { workspaces } = res;
        return response.json(workspaces);
    } catch(err) {
        return next(err);
    }
});

/** 
 * GET /users/workspaces/:email/:workspaceId 
 * 
 * */
router.get('/:email/workspaces/:workspaceId', authorizeCertainUser, async function(request, response, next) {
    try {
        const { email, workspaceId } = request.params;
        const res = await Workspace.getById(workspaceId, email);
        if (!!res) {
            return response.json(res);
        }
        throw new ExpressError('Unauthorized: You can only view your own workspaces', 401)
    } catch (err) {
        return next(err);
    }
});

/** 
 * POST /users/workspaces/:email
 * 
 * create a new workspace for a given user
 * 
 *  */
router.post('/:email/workspaces', authorizeCertainUser, async function(request, response, next) {
    try {
        const { email } = request.params;
        const { name, domain } = request.body;
        const res = await Workspace.new(email, { name, domain });
        return response.json(res);
    } catch(err) {
        return next(err);
    }
});

/** 
 * PATCH /users/workspaces/:email/:workspaceId
 * 
 * edit the name and domain fields of a workspace
 */
router.patch('/:email/workspaces/:workspaceId', authorizeCertainUser, validateUpdatedWorkspace, async function(request, response, next) {
    try {
        const { email, workspaceId } = request.params;

        const { updates } = request.body;

        //decode email
        const decodedEmail = decodeURIComponent(email);

        const res = await Workspace.update(workspaceId, decodedEmail, updates);
        return response.json(res);
    } catch(err) {
        return next(err);
    }
});

/** 
 * DELETE /users/workspaces/:email/:workspaceId
 * 
 * delete workspace object
 */
router.delete('/:email/workspaces/:workspaceId/', authorizeCertainUser, async function(request, response, next) {
    try {
        const { email, workspaceId } = request.params;

        //throw error if not authorized
        const res = await Workspace.delete(workspaceId, email);

        return response.json(res);
    } catch(err) {
        return next(err);
    }
})

module.exports = router;