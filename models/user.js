/** import db instance */
const getConnection = require('./connect');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require('../config');
const ExpressError = require('../helpers/ExpressError');
const { createUserDocument } = require('../helpers/createDocument');
const jwt = require('jsonwebtoken');
const generateVerificationCode = require('../helpers/generateVerificationCode');
const Email = require('../services/email');

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

    /**
     * Takes an email string as only arguement and returns a boolean value
     * depending on whether a user exists in the database corresponding input
     * 
     * @param {String} email 
     */
    static async exists(email) {
        // establish connection with server
        const [db, client] = await getConnection();
        try {
            //retrieve resource 
            const query = { email: { $eq: email } }; // query statement
            const cursor = await db.collection('users').find(query); // database operation
            const [ result ] = await cursor.toArray(); // destructures result

            // return false (that the there is no existing user related to passed email) if !result, else return true
            return !result ? false : true;
        } catch (err) {
            // throw internal server error
            throw new ExpressError(err.message, 500);
        } finally {
            // close connection to db client
            client.close();
        }
    }

    /** pass in an email and get back corresponding user object if exists, otherwise
     *  return null
     * 
     * @param {String} email unique email id of the user to be retrieved
     * @param {Boolean} isFiltered defaults to false, can be passed `true` optionally to omit secure account fields like password hash
     * @param {Boolean} allData defaults to fale, can be passed `true` optionally to include all workspace objects as oposed to just object ids
     */
    static async getUserByEmail(email, isFiltered=false, allData=false) {
        //establish connection with db server
        const [ db, client ] = await getConnection();        
        try {
            // initialize return object
            const returnObject = {};



            //retrieve resource 
            const query = { email: { $eq: email } }; // query statement
            const cursor = await db.collection('users').find(query); // database operation
            const [ result ] = await cursor.toArray(); // destructures result

            if (!result) throw new ExpressError('No user was found', 404);

            if (allData) {
                if (result.workspaces && result.workspaces.length > 0) {
                    // find all workspace documents with an _id property included in the provided array
                    // returns a cursor type that must be parsed
                    const cursor = await db.collection('workspaces').find({
                        _id: {
                            $in: [
                                ...result.workspaces
                            ]
                        }
                    });
                    
                    // parse cursor and return an array
                    const fullWorkspaceData = await cursor.toArray();     
                    
                    // set workspace data into return object
                    returnObject.allWorkspaceData = fullWorkspaceData;                    
                } else {
                    returnObject.allWorkspaceData = [];
                };
            };

            // if `isFiltered` passed as true, filter account object before returning results
            if (isFiltered) {
                const { account } = result;
                const filteredAccount = { name: account.name, isVerified: account.isVerified, isAdmin: account.isAdmin };

                return {
                    ...returnObject, // if allData is not triggered this will be empty
                    ...result, // this spreads all of the original results into the new object
                    account: filteredAccount // and finally this will overwrite any previous instances of an account property
                };
            };


            // return any contents of our returnObject accumulator in addition the results of our user query
            return {
                ...returnObject,
                ...result
            };

        } catch(err) {
            throw new ExpressError(err.message, err.status || 500);
        } finally {
            client.close();
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

        //establish connection
        const [ db, client ] = await getConnection();
        
        try {
            //derive boolean from result
            const alreadyInUse = await User.exists(email);

            //throw error if true (that there is already a user with that email)
            if (alreadyInUse) throw new ExpressError('The email you chose is already in use', 409);
            
            //generate verification code
            const verificationCode = generateVerificationCode();

            //hash password
            const hashedPassword = await User.hashPassword(password);

            //hash verification code
            const hashedVerificationCode = await User.hashPassword(String(verificationCode));

            /** Given the input information, build a full user document that can be inserted into the database */
            const fullSchema = createUserDocument({name, email, password: hashedPassword, isAdmin: false, verificationCode: hashedVerificationCode});

            // insert full user document into database collection
            await db.collection('users').insertOne(fullSchema);

            
            // send verification email
            /**
             * TEMPORARILY REMOVING THE BELOW LINE UNTIL MAILGUN IS FIXED:
             * 
             * await User.sendVerificationEmail(email, verificationCode);
             * 
             */

            //return success message
            return { message: "Registration successful!" };

        } catch (err) {
            //throw error if necessary
            throw new ExpressError(err.message, err.status);
        }

        finally {
            client.close();
        }
    }

    /** 
     * Accepts an email and updates array as args
     */
    static async update (email, updates) {
        const [ db, client ] = await getConnection();
        try {
            const updatesObj = {};

            updates.forEach(o => (updatesObj[o.field] = o.value));

            const result = await db.collection('users').updateOne(
                {email},
                {
                    $set: {...updatesObj, 'metadata.lastModified': new Date()}
                }
            );

            const { matchedCount, modifiedCount } = result;

            if ( !matchedCount || !modifiedCount ) {
                throw new ExpressError('Resource either could not be found, or could not be updated, or both', 404)
            }
            
            return result;

        } catch(err) {
            throw new ExpressError(err.message, err.status || 500);
        }

        finally {
            client.close();
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

    /** Takes an object containing email and password. If credentials match a user in database, return a token
     * 
     * @param {Object} credentials - object containing username and password
     * @param {String} credentials.email - unique user identifier string
     * @param {String} credentials.password - plain text password to compare
     * 
     * @returns {Promise {Object} } - object containing `{ token: <String>, uid: <String>, isVerified: <Boolean>, email: <String> }`
     */
    static async login({email, password}) {
        try {
            const user = await User.getUserByEmail(email);
            const { _id, account } = user;
            const { name, isVerified, isAdmin } = account;
            if (user) {
                if (await bcrypt.compare(password, user.account.password)) {
                    const token = jwt.sign({ email, _id, isVerified, isAdmin, name }, SECRET_KEY);
                    return { token, uid: _id, isVerified, email };
                }
            }

            throw new ExpressError('Invalid username or password', 401);   
        } catch(err) {
            throw(err);
        }
    }

    static async sendVerificationEmail(email, verificationCode) {
        try {
            const subject = 'Earlystage Due Diligence Email Verification'
            const text = `Log in to your account and enter the following verification code to get started: ${verificationCode}`;
            await Email.send(email, subject, text);
        } catch(err) {
            throw new ExpressError(err.message, err.status || 500);
        }
    }


    /** 
     * Given an email and verification code, verify the users account or throw error
     * 
    */
    static async verifyAccount(email, code) {
        try {

            // get user object by email
            const user = await User.getUserByEmail(email);

            //if no user found through Not Found error
            if (!user) throw new ExpressError('No user found for this email', 404);

            // compare input code against hashed version in database
            if (await bcrypt.compare(code, user.account.verificationCode)) {
                // if matched, verify account

                //get database connection
                const [ db, client ] = await getConnection();

                //verify user
                const result = await db.collection('users').updateOne(
                    { email: { $eq: email } },
                    { $set: { 'account.isVerified': true, 'metadata.lastModified': new Date() } }
                );

                //close connection
                client.close();

                //return result
                return result;
            }

            throw new ExpressError('Incorrect code, account not verified', 401)

        } catch (err) {
            throw new ExpressError(err.message, err.status || 500);
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