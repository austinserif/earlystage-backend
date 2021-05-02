/** Contains logic for creating instance of mongodb connection */
const { MongoClient } = require('mongodb');
const { DB_URI, DB_NAME } = require('../../config');
const ExpressError = require('../../ExpressError');


/**
 * Instantiates a `MongoClient` instance and returns
 * an object containing methods for operating on them.
 */
async function mongoClientHandler() {
    try {
        // create new instance of MongoClient
        const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        //attempt connection to cluster
        await client.connect();
    
        // focus client connection on specific db in cluster
        const db = client.db(DB_NAME);

        return {
            /**
             * Returns instance of
             * specified collection. 
             * 
             * @param {String} collectionName 
             */
            getCollectionInstance(collectionName) {
                return db.collection(collectionName);
            },
            /**
             * Calls `client.close()` on the original `MongoClient`
             * instance.
             * 
             */
            async killSwitch() {
                try {
                    if (client) {
                        await client.close();
                        return;
                    }
                } catch (err) {
                    throw new ExpressError('Error occured while attempting to close database client', 500);
                }
            },
            /**
             * Returns boolean evaluation of
             * client connection
             */
            checkClientConnection() {
                return !!client;
            }
        }        
    } catch (err) {

    }
};

module.exports = { mongoClientHandler };