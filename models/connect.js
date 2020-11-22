/** Contains logic for creating instance of mongodb connection */
const { MongoClient } = require('mongodb');
const { DB_URI, DB_NAME } = require('../config');

let db

MongoClient.connect(DB_URI, { useNewUrlParser: true }, (err, client) => {
  if (err) console.log(err);

  // Storing a reference to the database so you can use it later
  db = client.db(DB_NAME)

  console.log(db);

  console.log(`Connected MongoDB: ${DB_URI}`)
  console.log(`Database: ${DB_NAME}`)
});

module.exports = db;



