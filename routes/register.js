/** POST /register
 * 
 * Takes an email string as a query string parameter
 * and attempts to register a new user object. If one 
 * already exists, or an error will be thrown from the 
 * database model method called inside the controller, 
 * and this controller will pass that error on to the client.
 * If the email is not yet registered, or registered and 
 * verification is just incomplete, the endpoint send a link
 * to the new user's email where they can complete registration.
 */
router.post('/', async function(request, response, next) {
    try {
        // get email from query string params
        const { email } = request.query;

        // TEMPORARY RESPONSE
        return response.json({ message: { header: "Your account has been created!", paragraph: "To activate your account, check your email inbox for a link to complete your registration" } });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;