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
    try {
        if (!request.user) {
            const err = new ExpressError("Unauthorized, a valid token is required to access this resource", 401);
            return next(err);
        } else {
            const { isVerified } = request.user;
            if (!isVerified) {
                const err = new ExpressError("Unauthorized, please verify your email before logging in", 401);
                return next(err);
            }
            return next();
        }
    } catch(err) {
        return next(err);
    }
}

/** authorize user if the user is an admin */
function authorizeAdmin(request, response, next) {
    try {
        const { user } = request;

        if (!user || !user.is_admin) {
            const err = new ExpressError("Unauthorized, admin access only", 401);
            return next(err);
        }

        if (user.is_admin) {
            return next();
        }

        const err = new ExpressError("Unauthorized, admin access only", 401);
        return next(err);

    } catch(err) {
        return next(err);
    }
}

/** authorize user if username param matches username in payload
 * otherwise throw 401 error
 */
function authorizeCertainUser(request, response, next) {
    try {

        const { user, params } = request;

        if (!user) {
            const err = new ExpressError("Unauthorized, a valid token is required to access this resource", 401);
            return next(err);
        }

        const { isVerified } = user;
        if (!isVerified) {
            const err = new ExpressError("Unauthorized, please verify your email", 401);
            return next(err);
        }

        if (user.email === params.email) {
            return next();
        }

        const err = new ExpressError("Unauthorized, users are only allowed access to their own data", 401);
        return (next(err));

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