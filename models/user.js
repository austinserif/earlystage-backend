/** import db instance */
const getConnection = require('./connect');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require('../config');
const ExpressError = require('../helpers/ExpressError');
const createUserDocument = require('../helpers/createUserDocument');
const jwt = require('jsonwebtoken');

/** collection name constant */
const COLLECTION = "users";

/**
 * User Model, contains CRUD methods for accessing 
 * database resources that pertain to users.
 */
class User {

    /** Find and returns an array of all user objects
     * currently in database
    */
    static async getAllUsers() {
        try {
            //establish connection with db server
            const [ db, client ] = await getConnection();

            //retrieve CURSOR OBJECT containing pointers to all users from database
            const result = await db.collection('users').find({});

            //get object array from cursor
            const resultArray = await result.toArray();

            //if no users, throw 404
            if (!resultArray.length) throw new ExpressError('There are no users in the database', 404);

            //close database connection
            client.close();

            //return array
            return resultArray;
        } catch(err) {
            //throw express error
            if (client) client.close();
            throw new ExpressError(err.message, err.status || 500);
        }
    }

    /** pass in an email and get back corresponding user object if exists, otherwise
     *  return null
     */
    static async getUserByEmail(email) {
        try {
            //establish connection with db server
            const [ db, client ] = await getConnection();

            //retrieve resource 
            const result = await db.collection('users').findOne({ email: { $eq: email} });

            client.close();

            //return result object
            return result;
        } catch(err) {
            if (client) client.close();
            throw new ExpressError(err.message, err.status || 500);
        }
    }


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
        const [ db, client ] = await getConnection();
        try {
            //establish connection
            

            //derive boolean from result
            const alreadyInUse = !!(await User.getUserByEmail(email));

            //throw error if true (that there is already a user with that email)
            if (alreadyInUse) throw new ExpressError('The email you chose is already in use', 409);
            
            //hash password
            const hashedPassword = await User.hashPassword(password);

            /** place into full userobject schema */
            const fullSchema = createUserDocument({name, email, password: hashedPassword});

            //destructure ops array from result object
            const { ops } = await db.collection('users').insertOne(fullSchema);

            // get first item from array (should be just one item in there anyways!)
            const [ result ] = ops;

            //remove password hash from result object
            delete result.account.password;

            //
            // client.close();

            //return result
            return result;

        } catch (err) {
            //throw error if necessary
            throw new ExpressError(err.message, err.status);
        }

        finally {
            client.close();
        }
    }

    /** 
     * Accepts an email and modifiedAccount params and replaces the 
     * previous name and password in
     */
    static async updateName (email, modifiedName) {
        try {
            //establish connection with db server
            const [ db, client ] = await getConnection();

            const result = await db.collection('users').updateOne(
                {email},
                {
                    $set: {'account.name': modifiedName, 'metadata.lastModified': new Date()}
                }
            );

            const { matchedCount, modifiedCount } = result;

            if ( !matchedCount || !modifiedCount ) {
                throw new ExpressError('resource either could not be found, or could not be updated, or both', 404)
            }

            client.close();

            return result;

        } catch(err) {
            if (client) client.close();
            throw new ExpressError(err.message, err.status || 500);
        }
    }
    /** requires email, and password params, and deletes associated 
     * resource from database if credentials are validated. Should help to prevent 
     * accidental account deletion as well as accidental
     */
    static async delete (email, password) {
        try {
            //establish connection
            const [ db, client ] = await getConnection();

            //destructure ops array from collection result object
            const user = await User.getUserByEmail(email);

            console.log(user);

            if (await bcrypt.compare(password, user.account.password)) {
                const result = await db.collection('users').deleteOne({ email: { $eq: email} });
                client.close();
                return result;
            }

            throw new ExpressError('Unauthorized, please try again', 401);
        } catch(err) {
            throw new ExpressError(err.message, err.status || 500);
        }
    }

    /** Takes an object containing username and password. If credentials match a user in database, return a token
     * 
     * @param {Object} credentials - object containing username and password
     * @param {String} credentials.email - unique user identifier string
     * @param {String} credentials.password - plain text password to compare
     * 
     * @returns {Promise {Object} } - object containing token
     */
    static async login({email, password}) {
        try {
            const user = await User.getUserByEmail(email);
            const { _id, account } = user;
            const { name, isVerified } = account;
            if (user) {
                if (await bcrypt.compare(password, user.account.password)) {
                    const token = jwt.sign({ email, _id, isVerified, name }, SECRET_KEY);
                    return { token };
                }
            }

            throw new ExpressError('Invalid username or password', 401);   
        } catch(err) {
            throw(err);
        }
    }

     
    /** Take password string and return new hashed password
     * 
     * @param {String} password - password string
     * 
     */
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(Number(BCRYPT_WORK_FACTOR));
        const hashed = await bcrypt.hash(password, salt);
        return hashed;
    }
}

module.exports = User;