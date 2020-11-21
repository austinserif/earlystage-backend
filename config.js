/** config file */
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "test";
const BCRYPT_WORK_FACTOR = process.env.BCRYPT_WORK_FACTOR;
const PORT = +process.env.PORT || 3000;

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "mongodb://127.0.0.1:27017";
  DB_NAME = "earlystage-due-diligence-test";
} else {
  DB_URI = process.env.DB_URI;
  DB_NAME = process.env.DB_NAME;
}

module.exports = {
  SECRET_KEY,
  PORT,
  DB_URI,
  DB_NAME,
  BCRYPT_WORK_FACTOR
};