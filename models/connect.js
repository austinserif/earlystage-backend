/** Contains logic for creating instance of mongodb connection */
const { MongoClient } = require('mongodb');
const { DB_URI, DB_NAME } = require('../config');

let db

MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  if (err) throw new ExpressError('Problem connecting to database', 500);

  // Storing a reference to the database so you can use it later
  db = client.db(DB_NAME)
  
  console.log(`Connected MongoDB: ${url}`)
  console.log(`Database: ${dbName}`)
});

module.exports = db;



