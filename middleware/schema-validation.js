const userSchema = require('../schema/user/newUser.json');
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

module.exports = { validateNewUser };