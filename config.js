/** config file */
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "test";
const PORT = +process.env.PORT || 4000;
const { MAILGUN_API_KEY,MAILGUN_SENDING_KEY, MAILGUN_PUBLIC_KEY, MAILGUN_BASE_URL, BCRYPT_WORK_FACTOR } = process.env;

let DB_URI;
let SENDER_DOMAIN;

if (process.env.NODE_ENV === "test") {
  DB_URI = process.env.TEST_DB_URI;
  DB_NAME = process.env.TEST_DB_NAME;
  SENDER_DOMAIN = process.env.TEST_SENDER_DOMAIN;
} else {
  DB_URI = process.env.DB_URI;
  DB_NAME = process.env.DB_NAME;
  SENDER_DOMAIN = process.env.SENDER_DOMAIN;
}

module.exports = {
  SECRET_KEY,
  PORT,
  DB_URI,
  DB_NAME,
  BCRYPT_WORK_FACTOR,
  SENDER_DOMAIN,
  MAILGUN_API_KEY,
  MAILGUN_PUBLIC_KEY,
  MAILGUN_BASE_URL,
  MAILGUN_SENDING_KEY
};
