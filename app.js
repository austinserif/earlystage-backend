/** app.js file for earlystage due diligence */
const express = require("express");

const ExpressError = require("./helpers/ExpressError");

const morgan = require("morgan");

const cors = require("cors");

const app = express();

const { authenticate } = require('./middleware/route-protection');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// logging system
app.use(morgan("tiny"));

app.use(cors());

app.use(authenticate);

//include abstracted routes here
const users = require('./routes/users');
const auth = require('./routes/auth');
const register = require('./routes/register')

//"use" those routes here
app.use('/login', auth);
app.use('/users', users);
app.use('/register', register);

/** 404 handler */
app.use(function(request, response, next) {
  const err = new ExpressError("Not Found", 404);
  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, request, response, next) {
  response.status(err.status || 500);

  // only log stack errors in a dev or production env
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack);
  }

  return response.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
