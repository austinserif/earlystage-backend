const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const ExpressError = require('../helpers/expressError');

/** Looks for json web token in request, and assigns credentials 
 * to user as appropriate
*/
function authenticate(request, response, next) {
    try {
        //look for jwt in query string if not in request body
        const token = request.body._token || request.query._token;

        //verify jwt and extract paylaod, otherwise error will be thrown here
        const payload = jwt.verify(token, SECRET_KEY);
        
        //load user credentials into a user property on the request object. This payload 
        request.user = payload;

        response.locals.email = payload.email;
        return next();
    } catch (err) {
        // error in this middleware isn't error -- continue on
        return next();
    }
}

/** Require user or raise 401 */
function authorize(request, response, next) {
    if (!request.user) {
        const err = new ExpressError("Unauthorized", 401);
        return next(err);
    } else {
        return next();
    }
}

/** authorize user if the user is an admin */
function authorizeAdmin(request, response, next) {
    try {
        if (request.user.is_admin) {
            return next();
        }

        throw new ExpressError("Unauthorized, admin access only", 401);

    } catch(err) {
        return next(err);
    }
}

/** authorize user if username param matches username in payload
 * otherwise throw 401 error
 */
function authorizeCertainUser(request, response, next) {
    try {  
        if (request.user.username === request.params.username) {
            return next();
        }

        throw new ExpressError("Unauthorized", 401);

    } catch(err) {
        return next(err);
    }
}

module.exports = {
    authenticate,
    authorize,
    authorizeAdmin,
    authorizeCertainUser
}