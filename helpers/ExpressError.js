/** 
 * ExpressError extends the normal JS error so we can easily
 *  add a message and status by passing them as arguments to the 
 * constructor when we make an instance of it.
 * 
 * @example
 * ```js
 *  try {
 *  //logic here...
 * } catch(err) {
 *    throw new ExpressError(err.message, err.status || 500);
 * }
 * ```
 *
 *  Since we are using JSONSchema and will return an array of
 *  errors we want to make sure we display that properly
 *  The error-handling middleware will return this.
 */
class ExpressError extends Error {
    constructor(message, status) {
      super();
      this.message = message;
      this.status = status;
      console.error(this.stack);
    }
  }
  
  module.exports = ExpressError;