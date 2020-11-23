/** import db instance */
const getConnection = require('./connect');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const ExpressError = require('../helpers/ExpressError');

/** collection name constant */
const COLLECTION = "users";

/**
 * User Model, contains CRUD methods for accessing 
 * database resources that pertain to users.
 */
class User {

    static async getAllUsers() {
        try {
            const db = await getConnection();
            const result = db.collection('users').find({});
            const resultArray = await result.toArray();
            return resultArray;
        } catch(err) {
            throw new Error();
        }
    }

    static async getUserByEmail(email) {
        try {
            const db = await getConnection();
            const result = await db.collection('users').findOne({ email: { $eq: email}});

            return result;
        } catch(err) {
            throw new Error();
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
        try {
            //establish connection
            const db = await getConnection();

            //derive boolean from result
            const alreadyInUse = !!(await User.getUserByEmail(email));

            //throw error if true (that there is already a user with that email)
            if (alreadyInUse) throw new ExpressError('The email you chose is already in use', 409);
            
            //hash password
            const hashedPassword = await User.hashPassword(password);

            //
            const { ops } = await db.collection('users').insertOne({name, email, password: hashedPassword});

            const result = ops[0];

            delete result.password;
            //if here return the result
            return result;

        } catch (err) {
            //throw error if necessary
            throw new ExpressError(err.message, err.status);
        }
    }

    /**  */
    static async update (email, user) {
        try {
            const db = await getConnection();

            const usr = await db.collection('users').findOneAndUpdate({ email: { $eq: email} });



            
        } catch(err) {
            throw new Error();
        }
    }

    static async delete (id) {}

     
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