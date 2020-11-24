/** app.js file for earlystage due diligence */
const express = require("express");

const ExpressError = require("./helpers/expressError");

const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// add logging system
app.use(morgan("tiny"));


//include abstracçted routes here
const users = require('./routes/users');
const auth = require('./routes/auth');


//"use" those routes here
app.use('/login', auth);
app.use('/users', users);


/** 404 handler */
app.use(function(request, response, next) {
  const err = new ExpressError("Not Found", 404);
  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, request, response, next) {
  response.status(err.status || 500);
  console.error(err.stack);

  return response.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;