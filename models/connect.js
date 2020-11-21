/** Contains logic for creating instance of mongodb connection */
const { MongoClient } = require('mongodb');
const { DB_URI } = require('../config');
const ExpressError = require('../helpers/ExpressError');

/** 
 * Attempts to establish connection with database cluster and returns
 * a connected database instance if successful. 
 * 
 * @param { String } dbName
 * 
 * @returns { MongoClient } 
 */
const connect = (dbName) => {

    //create a new database cluster client instance
    const client = new MongoClient(DB_URI, { useNewUrlParser: true });
    try {
        //connect to database cluster
        await client.connect();

        //establish connection with specific database by name
        const db = client.db(dbName);

        //return database client instance 
        return db;

    } catch (err) {
        //read msg to console
        console.error(err);

        //close client connection
        client.close();

        //throw internal error
        throw new ExpressError('There was an error connecting with the server', 500);
    }
}

module.exports = connect;



