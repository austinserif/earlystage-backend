const userSchema = require('../schema/user/newUser.json');
const updateSchema = require('../schema/user/updateUser.json')
const jsonschema = require('jsonschema');
const ExpressError = require('../helpers/expressError');

/** validate data in client request body with json schema */
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

function validateUpdatedUser(request, response, next) {
    try {
        const { updates } = request.body;

        const parsedUpdates = JSON.parse(updates);

        const result = jsonschema.validate({updates: parsedUpdates}, updateSchema);

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

module.exports = { validateNewUser, validateUpdatedUser };