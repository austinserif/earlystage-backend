/** user.js file contains logic for  */

const express = require('express');
const ExpressError = require('../helpers/expressError');
const router = express.Router();
const User = require('../models/user');
const Workspace = require('../models/workspace');
const jsonschema = require('jsonschema');
const { validateUpdatedWorkspace } = require('../middleware/schema-validation');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const { authorizeCertainUser, authorizeAdmin } = require('../middleware/route-protection');

/**
 *  GET /users/workspaces/:email
*/
router.get('/:email', authorizeCertainUser, async function(request, response, next) {
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
router.get('/:email/:workspaceId', authorizeCertainUser, async function(request, response, next) {
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
router.post('/:email', authorizeCertainUser, async function(request, response, next) {
    try {
        const { email } = request.params;
        const { name, domain } = request.body;
        const res = await Workspace.new(email, { companyName: name, companyDomain: domain});
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
router.patch('/:email/:workspaceId', authorizeCertainUser, validateUpdatedWorkspace, async function(request, response, next) {
    try {
        const { email, workspaceId } = request.params;

        const { updates } = request.body;

        //decode email
        const decodedEmail = decodeURIComponent(email);

        const res = await Workspace.update(workspaceId, decodedEmail, updates);

        return res;
    } catch(err) {
        return next(err);
    }
});

module.exports = router;