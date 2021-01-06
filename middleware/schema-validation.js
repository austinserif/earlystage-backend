const userSchema = require('../schema/user/newUser.json');
const updateUserSchema = require('../schema/user/updateUser.json')
const updateWorkspaceSchema = require('../schema/workspace/updateWorkspace.json');
const jsonschema = require('jsonschema');
const ExpressError = require('../helpers/ExpressError');

/** 
 * Validate data in client request body with json schema
 * for new user
 */
function validateNewUser(request, response, next) {
    try {
        const { email, name, password } = request.body;

        const result = jsonschema.validate({ email, name, password }, userSchema);

        if (result.errors.length) {
          // pass a 400 error to the error-usernamer
          let listOfErrors = result.errors.map(err => err.stack);
          const err = new ExpressError(listOfErrors, 400);
          return next(err);
        }
        return next();
    } catch(err) {
        return next(err);
    }
}

/** 
 * Validate data in client request body with json schema
 * for updated user
 */
function validateUpdatedUser(request, response, next) {
    try {
        const { updates } = request.body;

        const parsedUpdates = JSON.parse(updates);

        const result = jsonschema.validate({updates: parsedUpdates}, updateUserSchema);

        if (result.errors.length) {
            // pass a 400 error to the error-usernamer
            let listOfErrors = result.errors.map(err => err.stack);
            const err = new ExpressError(listOfErrors, 400);
            console.log(result);
            return next(err); 
        }

        request.body.updates = parsedUpdates;

        return next();
    } catch(err) {
        return next(err);
    }
}

/** 
 * Validate data in client request body with json schema
 * for updated workspace
 */
function validateUpdatedWorkspace(request, response, next) {
    try {
        const { updates } = request.body;

        const parsedUpdates = JSON.parse(updates);

        const result = jsonschema.validate({updates: parsedUpdates}, updateWorkspaceSchema);

        if (result.errors.length) {
            // pass a 400 error to the error-usernamer
            let listOfErrors = result.errors.map(err => err.stack);
            const err = new ExpressError(listOfErrors, 400);
            console.log(result);
            return next(err); 
        }

        request.body.updates = parsedUpdates;

        return next();

    } catch(err) {
        return next(err);
    }
}

module.exports = { validateNewUser, validateUpdatedUser, validateUpdatedWorkspace };