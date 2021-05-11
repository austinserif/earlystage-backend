const axios = require('axios');
const ExpressError = require('../helpers/ExpressError');
const { 
    SENDER_DOMAIN, 
    MAILGUN_BASE_URL, 
    MAILGUN_SENDING_KEY 
} = require('../config');

/**
 * Function closure wraps the Mailgun API
 * and defines functions for handling basic
 * mail operations such as `send`.
 */
function email () {
    try {

        // begin return object with function definitions
        return {
            /**
             * Sends an email from postmaster email url to a specified `recipient`;
             * message contains `subject` line and `text` body values that are passed
             * as args.
             * 
             * @param {String} recipient email url of recipient
             * @param {String} subject subject line
             * @param {String} text email body
             */
            send: async function ({ recipient, subject, text }) {
                try {
                    // axios configuration object for post request
                    const config = {
                        method: "POST",
                        url: `${MAILGUN_BASE_URL}v3/${SENDER_DOMAIN}/messages`,
                        params: {
                            from: `Mailgun Sandbox <postmaster@${SENDER_DOMAIN}>`,
                            to: recipient,
                            subject,
                            text
                        },
                        auth: {
                            username: "api",
                            password: MAILGUN_SENDING_KEY
                        }
                    }

                    // executes the request and stores response in variable
                    const response = await axios(config);

                    // returns function with response
                    return response;
                } catch (err) {
                    // handles any thrown errors
                    throw new ExpressError(err.message, err.status || 500);
                }
            }
        }
    } catch (err) {
        // handle errors with setting up email
        throw new ExpressError(err.message, err.status || 500);
    }
};

module.exports = email;