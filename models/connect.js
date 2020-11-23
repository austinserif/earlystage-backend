/** Contains logic for creating instance of mongodb connection */
const { MongoClient } = require('mongodb');
const { DB_URI, DB_NAME } = require('../config');
const ExpressError = require('../helpers/ExpressError');

/** returns a database */
const getConnection = async () => {
  
  
  try {
    //create a new database cluster client instance
    const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    //connect to database cluster
    await client.connect();

    //establish connection with specific database by name
    const db = client.db(DB_NAME);

    return [ db, client ];

  } catch (err) {
    //read msg to console
    console.log(err);

    //throw internal error
    throw new ExpressError('There was an error connecting with the server', 500);
  }
}

module.exports = getConnection;



