/** import db instance */
const db = require('./connect');

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
     * @param { Object } user
     * @param { String } user.name
     * @param { String } user.email
     * @param { String } user.password
     * 
     */

    static async create ({ name, email, password }) {
        try {
            //hash password
            const hashedPassword = await User.hashPassword(password);

            //create resource in database
            

            //throw specific error if resource already exists

            //return new user object if successful

        } catch (err) {
            //throw general error

            //throw resource duplicate error
        }

        finally {
            //close database connection
            await db.close();
        }
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