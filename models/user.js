/** import db instance */
const db = require('./connect');

const ExpressError = require('../helpers/ExpressError');

/** collection name constant */
const COLLECTION = "users";

/**
 * User Model, contains CRUD methods for accessing 
 * database resources that pertain to users.
 */
class User {
    /** 
     * Creates a new user resource in database
     * if one does not already exist with the same 
     * email based id hash.
     *
     * 
     * @param { Object } user
     * @param { String } user.name
     * @param { String } user.email
     * @param { String } user.password
     * 
     * NOTE: Should return an `ExpressError` with 409 status code if email already in use.
     */

    static async createNewUser ({ name, email, password }) {
        try {
            // check if email already exists in the database
            if (!db.users.findOne({ email: { $eq: email}})) {
                throw new ExpressError('The email you chose is already in use', 409);
            }

            //hash password
            const hashedPassword = User.hashPassword(password);

            //create resource in database
            const result = await db.users.insert({
                name,
                email,
                password: hashedPassword
            });

            //return new user object if successful
            return result;

        } catch (err) {
            //throw error if necessary
            throw new ExpressError(err.message, err.status);
        }

        // finally {
        //     //close database connection
        //     await db.close();
        // }
    }

    /**  */
    static async read (id) {}

    /**  */
    static async update (id, user) {}

    static async delete (id) {}

     
    /** Take password string and return new hashed password
     * 
     * @param {String} password - password string
     * 
     * @returns {String} - hashed password string
     * 
     */
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(Number(BCRYPT_WORK_FACTOR));
        const hashed = await bcrypt.hash(password, salt);
        return hashed;
    }
}

module.exports = User;